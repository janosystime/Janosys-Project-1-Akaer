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
        self.original_retrieve_context = rag_engine.retrieve_context
        self.original_call_llm = rag_engine.call_llm

    def tearDown(self):
        rag_engine.get_chroma_collection = self.original_get_collection
        rag_engine.get_reranker = self.original_get_reranker
        rag_engine.InferenceClient = self.original_inference_client
        rag_engine.expand_query_safely = self.original_expand_query
        rag_engine.hybrid_retrieve = self.original_hybrid_retrieve
        rag_engine.rerank_candidates = self.original_rerank_candidates
        rag_engine.listar_documentos = self.original_listar_documentos
        rag_engine.retrieve_context = self.original_retrieve_context
        rag_engine.call_llm = self.original_call_llm

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

    def test_retrieve_context_returns_structured_trechos_and_fontes(self):
        """retrieve_context deve retornar trechos com metadados completos."""
        rag_engine.InferenceClient = lambda **kwargs: SimpleNamespace(
            chat_completion=lambda **kw: _chat_response("termos")
        )
        rag_engine.hybrid_retrieve = lambda query, final_candidates: (
            ["texto do trecho 1", "texto do trecho 2"],
            [
                {"filename": "norma_a.pdf", "page": 5, "norma_id": "N1", "titulo": "Norma A", "organizacao": "ANAC", "categoria": "Geral"},
                {"filename": "norma_b.pdf", "page": 12, "norma_id": "N2", "titulo": "Norma B", "organizacao": "FAA", "categoria": "Peça"},
            ],
        )
        rag_engine.rerank_candidates = lambda query, docs, metas, top_n: (docs[:top_n], metas[:top_n])
        rag_engine.listar_documentos = lambda: ["norma_a.pdf", "norma_b.pdf"]

        result = rag_engine.retrieve_context("busca de teste", top_n=2)

        self.assertEqual(len(result["trechos"]), 2)
        self.assertEqual(result["trechos"][0]["filename"], "norma_a.pdf")
        self.assertEqual(result["trechos"][0]["norma_id"], "N1")
        self.assertEqual(result["trechos"][1]["page"], 12)
        self.assertEqual(len(result["fontes"]), 2)
        self.assertIn("norma_a.pdf", result["documentos_indexados"])

    def test_retrieve_context_without_expansion(self):
        """Com expand=False, não deve chamar expand_query_safely."""
        expand_chamado = []
        rag_engine.expand_query_safely = lambda q, c: expand_chamado.append(True) or q
        rag_engine.InferenceClient = lambda **kwargs: SimpleNamespace()
        rag_engine.hybrid_retrieve = lambda query, final_candidates: ([], [])
        rag_engine.rerank_candidates = lambda query, docs, metas, top_n: ([], [])
        rag_engine.listar_documentos = lambda: []

        result = rag_engine.retrieve_context("teste", expand=False)

        self.assertEqual(len(expand_chamado), 0)
        self.assertEqual(result["trechos"], [])

    def test_call_llm_returns_text_response(self):
        rag_engine.InferenceClient = lambda **kwargs: SimpleNamespace(
            chat_completion=lambda **kw: _chat_response("resposta do LLM")
        )

        resultado = rag_engine.call_llm(
            mensagens=[{"role": "user", "content": "Olá"}],
            max_tokens=100,
            temperature=0.5,
        )

        self.assertEqual(resultado, "resposta do LLM")

    def test_call_llm_handles_error_gracefully(self):
        class FailingClient:
            def chat_completion(self, **kwargs):
                raise RuntimeError("connection refused")

        rag_engine.InferenceClient = lambda **kwargs: FailingClient()

        resultado = rag_engine.call_llm(
            mensagens=[{"role": "user", "content": "teste"}],
        )

        self.assertEqual(resultado, "connection refused")

    def test_generate_answer_orchestrates_pipeline_and_returns_sources(self):
        rag_engine.retrieve_context = lambda query, top_n: {
            "trechos": [
                {"texto": "trecho final", "filename": "final.pdf", "page": 7,
                 "norma_id": "N1", "titulo": "T1", "organizacao": "O1", "categoria": "C1"},
            ],
            "fontes": [{"filename": "final.pdf", "page": 7}],
            "query_expandida": "query expandida",
            "documentos_indexados": ["final.pdf", "manual.pdf"],
        }

        chamadas_llm = []
        def fake_call_llm(mensagens, max_tokens=2048, temperature=0.6):
            chamadas_llm.append(mensagens)
            return "resposta final"

        rag_engine.call_llm = fake_call_llm

        result = rag_engine.generate_answer("O que é DAL?")

        self.assertEqual(result["answer"], "resposta final")
        self.assertEqual(result["sources"], [{"filename": "final.pdf", "page": 7}])
        self.assertEqual(chamadas_llm[0][0]["role"], "system")
        user_prompt = chamadas_llm[0][1]["content"]
        self.assertIn("DOCUMENTOS INDEXADOS NO SISTEMA", user_prompt)
        self.assertIn("final.pdf", user_prompt)
        self.assertIn("trecho final", user_prompt)
        self.assertIn("O que é DAL?", user_prompt)

    def test_generate_answer_keeps_sources_when_llm_generation_fails(self):
        rag_engine.retrieve_context = lambda query, top_n: {
            "trechos": [
                {"texto": "trecho final", "filename": "fonte.pdf", "page": 4,
                 "norma_id": "N1", "titulo": "", "organizacao": "", "categoria": ""},
            ],
            "fontes": [{"filename": "fonte.pdf", "page": 4}],
            "query_expandida": "consulta expandida",
            "documentos_indexados": ["fonte.pdf"],
        }
        rag_engine.call_llm = lambda mensagens, **kw: "Erro ao gerar resposta com o LLM: timeout"

        result = rag_engine.generate_answer("Pergunta")

        self.assertIn("Erro ao gerar resposta com o LLM: timeout", result["answer"])
        self.assertEqual(result["sources"], [{"filename": "fonte.pdf", "page": 4}])

    def test_analyze_compliance_uses_audit_prompt(self):
        prompts_usados = []

        rag_engine.retrieve_context = lambda query, top_n: {
            "trechos": [
                {"texto": "requisito X", "filename": "norma.pdf", "page": 1,
                 "norma_id": "N1", "titulo": "", "organizacao": "", "categoria": ""},
            ],
            "fontes": [{"filename": "norma.pdf", "page": 1}],
            "query_expandida": "expandida",
            "documentos_indexados": [],
        }

        def fake_call_llm(mensagens, max_tokens=2048, temperature=0.3):
            prompts_usados.append(mensagens[0]["content"])
            return "✅ Conforme"

        rag_engine.call_llm = fake_call_llm

        result = rag_engine.analyze_compliance("Relatório de teste")

        self.assertEqual(result["analysis"], "✅ Conforme")
        self.assertIn("auditor", prompts_usados[0].lower())
        self.assertNotIn("chatbot", prompts_usados[0].lower())

    def test_analyze_compliance_filters_by_norma_ids(self):
        rag_engine.retrieve_context = lambda query, top_n: {
            "trechos": [
                {"texto": "trecho N1", "filename": "a.pdf", "page": 1,
                 "norma_id": "N1", "titulo": "", "organizacao": "", "categoria": ""},
                {"texto": "trecho N2", "filename": "b.pdf", "page": 2,
                 "norma_id": "N2", "titulo": "", "organizacao": "", "categoria": ""},
            ],
            "fontes": [{"filename": "a.pdf", "page": 1}, {"filename": "b.pdf", "page": 2}],
            "query_expandida": "",
            "documentos_indexados": [],
        }

        textos_recebidos = []
        def fake_call_llm(mensagens, **kw):
            textos_recebidos.append(mensagens[1]["content"])
            return "análise"

        rag_engine.call_llm = fake_call_llm

        result = rag_engine.analyze_compliance("relatório", norma_ids=["N1"])

        self.assertIn("trecho N1", textos_recebidos[0])
        self.assertNotIn("trecho N2", textos_recebidos[0])
        self.assertEqual(len(result["sources"]), 1)

    def test_extrair_filtros_query_extracts_page_and_norm(self):
        res = rag_engine.extrair_filtros_query("o que diz a página 16 da norma rbac")
        self.assertEqual(res["paginas"], [16])
        self.assertEqual(res["norma_hint"], "rbac")

        res = rag_engine.extrair_filtros_query("página 5 e 6 do RBAC 25.1309")
        self.assertEqual(res["paginas"], [5, 6])
        self.assertEqual(res["norma_hint"], "rbac 25.1309")

        res = rag_engine.extrair_filtros_query("páginas 12 a 15 do SAE ARP 4754")
        self.assertEqual(res["paginas"], [12, 13, 14, 15])
        self.assertEqual(res["norma_hint"], "sae arp 4754")

        res = rag_engine.extrair_filtros_query("requisitos do p. 42 da norma far 25")
        self.assertEqual(res["paginas"], [42])
        self.assertEqual(res["norma_hint"], "far 25")

        res = rag_engine.extrair_filtros_query("itens na pg 10 e 11 do cs-25")
        self.assertEqual(res["paginas"], [10, 11])
        self.assertEqual(res["norma_hint"], "cs-25")

        res = rag_engine.extrair_filtros_query("norma SAE ARP 4761")
        self.assertEqual(res["paginas"], [])
        self.assertEqual(res["norma_hint"], "sae arp 4761")

        res = rag_engine.extrair_filtros_query("requisitos de segurança de software")
        self.assertEqual(res["paginas"], [])
        self.assertEqual(res["norma_hint"], None)

    def test_busca_por_metadados_filters_correctly(self):
        collection = FakeCollection(
            dense_results={},
            all_results={
                "ids": ["id1", "id2", "id3", "id4"],
                "documents": [
                    "requisito de software rbac 25",
                    "requisito de hardware rbac 25",
                    "requisito arp 4761",
                    "outro documento sem metadados válidos"
                ],
                "metadatas": [
                    {"filename": "rbac-25.pdf", "page": 5},
                    {"filename": "rbac-25.pdf", "page": 10},
                    {"filename": "arp-4761.pdf", "page": 5},
                    {"filename": "", "page": None},
                ],
            },
        )
        rag_engine.get_chroma_collection = lambda: collection

        docs, metas = rag_engine.busca_por_metadados(paginas=[5])
        self.assertEqual(len(docs), 2)
        self.assertIn("requisito de software rbac 25", docs)
        self.assertIn("requisito arp 4761", docs)
        for meta in metas:
            self.assertEqual(meta["page"], 5)

        docs, metas = rag_engine.busca_por_metadados(norma_hint="rbac 25")
        self.assertEqual(len(docs), 2)
        for meta in metas:
            self.assertEqual(meta["filename"], "rbac-25.pdf")

        docs, metas = rag_engine.busca_por_metadados(paginas=[5], norma_hint="rbac 25")
        self.assertEqual(docs[0], "requisito de software rbac 25")
        self.assertEqual(docs[1], "requisito arp 4761")
        self.assertEqual(docs[2], "requisito de hardware rbac 25")

        vazio_col = FakeCollection(dense_results={}, all_results={})
        rag_engine.get_chroma_collection = lambda: vazio_col
        docs, metas = rag_engine.busca_por_metadados(paginas=[5])
        self.assertEqual(docs, [])
        self.assertEqual(metas, [])


if __name__ == "__main__":
    unittest.main()
