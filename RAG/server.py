"""
server.py — Servidor FastAPI do microserviço RAG do SIGNA (Akaer)

Endpoints:
    POST /api/chat   — Recebe uma pergunta e processa o pipeline RAG
    GET  /api/health  — Healthcheck simples

Uso:
    uvicorn server:app --reload --port 8000
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import generate_answer

load_dotenv()

app = FastAPI(
    title="SIGNA RAG API",
    description="API de consulta inteligente a normas aeronáuticas — Akaer",
    version="0.1.0",
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


class PerguntaRequest(BaseModel):
    """Corpo da requisição POST /api/chat"""
    question: str


class RespostaResponse(BaseModel):
    """Corpo da resposta POST /api/chat"""
    answer: str
    sources: list[dict]


@app.get("/api/health")
def health():
    """Healthcheck — retorna status do serviço."""
    return {"status": "ok", "service": "signa-rag"}


@app.post("/api/chat", response_model=RespostaResponse)
def chat(req: PerguntaRequest):
    """
    Recebe uma pergunta e aciona a Engine para executar:
    Query Expansion -> Busca Híbrida (Dense+Sparse) -> Re-ranking -> Geração LLM.
    """
    try:
        resultado_rag = generate_answer(req.question)

        return RespostaResponse(
            answer=resultado_rag["answer"],
            sources=resultado_rag["sources"],
        )

    except Exception as e:
        return RespostaResponse(
            answer=f"Erro ao processar o pipeline RAG no servidor: {str(e)}",
            sources=[],
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
