import os
import re
import logging
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import chromadb
from chromadb import EmbeddingFunction, Documents, Embeddings
from rank_bm25 import BM25Okapi
from sentence_transformers import CrossEncoder

load_dotenv()

logger = logging.getLogger(__name__)

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
    """Expande a query com sinônimos técnicos e termos do glossário."""
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
    """Busca híbrida combinando embeddings densos (ChromaDB) e esparsos (BM25) via RRF."""
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
    """Re-rankeia candidatos usando um Cross-Encoder para maior precisão."""
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

def extrair_filtros_query(query: str) -> dict:
    query_lower = query.lower()

    paginas = []

    padrao_pagina = re.findall(
        r'(?:p[aá]ginas?\s*|p\.\s*|pg\.?\s*|pag\.?\s*)(\d+(?:\s*(?:e|,|a)\s*\d+)*)',
        query_lower,
    )
    for match in padrao_pagina:
        if ' a ' in match:
            partes = match.split(' a ')
            try:
                inicio, fim = int(partes[0].strip()), int(partes[1].strip())
                paginas.extend(range(inicio, fim + 1))
            except ValueError:
                pass
        else:
            numeros = re.findall(r'\d+', match)
            paginas.extend(int(n) for n in numeros)

    norma_hint = None

    padroes_norma = [
        r'(rbac[\s\-]*[\d\.]*)',
        r'(far[\s\-]*[\d\.]*)',
        r'(cs[\s\-]*[\d\.]*)',
        r'(sae[\s\-]*(?:arp|as)?[\s\-]*[\d\.]*)',
        r'(iso[\s\-]*[\d\.]*)',
        r'(arp[\s\-]*[\d\.]*)',
        r'norma\s+([a-záàâãéèêíïóôõúüç\w\s\-\.]+?)(?:\s+indexada|\s+cadastrada|\s+página|\s*\?|\s*$)',
    ]

    for padrao in padroes_norma:
        match = re.search(padrao, query_lower)
        if match:
            norma_hint = match.group(1).strip().rstrip('.')
            break

    return {
        "paginas": paginas,
        "norma_hint": norma_hint,
    }


def busca_por_metadados(
    paginas: list[int] | None = None,
    norma_hint: str | None = None,
    max_resultados: int = 10,
) -> tuple[list, list]:
    colecao = get_chroma_collection()

    todos = colecao.get(include=["documents", "metadatas"])
    all_ids = todos.get("ids", [])
    all_texts = todos.get("documents", [])
    all_metas = todos.get("metadatas", [])

    if not all_texts:
        return [], []

    resultados = []

    for i, (doc_id, texto, meta) in enumerate(zip(all_ids, all_texts, all_metas)):
        score = 0
        filename_lower = meta.get("filename", "").lower()
        page = meta.get("page", None)

        if norma_hint:
            hint_parts = norma_hint.replace("-", " ").split()
            matches_norma = all(part in filename_lower.replace("-", " ") for part in hint_parts)
            if matches_norma:
                score += 10

        if paginas and page is not None:
            if page in paginas:
                score += 100

        if score > 0:
            resultados.append((score, texto, meta))

    resultados.sort(key=lambda x: x[0], reverse=True)
    resultados = resultados[:max_resultados]

    docs = [r[1] for r in resultados]
    metas = [r[2] for r in resultados]

    return docs, metas

