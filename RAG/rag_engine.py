import os
import re
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings
from rank_bm25 import BM25Okapi
from sentence_transformers import CrossEncoder

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
MODELO_EMBEDDINGS = "sentence-transformers/all-MiniLM-L6-v2"
MODELO_LLM = "meta-llama/Llama-3.1-8B-Instruct"
MODELO_RERANKER = "cross-encoder/ms-marco-MiniLM-L-6-v2"
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_data")
NOME_COLECAO = "normas_aeronauticas"

GLOSSARIO_AERONAUTICO = {
    "dal": "DAL Development Assurance Level criticidade de software",
    "fha": "FHA Functional Hazard Assessment análise de perigos",
    "pssa": "PSSA Preliminary System Safety Assessment",
    "ssa": "SSA System Safety Assessment análise de segurança",
    "rbac": "RBAC Regulamento Brasileiro da Aviação Civil ANAC",
    "arp": "ARP Aerospace Recommended Practice",
    "sae": "SAE Society of Automotive Engineers"
}

_RERANKER_INSTANCE = None

def get_reranker():
    global _RERANKER_INSTANCE
    if _RERANKER_INSTANCE is None:
        _RERANKER_INSTANCE = CrossEncoder(MODELO_RERANKER)
    return _RERANKER_INSTANCE


class HuggingFaceEmbeddingFunction(EmbeddingFunction):
    def __init__(self, token: str, modelo: str = MODELO_EMBEDDINGS):
        self.client = InferenceClient(provider="auto", token=token)
        self.modelo = modelo

    def __call__(self, input: Documents) -> Embeddings:
        resultados = self.client.feature_extraction(
            input,
            model=self.modelo,
        )
        return [vetor.tolist() for vetor in resultados]


def get_chroma_collection():
    funcao_embedding = HuggingFaceEmbeddingFunction(token=HF_TOKEN)
    cliente_chroma = chromadb.PersistentClient(path=CHROMA_DIR)
    colecao = cliente_chroma.get_or_create_collection(
        name=NOME_COLECAO,
        embedding_function=funcao_embedding,
    )
    return colecao


def expand_query_safely(query: str, client: InferenceClient) -> str:
    query_lower = query.lower()
    expansões_estaticas = []
    
    for sigla, significado in GLOSSARIO_AERONAUTICO.items():
        if re.search(r'\b' + sigla + r'\b', query_lower):
            expansões_estaticas.append(significado)
            
    prompt_blindado = f"""Você é um extrator de termos técnicos para engenharia aeronáutica. 
Sua tarefa é ler a pergunta do usuário e gerar apenas sinônimos técnicos e variações de termos contidos nela para melhorar uma busca em banco de dados.

Regras estritas:
- Retorne APENAS os termos técnicos e sinônimos separados por espaço.
- NUNCA adicione explicações, introduções ou conclusões.
- Se não houver termos técnicos evidentes, repita as palavras principais da pergunta.

Pergunta: {query}
Termos extraídos:"""

    try:
        resposta = client.chat_completion(
            model=MODELO_LLM,
            messages=[{"role": "user", "content": prompt_blindado}],
            max_tokens=40,
            temperature=0.1,
        )
        termos_llm = resposta.choices[0].message.content.strip()
        termos_llm = termos_llm.replace("\n", " ")
    except Exception:
        termos_llm = ""

    query_expandida = f"{query} {' '.join(expansões_estaticas)} {termos_llm}".strip()
    return query_expandida


def hybrid_retrieve(query_expandida: str, top_k_dense: int = 15, top_k_sparse: int = 15, final_candidates: int = 10) -> tuple[list, list]:
    colecao = get_chroma_collection()
    
    resultados_dense = colecao.query(query_texts=[query_expandida], n_results=top_k_dense)
    dense_docs = resultados_dense.get("documents", [[]])[0]
    dense_metas = resultados_dense.get("metadatas", [[]])[0]
    dense_ids = resultados_dense.get("ids", [[]])[0]
    
    todos_docs = colecao.get(include=["documents", "metadatas"])
    all_ids = todos_docs.get("ids", [])
    all_texts = todos_docs.get("documents", [])
    all_metas = todos_docs.get("metadatas", [])
    
    if not all_texts:
        return dense_docs, dense_metas

    tokenized_corpus = [doc.lower().split() for doc in all_texts]
    bm25 = BM25Okapi(tokenized_corpus)
    tokenized_query = query_expandida.lower().split()
    
    scores_bm25 = bm25.get_scores(tokenized_query)
    indices_ordenados = sorted(range(len(scores_bm25)), key=lambda i: scores_bm25[i], reverse=True)[:top_k_sparse]
    
    rrf_scores = {}
    id_mapeado = {}

    for idx, doc_id in enumerate(dense_ids):
        id_mapeado[doc_id] = {"doc": dense_docs[idx], "meta": dense_metas[idx]}
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (60.0 + idx))

    for rank, idx in enumerate(indices_ordenados):
        doc_id = all_ids[idx]
        if doc_id not in id_mapeado:
            id_mapeado[doc_id] = {"doc": all_texts[idx], "meta": all_metas[idx]}
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (60.0 + rank))

    ids_finais = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)[:final_candidates]
    
    docs_hibridos = [id_mapeado[i]["doc"] for i in ids_finais]
    metas_hibridos = [id_mapeado[i]["meta"] for i in ids_finais]
    
    return docs_hibridos, metas_hibridos


