import os
from dotenv import load_dotenv
import chromadb

from rag_engine import (
    HuggingFaceEmbeddingFunction,
    HF_TOKEN,
    CHROMA_DIR,
    NOME_COLECAO,
)
from ingest_service import (
    extrair_texto_pdf_bytes,
    dividir_em_chunks_com_contexto,
)

load_dotenv()
DOCS_PATH = os.getenv("DOCS_PATH", "./documentos")


def extrair_texto_pdf(caminho_pdf: str) -> list[dict]:
    nome_arquivo = os.path.basename(caminho_pdf)
    with open(caminho_pdf, "rb") as f:
        pdf_bytes = f.read()
    return extrair_texto_pdf_bytes(pdf_bytes, nome_arquivo)


def ingerir_documentos():
    if not os.path.isdir(DOCS_PATH):
        raise FileNotFoundError(f"Pasta '{DOCS_PATH}' não encontrada!")

    arquivos_pdf = [f for f in os.listdir(DOCS_PATH) if f.lower().endswith(".pdf")]

    if not arquivos_pdf:
        raise FileNotFoundError(f"Nenhum PDF encontrado em '{DOCS_PATH}'")

    todas_paginas = []
    for arquivo in arquivos_pdf:
        caminho = os.path.join(DOCS_PATH, arquivo)
        todas_paginas.extend(extrair_texto_pdf(caminho))

    chunks = dividir_em_chunks_com_contexto(todas_paginas)

    funcao_embedding = HuggingFaceEmbeddingFunction(token=HF_TOKEN)
    cliente_chroma = chromadb.PersistentClient(path=CHROMA_DIR)

    try:
        cliente_chroma.delete_collection(name=NOME_COLECAO)
    except Exception:
        pass

    colecao = cliente_chroma.create_collection(
        name=NOME_COLECAO,
        embedding_function=funcao_embedding,
    )

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    documentos = [chunk["texto_banco"] for chunk in chunks]
    metadados = [
        {"filename": chunk["filename"], "page": chunk["pagina"]}
        for chunk in chunks
    ]

    TAMANHO_LOTE = 50
    for inicio in range(0, len(chunks), TAMANHO_LOTE):
        fim = min(inicio + TAMANHO_LOTE, len(chunks))
        colecao.add(
            ids=ids[inicio:fim],
            documents=documentos[inicio:fim],
            metadatas=metadados[inicio:fim],
        )


if __name__ == "__main__":
    ingerir_documentos()