def retrieve_context(
    query: str,
    top_n: int = 4,
    expand: bool = True,
    final_candidates: int = 10,
) -> dict:
    filtros = extrair_filtros_query(query)
    tem_filtros = bool(filtros["paginas"]) or bool(filtros["norma_hint"])

    docs_meta, metas_meta = [], []
    if tem_filtros:
        docs_meta, metas_meta = busca_por_metadados(
            paginas=filtros["paginas"],
            norma_hint=filtros["norma_hint"],
            max_resultados=top_n,
        )

    cliente_llm = InferenceClient(provider="auto", token=HF_TOKEN)

    if expand:
        query_expandida = expand_query_safely(query, cliente_llm)
    else:
        query_expandida = query

    docs_semanticos, metas_semanticos = hybrid_retrieve(
        query_expandida, final_candidates=final_candidates
    )
    docs_reranked, metas_reranked = rerank_candidates(
        query, docs_semanticos, metas_semanticos, top_n=top_n
    )

    if tem_filtros and docs_meta:
        docs_finais = list(docs_meta)
        metas_finais = list(metas_meta)

        textos_ja_incluidos = set(d[:200] for d in docs_finais)
        for doc, meta in zip(docs_reranked, metas_reranked):
            if doc[:200] not in textos_ja_incluidos and len(docs_finais) < top_n * 2:
                docs_finais.append(doc)
                metas_finais.append(meta)
                textos_ja_incluidos.add(doc[:200])

        documentos = docs_finais[:top_n]
        metadados = metas_finais[:top_n]
    else:
        documentos = docs_reranked
        metadados = metas_reranked

    trechos = []
    fontes = []
    for doc, meta in zip(documentos, metadados):
        nome_arquivo = meta.get("filename", "desconhecido")
        pagina = meta.get("page", "?")
        trechos.append({
            "texto": doc,
            "filename": nome_arquivo,
            "page": pagina,
            "norma_id": meta.get("norma_id", ""),
            "titulo": meta.get("titulo", ""),
            "organizacao": meta.get("organizacao", ""),
            "categoria": meta.get("categoria", ""),
        })
        fontes.append({"filename": nome_arquivo, "page": pagina})

    return {
        "trechos": trechos,
        "fontes": fontes,
        "query_expandida": query_expandida if not tem_filtros else query,
        "documentos_indexados": listar_documentos(),
        "filtros_detectados": filtros,
    }

