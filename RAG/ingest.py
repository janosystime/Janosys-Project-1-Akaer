"""
ingest.py — Script de ingestão otimizado com Metadata Injection para o SIGNA (Akaer)
"""

import os
import sys
import re
import fitz
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb

from rag_engine import (
    HuggingFaceEmbeddingFunction,
    HF_TOKEN,
    CHROMA_DIR,
    NOME_COLECAO,
)

load_dotenv()
DOCS_PATH = os.getenv("DOCS_PATH", "./documentos")


def extrair_texto_pdf(caminho_pdf: str) -> list[dict]:
    nome_arquivo = os.path.basename(caminho_pdf)
    paginas = []

    try:
        documento = fitz.open(caminho_pdf)
        for num_pagina in range(len(documento)):
            pagina = documento[num_pagina]
            texto = pagina.get_text()

            if texto.strip():
                paginas.append({
                    "texto": texto,
                    "pagina": num_pagina + 1,
                    "filename": nome_arquivo,
                })

        documento.close()
        print(f" {nome_arquivo}: {len(paginas)} páginas extraídas.")
    except Exception as e:
        print(f" Erro ao ler {nome_arquivo}: {e}")

    return paginas


def dividir_em_chunks_com_contexto(paginas: list[dict]) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    chunks_finais = []
    
    for pagina in paginas:
        pedacos = splitter.split_text(pagina["texto"])
        
        for pedaco in pedacos:
            texto_enriquecido = (
                f"Documento: {pagina['filename']} | Seção/Página: p. {pagina['pagina']}\n"
                f"Conteúdo:\n{pedaco.strip()}"
            )
            
            chunks_finais.append({
                "texto_banco": texto_enriquecido,
                "pagina": pagina["pagina"],
                "filename": pagina["filename"],
            })

    return chunks_finais


def ingerir_documentos():
    if not os.path.isdir(DOCS_PATH):
        print(f"Pasta '{DOCS_PATH}' não encontrada!")
        sys.exit(1)

    arquivos_pdf = [f for f in os.listdir(DOCS_PATH) if f.lower().endswith(".pdf")]

    if not arquivos_pdf:
        print(f"Nenhum PDF encontrado em '{DOCS_PATH}'")
        sys.exit(1)

    print(f"Encontrados {len(arquivos_pdf)} PDF(s) em '{DOCS_PATH}'\n")

    print("Passo 1/3 — Extraindo texto estruturado...")
    todas_paginas = []
    for arquivo in arquivos_pdf:
        caminho = os.path.join(DOCS_PATH, arquivo)
        todas_paginas.extend(extrair_texto_pdf(caminho))

    print(f"  Total: {len(todas_paginas)} páginas processadas.\n")

    print("Passo 2/3 — Aplicando Chunking com Injeção de Metadados...")
    chunks = dividir_em_chunks_com_contexto(todas_paginas)
    print(f"  Total: {len(chunks)} chunks enriquecidos gerados.\n")

    print("Passo 3/3 — Indexando no ChromaDB...")

    funcao_embedding = HuggingFaceEmbeddingFunction(token=HF_TOKEN)
    cliente_chroma = chromadb.PersistentClient(path=CHROMA_DIR)

    try:
        cliente_chroma.delete_collection(name=NOME_COLECAO)
        print("  (coleção anterior removida para atualização)")
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
        print(f" Chunks {inicio+1} a {fim} indexados com sucesso.")

    print(f"\n✅ Ingestão concluída. {len(chunks)} chunks tunados e indexados")


if __name__ == "__main__":
    print("=" * 50)
    print("  SIGNA — Ingestão Avançada de Documentos")
    print("=" * 50)
    print()
    ingerir_documentos()