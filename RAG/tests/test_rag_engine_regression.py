import importlib
import sys
import types
import unittest
from pathlib import Path
from types import SimpleNamespace


RAG_DIR = Path(__file__).resolve().parents[1]
if str(RAG_DIR) not in sys.path:
    sys.path.insert(0, str(RAG_DIR))


def _install_dependency_stubs():
    dotenv = types.ModuleType("dotenv")
    dotenv.load_dotenv = lambda: None
    sys.modules.setdefault("dotenv", dotenv)

    huggingface_hub = types.ModuleType("huggingface_hub")

    class InferenceClient:
        def __init__(self, *args, **kwargs):
            self.args = args
            self.kwargs = kwargs

        def feature_extraction(self, input, model=None):
            return []

        def chat_completion(self, *args, **kwargs):
            return SimpleNamespace(
                choices=[
                    SimpleNamespace(
                        message=SimpleNamespace(content="termo técnico")
                    )
                ]
            )

    huggingface_hub.InferenceClient = InferenceClient
    sys.modules.setdefault("huggingface_hub", huggingface_hub)

    chromadb = types.ModuleType("chromadb")

    class EmbeddingFunction:
        pass

    class PersistentClient:
        def __init__(self, *args, **kwargs):
            self.args = args
            self.kwargs = kwargs

        def get_or_create_collection(self, *args, **kwargs):
            raise AssertionError("Teste deve injetar uma coleção falsa")

    chromadb.EmbeddingFunction = EmbeddingFunction
    chromadb.Documents = list
    chromadb.Embeddings = list
    chromadb.PersistentClient = PersistentClient
    sys.modules.setdefault("chromadb", chromadb)

    rank_bm25 = types.ModuleType("rank_bm25")

    class BM25Okapi:
        def __init__(self, tokenized_corpus):
            self.tokenized_corpus = tokenized_corpus

        def get_scores(self, tokenized_query):
            query_terms = set(tokenized_query)
            return [
                sum(1 for token in document if token in query_terms)
                for document in self.tokenized_corpus
            ]

    rank_bm25.BM25Okapi = BM25Okapi
    sys.modules.setdefault("rank_bm25", rank_bm25)

    sentence_transformers = types.ModuleType("sentence_transformers")

    class CrossEncoder:
        def __init__(self, *args, **kwargs):
            self.args = args
            self.kwargs = kwargs

        def predict(self, pairs):
            return [0.0 for _ in pairs]

    sentence_transformers.CrossEncoder = CrossEncoder
    sys.modules.setdefault("sentence_transformers", sentence_transformers)


def _chat_response(content):
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
    )


_install_dependency_stubs()
rag_engine = importlib.import_module("rag_engine")


class FakeCollection:
    def __init__(self, dense_results, all_results):
        self.dense_results = dense_results
        self.all_results = all_results
        self.queries = []

    def query(self, **kwargs):
        self.queries.append(kwargs)
        return self.dense_results

    def get(self, **kwargs):
        return self.all_results


