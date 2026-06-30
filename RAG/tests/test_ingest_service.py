import base64
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
    sys.modules.setdefault("dotenv", _make_dotenv_stub())
    sys.modules.setdefault("huggingface_hub", _make_hf_stub())
    sys.modules.setdefault("chromadb", _make_chromadb_stub())
    sys.modules.setdefault("rank_bm25", _make_bm25_stub())
    sys.modules.setdefault("sentence_transformers", _make_sentence_transformers_stub())


def _make_dotenv_stub():
    dotenv = types.ModuleType("dotenv")
    dotenv.load_dotenv = lambda: None
    return dotenv


def _make_hf_stub():
    huggingface_hub = types.ModuleType("huggingface_hub")

    class InferenceClient:
        def __init__(self, *args, **kwargs):
            pass

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
    return huggingface_hub


def _make_chromadb_stub():
    chromadb = types.ModuleType("chromadb")

    class EmbeddingFunction:
        pass

    class PersistentClient:
        def __init__(self, *args, **kwargs):
            pass

        def get_or_create_collection(self, *args, **kwargs):
            raise AssertionError("Teste deve injetar uma coleção falsa")

    chromadb.EmbeddingFunction = EmbeddingFunction
    chromadb.Documents = list
    chromadb.Embeddings = list
    chromadb.PersistentClient = PersistentClient
    return chromadb


def _make_bm25_stub():
    rank_bm25 = types.ModuleType("rank_bm25")

    class BM25Okapi:
        def __init__(self, tokenized_corpus):
            self.tokenized_corpus = tokenized_corpus

        def get_scores(self, tokenized_query):
            return [0.0 for _ in self.tokenized_corpus]

    rank_bm25.BM25Okapi = BM25Okapi
    return rank_bm25


def _make_sentence_transformers_stub():
    st = types.ModuleType("sentence_transformers")

    class CrossEncoder:
        def __init__(self, *args, **kwargs):
            pass

        def predict(self, pairs):
            return [0.0 for _ in pairs]

    st.CrossEncoder = CrossEncoder
    return st


_install_dependency_stubs()

rag_engine = importlib.import_module("rag_engine")
ingest_service = importlib.import_module("ingest_service")

class FakeCollection:

    def __init__(self):
        self.documents = {}
        self.delete_calls = []
        self.add_calls = []

    def add(self, ids, documents, metadatas):
        self.add_calls.append({"ids": ids, "documents": documents, "metadatas": metadatas})
        for i, doc_id in enumerate(ids):
            self.documents[doc_id] = {
                "document": documents[i],
                "metadata": metadatas[i],
            }

    def delete(self, where=None, ids=None):
        self.delete_calls.append({"where": where, "ids": ids})
        if where and "norma_id" in where:
            norma_id = where["norma_id"]
            to_remove = [
                k for k, v in self.documents.items()
                if v["metadata"].get("norma_id") == norma_id
            ]
            for k in to_remove:
                del self.documents[k]

    def get(self, include=None):
        return {
            "ids": list(self.documents.keys()),
            "documents": [v["document"] for v in self.documents.values()],
            "metadatas": [v["metadata"] for v in self.documents.values()],
        }

