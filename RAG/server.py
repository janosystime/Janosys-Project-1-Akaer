"""
Endpoints:
    --- Core AI ---
    POST /api/chat              — Chatbot: pergunta → resposta conversacional
    POST /api/retrieve          — Busca semântica pura (sem LLM)
    POST /api/analyze           — Auditoria de conformidade
    POST /api/generate/notes    — Geração de notas técnicas via IA

    --- Ingestão ---
    POST   /api/ingest           — Ingere uma norma individualmente (async)
    DELETE /api/ingest/{norma_id} — Remove uma norma do índice
    POST   /api/ingest/sync      — Sincroniza todas as normas (async)
    GET    /api/ingest/status     — Estatísticas do índice

    --- Infra ---
    GET  /api/health             — Healthcheck simples

Uso:
    uvicorn server:app --reload --port 8000
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag_engine import (
    generate_answer,
    retrieve_context,
    analyze_compliance,
    generate_notes,
)
from ingest_service import (
    contar_documentos,
    ingerir_norma,
    remover_norma,
    sincronizar_normas,
)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SIGNA RAG API",
    description="API inteligente de normas aeronáuticas — Akaer",
    version="0.3.0",
)

origens_cors = [
    origem.strip()
    for origem in os.getenv(
        "RAG_CORS_ORIGINS",
        "http://localhost:5173,http://localhost:8080",
    ).split(",")
    if origem.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_cors,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Chat ---

class PerguntaRequest(BaseModel):
    """POST /api/chat"""
    question: str


class RespostaResponse(BaseModel):
    """Resposta do POST /api/chat"""
    answer: str
    sources: list[dict]


# --- Retrieve ---

class RetrieveRequest(BaseModel):
    """POST /api/retrieve"""
    query: str
    top_n: int = 4
    expand: bool = True


# --- Auditoria ---

class AnalyzeRequest(BaseModel):
    """POST /api/analyze"""
    texto: str
    norma_ids: list[str] | None = None
    top_n: int = 6


class AnalyzeResponse(BaseModel):
    """Resposta do POST /api/analyze"""
    analysis: str
    sources: list[dict]


# --- Geração de Notas ---

class GenerateNotesRequest(BaseModel):
    """POST /api/generate/notes"""
    norma_id: str
    titulo: str = ""
    codigo: str = ""
    organizacao: str = ""
    top_n: int = 6


class GenerateNotesResponse(BaseModel):
    """Resposta do POST /api/generate/notes"""
    notes: list[str]
    raw_response: str
    sources: list[dict]


# --- Ingestão ---

class IngestNormaRequest(BaseModel):
    """POST /api/ingest"""
    norma_id: str
    titulo: str = ""
    codigo: str = ""
    organizacao: str = ""
    categoria: str = ""
    notas: list[str] = []
    pdf_base64: str | None = None
    pdf_nome: str = ""


class SyncRequest(BaseModel):
    normas: list[IngestNormaRequest]

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "signa-rag"}

@app.post("/api/chat", response_model=RespostaResponse)
def chat(req: PerguntaRequest):
    try:
        resultado = generate_answer(req.question)
        return RespostaResponse(
            answer=resultado["answer"],
            sources=resultado["sources"],
        )
    except Exception as e:
        logger.error(str(e))
        return RespostaResponse(
            answer=str(e),
            sources=[],
        )


@app.post("/api/retrieve")
def retrieve(req: RetrieveRequest):
    try:
        resultado = retrieve_context(
            query=req.query,
            top_n=req.top_n,
            expand=req.expand,
        )
        return resultado
    except Exception as e:
        logger.error(str(e))
        return {"trechos": [], "fontes": [], "erro": str(e)}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    try:
        resultado = analyze_compliance(
            texto_relatorio=req.texto,
            norma_ids=req.norma_ids,
            top_n=req.top_n,
        )
        return AnalyzeResponse(
            analysis=resultado["analysis"],
            sources=resultado["sources"],
        )
    except Exception as e:
        logger.error(str(e))
        return AnalyzeResponse(
            analysis=str(e),
            sources=[],
        )


@app.post("/api/generate/notes", response_model=GenerateNotesResponse)
def gen_notes(req: GenerateNotesRequest):
    try:
        resultado = generate_notes(
            norma_id=req.norma_id,
            titulo=req.titulo,
            codigo=req.codigo,
            organizacao=req.organizacao,
            top_n=req.top_n,
        )
        return GenerateNotesResponse(
            notes=resultado["notes"],
            raw_response=resultado["raw_response"],
            sources=resultado["sources"],
        )
    except Exception as e:
        logger.error(str(e))
        return GenerateNotesResponse(
            notes=[],
            raw_response=str(e),
            sources=[],
        )

@app.post("/api/ingest", status_code=202)
def ingest(req: IngestNormaRequest, background_tasks: BackgroundTasks):
    norma_data = req.model_dump()
    logger.info(f"[API] Ingestão recebida para norma '{req.norma_id}' — processando em background.")
    background_tasks.add_task(ingerir_norma, norma_data)
    return {"status": "accepted", "norma_id": req.norma_id}


@app.delete("/api/ingest/{norma_id:path}")
def ingest_delete(norma_id: str):
    logger.info(f"[API] Remoção recebida para norma '{norma_id}'.")
    resultado = remover_norma(norma_id)
    return resultado


@app.post("/api/ingest/sync", status_code=202)
def ingest_sync(req: SyncRequest, background_tasks: BackgroundTasks):
    normas_data = [n.model_dump() for n in req.normas]
    logger.info(f"[API] Sincronização recebida com {len(normas_data)} normas — processando em background.")
    background_tasks.add_task(sincronizar_normas, normas_data)
    return {"status": "accepted", "total_normas": len(normas_data)}


@app.get("/api/ingest/status")
def ingest_status():
    return contar_documentos()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