class RagEngineRegressionTests(unittest.TestCase):
    def setUp(self):
        self.original_get_collection = rag_engine.get_chroma_collection
        self.original_get_reranker = rag_engine.get_reranker
        self.original_inference_client = rag_engine.InferenceClient
        self.original_expand_query = rag_engine.expand_query_safely
        self.original_hybrid_retrieve = rag_engine.hybrid_retrieve
        self.original_rerank_candidates = rag_engine.rerank_candidates
        self.original_listar_documentos = rag_engine.listar_documentos

    def tearDown(self):
        rag_engine.get_chroma_collection = self.original_get_collection
        rag_engine.get_reranker = self.original_get_reranker
        rag_engine.InferenceClient = self.original_inference_client
        rag_engine.expand_query_safely = self.original_expand_query
        rag_engine.hybrid_retrieve = self.original_hybrid_retrieve
        rag_engine.rerank_candidates = self.original_rerank_candidates
        rag_engine.listar_documentos = self.original_listar_documentos

    def test_expand_query_combines_glossary_terms_and_llm_terms(self):
        fake_client = SimpleNamespace(
            chat_completion=lambda **kwargs: _chat_response("hazard assessment\nsoftware")
        )

        expanded_query = rag_engine.expand_query_safely(
            "Como aplicar FHA em software crítico?", fake_client
        )

        self.assertIn("Como aplicar FHA em software crítico?", expanded_query)
        self.assertIn("FHA Functional Hazard Assessment análise de perigos", expanded_query)
        self.assertIn("hazard assessment software", expanded_query)

    def test_expand_query_falls_back_to_static_expansion_when_llm_fails(self):
        class FailingClient:
            def chat_completion(self, **kwargs):
                raise RuntimeError("serviço indisponível")

        expanded_query = rag_engine.expand_query_safely(
            "Quais requisitos de DAL?", FailingClient()
        )

        self.assertIn("Quais requisitos de DAL?", expanded_query)
        self.assertIn("DAL Development Assurance Level criticidade de software", expanded_query)

    def test_hybrid_retrieve_merges_dense_and_sparse_candidates_with_rrf(self):
        collection = FakeCollection(
            dense_results={
                "documents": [["dense somente", "doc compartilhado", "doc sparse forte"]],
                "metadatas": [[
                    {"filename": "dense.pdf", "page": 1},
                    {"filename": "shared.pdf", "page": 2},
                    {"filename": "sparse.pdf", "page": 3},
                ]],
                "ids": [["dense", "shared", "sparse"]],
            },
            all_results={
                "ids": ["sparse", "shared", "outro"],
                "documents": [
                    "fha software critical safety",
                    "software assurance",
                    "manual sem relação",
                ],
                "metadatas": [
                    {"filename": "sparse.pdf", "page": 3},
                    {"filename": "shared.pdf", "page": 2},
                    {"filename": "outro.pdf", "page": 9},
                ],
            },
        )
        rag_engine.get_chroma_collection = lambda: collection

        docs, metas = rag_engine.hybrid_retrieve(
            "fha software", top_k_dense=3, top_k_sparse=2, final_candidates=2
        )

        self.assertEqual(docs, ["doc sparse forte", "doc compartilhado"])
        self.assertEqual(
            metas,
            [
                {"filename": "sparse.pdf", "page": 3},
                {"filename": "shared.pdf", "page": 2},
            ],
        )
        self.assertEqual(collection.queries[0]["query_texts"], ["fha software"])

    def test_rerank_candidates_sorts_by_cross_encoder_score_and_limits_results(self):
        class FakeReranker:
            def predict(self, pairs):
                self.pairs = pairs
                return [0.15, 0.92, 0.45]

        fake_reranker = FakeReranker()
        rag_engine.get_reranker = lambda: fake_reranker

        docs, metas = rag_engine.rerank_candidates(
            "pergunta",
            ["doc baixo", "doc alto", "doc médio"],
            [{"page": 1}, {"page": 2}, {"page": 3}],
            top_n=2,
        )

        self.assertEqual(docs, ["doc alto", "doc médio"])
        self.assertEqual(metas, [{"page": 2}, {"page": 3}])
        self.assertEqual(
            fake_reranker.pairs,
            [["pergunta", "doc baixo"], ["pergunta", "doc alto"], ["pergunta", "doc médio"]],
        )

    def test_generate_answer_orchestrates_pipeline_and_returns_sources(self):
        calls = []

        class FakeClient:
            def chat_completion(self, **kwargs):
                calls.append(kwargs)
                return _chat_response("resposta final")

        rag_engine.InferenceClient = lambda **kwargs: FakeClient()
        rag_engine.expand_query_safely = lambda query, client: f"{query} expandida"
        rag_engine.hybrid_retrieve = lambda query, final_candidates: (
            ["candidato 1", "candidato 2"],
            [{"filename": "cand1.pdf", "page": 10}, {"filename": "cand2.pdf", "page": 20}],
        )
        rag_engine.rerank_candidates = lambda query, docs, metas, top_n: (
            ["trecho final"],
            [{"filename": "final.pdf", "page": 7}],
        )
        rag_engine.listar_documentos = lambda: ["final.pdf", "manual.pdf"]

        result = rag_engine.generate_answer("O que é DAL?")

        self.assertEqual(result["answer"], "resposta final")
        self.assertEqual(result["sources"], [{"filename": "final.pdf", "page": 7}])
        self.assertEqual(calls[0]["messages"][0]["role"], "system")
        user_prompt = calls[0]["messages"][1]["content"]
        self.assertIn("DOCUMENTOS INDEXADOS NO SISTEMA", user_prompt)
        self.assertIn("final.pdf", user_prompt)
        self.assertIn("trecho final", user_prompt)
        self.assertIn("O que é DAL?", user_prompt)

    def test_generate_answer_keeps_sources_when_llm_generation_fails(self):
        class FailingClient:
            def chat_completion(self, **kwargs):
                raise RuntimeError("timeout")

        rag_engine.InferenceClient = lambda **kwargs: FailingClient()
        rag_engine.expand_query_safely = lambda query, client: "consulta expandida"
        rag_engine.hybrid_retrieve = lambda query, final_candidates: (
            ["candidato"],
            [{"filename": "cand.pdf", "page": 2}],
        )
        rag_engine.rerank_candidates = lambda query, docs, metas, top_n: (
            ["trecho final"],
            [{"filename": "fonte.pdf", "page": 4}],
        )
        rag_engine.listar_documentos = lambda: ["fonte.pdf"]

        result = rag_engine.generate_answer("Pergunta")

        self.assertIn("Erro ao gerar resposta com o LLM: timeout", result["answer"])
        self.assertEqual(result["sources"], [{"filename": "fonte.pdf", "page": 4}])


if __name__ == "__main__":
    unittest.main()