def rerank_candidates(query_original: str, documentos: list, metadados: list, top_n: int = 4) -> tuple[list, list]:
    if not documentos:
        return [], []
        
    reranker = get_reranker()
    pares = [[query_original, doc] for doc in documentos]
    scores = reranker.predict(pares)
    
    resultados_ordenados = sorted(zip(scores, documentos, metadados), key=lambda x: x[0], reverse=True)
    
    docs_finais = [item[1] for item in resultados_ordenados[:top_n]]
    metas_finais = [item[2] for item in resultados_ordenados[:top_n]]
    
    return docs_finais, metas_finais


def listar_documentos() -> list[str]:
    colecao = get_chroma_collection()
    todos = colecao.get(include=["metadatas"])
    metadados = todos.get("metadatas", [])
    nomes = {meta.get("filename", "") for meta in metadados if meta.get("filename", "")}
    return sorted(list(nomes))



SYSTEM_PROMPT = """Você é um assistente técnico da Akaer, especialista em normas aeronáuticas para o sistema SIGNA.
Sua missão é fornecer respostas ultra-objetivas, diretas e amplamente espaçadas para engenheiros.

Regras estritas de conteúdo e formatação:
1. DIRETO AO PONTO: Nunca use introduções vazias ou resumos conclusivos. Vá direto à resposta.
2. PROIBIDO CITAR FONTES NO TEXTO: NUNCA escreva o nome do documento, siglas de arquivos ou números de páginas (ex: evite "pdf", "p. 278", "rbac"). A interface do sistema já exibe os documentos consultados automaticamente. Foque apenas no conteúdo técnico.
3. ZERO ALUCINAÇÃO: Se a informação não estiver nos trechos, diga "Informação não disponível".
4. FORMATO EM TÓPICOS ESPAÇADOS: Você deve OBRIGATORIAMENTE seguir o modelo abaixo, garantindo uma linha em branco entre cada item e iniciando com o termo em **negrito**.

Siga exatamente este exemplo de estrutura:
**[Tema Principal da Pergunta]**

* **Termo Técnico A:** Resumo curto e direto da regra ou requisito extraído do texto.

* **Termo Técnico B:** Resumo curto e direto da regra ou requisito extraído do texto."""

TEMPLATE_USUARIO = """Abaixo estão trechos extraídos de documentos normativos aeronáuticos filtrados por relevância híbrida. Use esses trechos para responder minha pergunta.

TRECHOS DOS DOCUMENTOS:
{contexto}

MINHA PERGUNTA: {pergunta}

Responda com base nos trechos acima de forma direta em tópicos, omitindo completamente nomes de arquivos ou páginas no seu texto."""


def generate_answer(query: str) -> dict:
    cliente_llm = InferenceClient(provider="auto", token=HF_TOKEN)
    
    query_expandida = expand_query_safely(query, cliente_llm)
    
    docs_candidatos, metas_candidatos = hybrid_retrieve(query_expandida, final_candidates=10)
    
    documentos, metadados = rerank_candidates(query, docs_candidatos, metas_candidatos, top_n=4)

    docs_disponiveis = listar_documentos()
    lista_docs = "DOCUMENTOS INDEXADOS NO SISTEMA:\n" + "\n".join(f"  - {nome}" for nome in docs_disponiveis)

    trechos = []
    fontes = []
    for i, (doc, meta) in enumerate(zip(documentos, metadados)):
        nome_arquivo = meta.get("filename", "desconhecido")
        pagina = meta.get("page", "?")
        trechos.append(f"[Trecho {i+1} — {nome_arquivo}, p.{pagina}]\n{doc}")
        fontes.append({"filename": nome_arquivo, "page": pagina})

    contexto = lista_docs + "\n\n" + "\n\n".join(trechos)
    mensagem_usuario = TEMPLATE_USUARIO.format(contexto=contexto, pergunta=query)

    try:
        resposta = cliente_llm.chat_completion(
            model=MODELO_LLM,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": mensagem_usuario},
            ],
            max_tokens=1024,
            temperature=0.4,
        )
        texto_resposta = resposta.choices[0].message.content
    except Exception as e:
        texto_resposta = f"Erro ao gerar resposta com o LLM: {str(e)}"

    return {
        "answer": texto_resposta,
        "sources": fontes,
    }