def call_llm(
    mensagens: list[dict],
    max_tokens: int = 2048,
    temperature: float = 0.6,
) -> str:
    cliente_llm = InferenceClient(provider="auto", token=HF_TOKEN)

    try:
        resposta = cliente_llm.chat_completion(
            model=MODELO_LLM,
            messages=mensagens,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return resposta.choices[0].message.content
    except Exception as e:
        logger.error(str(e))
        return str(e)

PROMPT_CHATBOT = """Você é um engenheiro aeronáutico sênior e consultor técnico da Akaer, integrado ao sistema SIGNA (Sistema Integrado de Gestão de Normas Aeronáuticas).

Você tem amplo conhecimento em normas aeronáuticas (RBAC, FAR, CS, SAE ARP, ISO), certificação de aeronaves, análise de segurança de sistemas, aeronavegabilidade e engenharia estrutural.

COMO RESPONDER:

1. PRIORIZE OS DOCUMENTOS: Base sua resposta nos trechos fornecidos. Quando a informação vier dos documentos, seja preciso e fiel ao conteúdo.

2. COMPLEMENTE COM CONHECIMENTO TÉCNICO: Quando os trechos não cobrirem completamente a pergunta, você pode complementar com seu conhecimento técnico aeronáutico para dar contexto, explicar conceitos ou conectar informações. Neste caso, indique sutilmente que está complementando (ex: "De forma geral na aviação...", "Tipicamente neste contexto...").

3. SINTETIZE E CONECTE: Não se limite a repetir trechos isolados. Sintetize informações de múltiplos trechos, identifique relações entre requisitos, e ofereça uma visão integrada.

4. ADAPTE O FORMATO À PERGUNTA:
   - Perguntas conceituais → parágrafos explicativos fluidos
   - Perguntas sobre requisitos específicos → tópicos organizados
   - Perguntas comparativas → tabelas ou comparações estruturadas
   - Perguntas sobre processos → etapas sequenciais
   - Use **negrito** para termos-chave, mas varie a estrutura naturalmente

5. CITAÇÕES INLINE OBRIGATÓRIAS: Sempre que usar informação de um trecho específico, insira o marcador 【n】 imediatamente após a frase ou afirmação correspondente, onde "n" é o número do trecho (1, 2, 3 ou 4). Exemplos:
   - "A análise de segurança deve considerar falhas latentes e ativas【1】."
   - "O critério de tolerância a dano exige que a estrutura suporte cargas limite após dano acidental【2】, e isso se aplica tanto a estruturas metálicas quanto compostas【3】."
   Se uma afirmação combina informações de múltiplos trechos, cite todos os relevantes: 【1】【3】.
   NÃO cite nomes de arquivos, páginas ou siglas de documentos no texto — apenas use os marcadores 【n】. A interface exibirá automaticamente o documento e página correspondentes ao passar o cursor sobre o marcador.

6. SE NÃO HOUVER INFORMAÇÃO RELEVANTE: Diga que a informação específica não está disponível na base atual, mas ofereça contexto geral se possível. Não insira marcadores 【n】 em afirmações baseadas em conhecimento geral.

7. TOM: Técnico mas acessível. Imagine que está explicando para um colega engenheiro — seja claro, direto, mas não robótico. Evite introduções genéricas como "Claro!" ou "Ótima pergunta!"."""

TEMPLATE_CHATBOT = """Abaixo estão trechos de documentos normativos aeronáuticos, numerados de 1 a N, selecionados por relevância para minha pergunta. Use-os como base principal para sua resposta, complementando com conhecimento técnico quando necessário.

TRECHOS DOS DOCUMENTOS:
{contexto}

MINHA PERGUNTA: {pergunta}

Responda de forma inteligente e bem estruturada, adaptando o formato ao tipo de pergunta. IMPORTANTE: insira marcadores 【n】 (onde n = número do trecho) após cada afirmação baseada em um trecho específico, para que a interface possa mostrar a fonte ao passar o cursor. Não mencione nomes de arquivos ou páginas no texto."""


PROMPT_AUDITORIA = """Você é um auditor de conformidade aeronáutica da Akaer, especialista em verificação de aderência a normas no sistema SIGNA.

Sua tarefa é analisar um texto técnico (relatório, procedimento ou documento de engenharia) e verificar se ele está em conformidade com as normas aeronáuticas relevantes.

COMO ANALISAR:

1. IDENTIFIQUE REQUISITOS: Nos trechos fornecidos, identifique os requisitos normativos aplicáveis ao texto analisado.

2. VERIFIQUE CONFORMIDADE: Para cada requisito identificado, avalie se o texto do engenheiro atende, atende parcialmente ou não atende.

3. FORMATO DA RESPOSTA — use exatamente esta estrutura:

**Resumo Geral:** [Conforme / Parcialmente Conforme / Não Conforme]

**Requisitos Verificados:**

* **[Requisito]:** ✅ Conforme — [breve justificativa]【n】
* **[Requisito]:** ⚠️ Parcial — [o que falta]【n】
* **[Requisito]:** ❌ Não Conforme — [o que está errado e como corrigir]【n】

**Recomendações:** [Se houver itens parciais ou não conformes, sugira ações corretivas]

4. CITAÇÕES: Use marcadores 【n】 para indicar de qual trecho normativo veio cada verificação.
5. Seja rigoroso mas justo — não invente não-conformidades."""

TEMPLATE_AUDITORIA = """Abaixo estão trechos de normas aeronáuticas relevantes, e o texto técnico que precisa ser auditado.

TRECHOS NORMATIVOS:
{contexto}

TEXTO PARA AUDITAR:
{texto_auditoria}

Analise a conformidade do texto com os requisitos normativos acima. Use marcadores 【n】 para rastrear cada verificação até o trecho normativo correspondente."""


PROMPT_NOTAS = """Você é um redator técnico aeronáutico da Akaer, especialista em sintetizar normas complexas em notas técnicas claras e acionáveis para o sistema SIGNA.

Sua tarefa é gerar notas técnicas estruturadas a partir dos trechos da norma fornecidos.

COMO GERAR NOTAS:

1. Identifique os pontos-chave, requisitos e procedimentos nos trechos.
2. Reescreva-os como notas técnicas curtas e objetivas.
3. Cada nota deve ser auto-suficiente (compreensível sem ler a norma inteira).
4. Use linguagem imperativa quando apropriado ("Deve-se...", "É necessário...", "Verificar se...").
5. Agrupe as notas por tema quando possível.

FORMATO:
Retorne uma lista JSON de strings, onde cada string é uma nota técnica:
["Nota 1...", "Nota 2...", "Nota 3..."]

Retorne APENAS o JSON, sem explicações adicionais."""

TEMPLATE_NOTAS = """Abaixo estão trechos de uma norma aeronáutica. Gere notas técnicas claras e acionáveis a partir deles.

TRECHOS DA NORMA:
{contexto}

INFORMAÇÕES DA NORMA:
- Código: {codigo}
- Título: {titulo}
- Organização: {organizacao}

Retorne as notas como uma lista JSON de strings."""

def generate_answer(query: str) -> dict:
    contexto = retrieve_context(query, top_n=4)

    trechos_formatados = []
    for i, trecho in enumerate(contexto["trechos"]):
        trechos_formatados.append(
            f"[Trecho {i+1} — {trecho['filename']}, p.{trecho['page']}]\n{trecho['texto']}"
        )

    lista_docs = "DOCUMENTOS INDEXADOS NO SISTEMA:\n" + "\n".join(
        f"  - {nome}" for nome in contexto["documentos_indexados"]
    )

    contexto_completo = lista_docs + "\n\n" + "\n\n".join(trechos_formatados)
    mensagem_usuario = TEMPLATE_CHATBOT.format(contexto=contexto_completo, pergunta=query)

    texto_resposta = call_llm(
        mensagens=[
            {"role": "system", "content": PROMPT_CHATBOT},
            {"role": "user", "content": mensagem_usuario},
        ],
        max_tokens=2048,
        temperature=0.6,
    )

    return {
        "answer": texto_resposta,
        "sources": contexto["fontes"],
    }

def analyze_compliance(
    texto_relatorio: str,
    norma_ids: list[str] | None = None,
    top_n: int = 6,
) -> dict:
    contexto = retrieve_context(texto_relatorio, top_n=top_n)

    if norma_ids:
        norma_ids_set = set(norma_ids)
        trechos_filtrados = [
            t for t in contexto["trechos"]
            if t.get("norma_id", "") in norma_ids_set
        ]
        if trechos_filtrados:
            contexto["trechos"] = trechos_filtrados
            contexto["fontes"] = [
                {"filename": t["filename"], "page": t["page"]}
                for t in trechos_filtrados
            ]

    trechos_formatados = []
    for i, trecho in enumerate(contexto["trechos"]):
        trechos_formatados.append(
            f"[Trecho {i+1} — {trecho['filename']}, p.{trecho['page']}]\n{trecho['texto']}"
        )

    contexto_completo = "\n\n".join(trechos_formatados)
    mensagem_usuario = TEMPLATE_AUDITORIA.format(
        contexto=contexto_completo,
        texto_auditoria=texto_relatorio,
    )

    texto_analise = call_llm(
        mensagens=[
            {"role": "system", "content": PROMPT_AUDITORIA},
            {"role": "user", "content": mensagem_usuario},
        ],
        max_tokens=2048,
        temperature=0.3,
    )

    return {
        "analysis": texto_analise,
        "sources": contexto["fontes"],
        "query_expandida": contexto["query_expandida"],
    }

def generate_notes(
    norma_id: str,
    titulo: str = "",
    codigo: str = "",
    organizacao: str = "",
    top_n: int = 6,
) -> dict:
    contexto = retrieve_context(
        f"{codigo} {titulo}",
        top_n=top_n,
        expand=False,  # Não expandir — queremos chunks exatos desta norma
    )

    trechos_da_norma = [
        t for t in contexto["trechos"]
        if t.get("norma_id", "") == norma_id
    ]

    if not trechos_da_norma:
        trechos_da_norma = contexto["trechos"]

    trechos_formatados = []
    fontes = []
    for i, trecho in enumerate(trechos_da_norma):
        trechos_formatados.append(
            f"[Trecho {i+1}]\n{trecho['texto']}"
        )
        fontes.append({"filename": trecho["filename"], "page": trecho["page"]})

    contexto_completo = "\n\n".join(trechos_formatados)
    mensagem_usuario = TEMPLATE_NOTAS.format(
        contexto=contexto_completo,
        codigo=codigo or norma_id,
        titulo=titulo,
        organizacao=organizacao,
    )

    texto_resposta = call_llm(
        mensagens=[
            {"role": "system", "content": PROMPT_NOTAS},
            {"role": "user", "content": mensagem_usuario},
        ],
        max_tokens=2048,
        temperature=0.4,
    )

    notas = []
    try:
        import json
        # Limpa possíveis marcações markdown do LLM
        texto_limpo = texto_resposta.strip()
        if texto_limpo.startswith("```"):
            texto_limpo = texto_limpo.split("\n", 1)[1]
            texto_limpo = texto_limpo.rsplit("```", 1)[0]
        notas = json.loads(texto_limpo)
        if not isinstance(notas, list):
            notas = [str(notas)]
    except (json.JSONDecodeError, Exception):
        notas = [
            linha.strip().lstrip("- •*").strip()
            for linha in texto_resposta.strip().split("\n")
            if linha.strip() and len(linha.strip()) > 10
        ]

    return {
        "notes": notas,
        "raw_response": texto_resposta,
        "sources": fontes,
    }