class IngestServiceTests(unittest.TestCase):
    def setUp(self):
        self.fake_collection = FakeCollection()
        self.original_get_collection_rag = rag_engine.get_chroma_collection
        self.original_get_collection_ingest = ingest_service.get_chroma_collection
        rag_engine.get_chroma_collection = lambda: self.fake_collection
        ingest_service.get_chroma_collection = lambda: self.fake_collection

    def tearDown(self):
        rag_engine.get_chroma_collection = self.original_get_collection_rag
        ingest_service.get_chroma_collection = self.original_get_collection_ingest

    def test_extrair_texto_pdf_bytes_retorna_lista_vazia_para_pdf_invalido(self):
        resultado = ingest_service.extrair_texto_pdf_bytes(b"nao-e-um-pdf", "teste.pdf")
        self.assertEqual(resultado, [])

    def test_dividir_chunks_sem_notas(self):
        paginas = [{"texto": "Texto de teste " * 20, "pagina": 1, "filename": "doc.pdf"}]
        chunks = ingest_service.dividir_em_chunks_com_contexto(paginas)

        self.assertGreater(len(chunks), 0)
        self.assertIn("Documento: doc.pdf", chunks[0]["texto_banco"])
        self.assertNotIn("Notas Técnicas:", chunks[0]["texto_banco"])

    def test_dividir_chunks_com_notas(self):
        paginas = [{"texto": "Texto de teste " * 20, "pagina": 1, "filename": "doc.pdf"}]
        notas = ["Nota importante", "Outra nota"]
        chunks = ingest_service.dividir_em_chunks_com_contexto(paginas, notas)

        self.assertGreater(len(chunks), 0)
        self.assertIn("Notas Técnicas: Nota importante; Outra nota", chunks[0]["texto_banco"])

    def test_dividir_chunks_ignora_notas_vazias(self):
        paginas = [{"texto": "Texto de teste " * 20, "pagina": 1, "filename": "doc.pdf"}]
        notas = ["", "  ", "Nota real"]
        chunks = ingest_service.dividir_em_chunks_com_contexto(paginas, notas)

        self.assertGreater(len(chunks), 0)
        self.assertIn("Notas Técnicas: Nota real", chunks[0]["texto_banco"])

    def test_ingerir_norma_sem_pdf_retorna_zero_chunks(self):
        resultado = ingest_service.ingerir_norma({
            "norma_id": "TESTE-001",
            "titulo": "Teste",
            "pdf_base64": None,
            "pdf_nome": "teste.pdf",
        })

        self.assertEqual(resultado["status"], "ok")
        self.assertEqual(resultado["chunks_indexados"], 0)
        self.assertEqual(len(self.fake_collection.add_calls), 0)

    def test_ingerir_norma_sem_norma_id_retorna_erro(self):
        resultado = ingest_service.ingerir_norma({
            "norma_id": "",
            "pdf_base64": "dGVzdGU=",
        })

        self.assertEqual(resultado["status"], "erro")

    def test_ingerir_norma_com_base64_invalido_retorna_erro(self):
        resultado = ingest_service.ingerir_norma({
            "norma_id": "TESTE-002",
            "pdf_base64": "!!!not-base64!!!",
            "pdf_nome": "bad.pdf",
        })
        self.assertIn(resultado["status"], ["erro", "ok"])

    def test_ingerir_norma_remove_chunks_antigos_antes_de_adicionar(self):
        self.fake_collection.documents["TESTE-003::chunk::0"] = {
            "document": "chunk antigo",
            "metadata": {"norma_id": "TESTE-003"},
        }

        resultado = ingest_service.ingerir_norma({
            "norma_id": "TESTE-003",
            "titulo": "Teste Re-ingestão",
            "pdf_base64": None,
            "pdf_nome": "teste.pdf",
        })

        self.assertEqual(resultado["chunks_indexados"], 0)

    def test_remover_norma_chama_delete_com_filtro_correto(self):
        self.fake_collection.documents["N1::chunk::0"] = {
            "document": "chunk 1",
            "metadata": {"norma_id": "N1"},
        }

        resultado = ingest_service.remover_norma("N1")

        self.assertEqual(resultado["status"], "ok")
        self.assertEqual(len(self.fake_collection.delete_calls), 1)
        self.assertEqual(
            self.fake_collection.delete_calls[0]["where"],
            {"norma_id": "N1"},
        )
        self.assertNotIn("N1::chunk::0", self.fake_collection.documents)

    def test_remover_norma_sem_id_retorna_erro(self):
        resultado = ingest_service.remover_norma("")
        self.assertEqual(resultado["status"], "erro")

    # --- Testes de sincronizar_normas ---

    def test_sincronizar_remove_normas_ausentes_do_chromadb(self):
        self.fake_collection.documents["VELHA::chunk::0"] = {
            "document": "chunk obsoleto",
            "metadata": {"norma_id": "VELHA"},
        }

        resultado = ingest_service.sincronizar_normas([
            {"norma_id": "NOVA", "titulo": "Nova Norma", "pdf_base64": None, "pdf_nome": ""},
        ])

        self.assertEqual(resultado["status"], "ok")
        self.assertEqual(resultado["removidas"], 1)
        self.assertNotIn("VELHA::chunk::0", self.fake_collection.documents)

    def test_sincronizar_conta_normas_sem_pdf(self):
        resultado = ingest_service.sincronizar_normas([
            {"norma_id": "SEM-PDF-1", "titulo": "Teste 1", "pdf_base64": None},
            {"norma_id": "SEM-PDF-2", "titulo": "Teste 2", "pdf_base64": None},
        ])

        self.assertEqual(resultado["sem_pdf"], 2)
        self.assertEqual(resultado["ingeridas"], 0)

    def test_contar_documentos_retorna_estatisticas_corretas(self):
        self.fake_collection.documents["A::chunk::0"] = {
            "document": "chunk A",
            "metadata": {"norma_id": "A"},
        }
        self.fake_collection.documents["A::chunk::1"] = {
            "document": "chunk A2",
            "metadata": {"norma_id": "A"},
        }
        self.fake_collection.documents["B::chunk::0"] = {
            "document": "chunk B",
            "metadata": {"norma_id": "B"},
        }

        resultado = ingest_service.contar_documentos()

        self.assertEqual(resultado["total_chunks"], 3)
        self.assertEqual(resultado["total_normas"], 2)
        self.assertIn("A", resultado["normas_indexadas"])
        self.assertIn("B", resultado["normas_indexadas"])

    def test_contar_documentos_colecao_vazia(self):
        resultado = ingest_service.contar_documentos()

        self.assertEqual(resultado["total_chunks"], 0)
        self.assertEqual(resultado["total_normas"], 0)
        self.assertEqual(resultado["normas_indexadas"], [])


if __name__ == "__main__":
    unittest.main()
