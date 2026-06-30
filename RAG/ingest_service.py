import base64
import logging

import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

from rag_engine import get_chroma_collection

logger = logging.getLogger(__name__)

TAMANHO_LOTE = 50

def extrair_texto_pdf_bytes(pdf_bytes: bytes, filename: str) -> list[dict]:
    paginas = []

    try:
        documento = fitz.open(stream=pdf_bytes, filetype="pdf")
        for num_pagina in range(len(documento)):
            pagina = documento[num_pagina]
            texto = pagina.get_text()

            if texto.strip():
                paginas.append({
                    "texto": texto,
                    "pagina": num_pagina + 1,
                    "filename": filename,
                })

        documento.close()
        logger.info(f"  {filename}: {len(paginas)} páginas extraídas.")
    except Exception as e:
        logger.error(str(e))

    return paginas

def dividir_em_chunks_com_contexto(
    paginas: list[dict],
    notas: list[str] | None = None,
) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )

    notas_validas = [n.strip() for n in (notas or []) if n and n.strip()]
    linha_notas = ""
    if notas_validas:
        linha_notas = f"Notas Técnicas: {'; '.join(notas_validas)}\n"

    chunks_finais = []

    for pagina in paginas:
        pedacos = splitter.split_text(pagina["texto"])

        for pedaco in pedacos:
            texto_enriquecido = (
                f"Documento: {pagina['filename']} | Seção/Página: p. {pagina['pagina']}\n"
                f"{linha_notas}"
                f"Conteúdo:\n{pedaco.strip()}"
            )

            chunks_finais.append({
                "texto_banco": texto_enriquecido,
                "pagina": pagina["pagina"],
                "filename": pagina["filename"],
            })

    return chunks_finais

def ingerir_norma(norma_data: dict) -> dict:
    norma_id = norma_data.get("norma_id", "")
    titulo = norma_data.get("titulo", "")
    codigo = norma_data.get("codigo", "")
    organizacao = norma_data.get("organizacao", "")
    categoria = norma_data.get("categoria", "")
    notas = norma_data.get("notas", [])
    pdf_base64 = norma_data.get("pdf_base64")
    pdf_nome = norma_data.get("pdf_nome", "documento.pdf")

    if not norma_id:
        return {"status": "erro", "mensagem": "norma_id é obrigatório"}

    if not pdf_base64:
        logger.info(f"[ingest] Norma '{norma_id}' sem PDF — ingestão ignorada.")
        return {
            "status": "ok",
            "norma_id": norma_id,
            "chunks_indexados": 0,
            "mensagem": "Norma sem PDF, ingestão ignorada.",
        }

    logger.info(f"[ingest] Iniciando ingestão da norma '{norma_id}'...")

    try:
        pdf_bytes = base64.b64decode(pdf_base64)
    except Exception as e:
        logger.error(str(e))
        return {"status": "erro", "norma_id": norma_id, "mensagem": str(e)}

    paginas = extrair_texto_pdf_bytes(pdf_bytes, pdf_nome)
    if not paginas:
        logger.warning(f"[ingest] Nenhuma página extraída de '{pdf_nome}' (norma '{norma_id}').")
        return {
            "status": "ok",
            "norma_id": norma_id,
            "chunks_indexados": 0,
            "mensagem": "PDF sem texto extraível.",
        }

    chunks = dividir_em_chunks_com_contexto(paginas, notas)
    logger.info(f"[ingest] {len(chunks)} chunks gerados para '{norma_id}'.")

    colecao = get_chroma_collection()

    try:
        colecao.delete(where={"norma_id": norma_id})
        logger.info(f"[ingest] Chunks antigos de '{norma_id}' removidos.")
    except Exception:
        pass

    ids = [f"{norma_id}::chunk::{i}" for i in range(len(chunks))]
    documentos = [chunk["texto_banco"] for chunk in chunks]
    metadados = [
        {
            "norma_id": norma_id,
            "filename": chunk["filename"],
            "page": chunk["pagina"],
            "titulo": titulo,
            "codigo": codigo,
            "organizacao": organizacao,
            "categoria": categoria,
        }
        for chunk in chunks
    ]

    for inicio in range(0, len(chunks), TAMANHO_LOTE):
        fim = min(inicio + TAMANHO_LOTE, len(chunks))
        colecao.add(
            ids=ids[inicio:fim],
            documents=documentos[inicio:fim],
            metadatas=metadados[inicio:fim],
        )

    logger.info(f"[ingest] Norma '{norma_id}' indexada com {len(chunks)} chunks.")

    return {
        "status": "ok",
        "norma_id": norma_id,
        "chunks_indexados": len(chunks),
    }

def remover_norma(norma_id: str) -> dict:
    if not norma_id:
        return {"status": "erro", "mensagem": "norma_id é obrigatório"}

    logger.info(f"[ingest] Removendo chunks da norma '{norma_id}'...")

    colecao = get_chroma_collection()

    try:
        colecao.delete(where={"norma_id": norma_id})
        logger.info(f"[ingest] ✅ Chunks da norma '{norma_id}' removidos com sucesso.")
    except Exception as e:
        logger.error(str(e))
        return {"status": "erro", "norma_id": norma_id, "mensagem": str(e)}

    return {
        "status": "ok",
        "norma_id": norma_id,
        "mensagem": "Chunks removidos com sucesso.",
    }

def sincronizar_normas(normas_list: list[dict]) -> dict:
    logger.info(f"[sync] Iniciando sincronização com {len(normas_list)} normas...")

    colecao = get_chroma_collection()

    normas_indexadas = set()
    try:
        todos = colecao.get(include=["metadatas"])
        for meta in (todos.get("metadatas") or []):
            nid = meta.get("norma_id", "")
            if nid:
                normas_indexadas.add(nid)
    except Exception:
        pass

    normas_na_lista = {n.get("norma_id", "") for n in normas_list if n.get("norma_id")}

    normas_para_remover = normas_indexadas - normas_na_lista
    removidas = 0
    for nid in normas_para_remover:
        try:
            colecao.delete(where={"norma_id": nid})
            removidas += 1
            logger.info(f"[sync] Norma '{nid}' removida (não existe mais no sistema).")
        except Exception as e:
            logger.error(str(e))

    ingeridas = 0
    sem_pdf = 0
    for norma_data in normas_list:
        if not norma_data.get("pdf_base64"):
            sem_pdf += 1
            continue

        resultado = ingerir_norma(norma_data)
        if resultado.get("chunks_indexados", 0) > 0:
            ingeridas += 1

    logger.info(
        f"[sync] Sincronização concluída: "
        f"{ingeridas} ingeridas, {removidas} removidas, {sem_pdf} sem PDF."
    )

    return {
        "status": "ok",
        "ingeridas": ingeridas,
        "removidas": removidas,
        "sem_pdf": sem_pdf,
    }

def contar_documentos() -> dict:
    colecao = get_chroma_collection()

    try:
        todos = colecao.get(include=["metadatas"])
        ids = todos.get("ids", [])
        metadados = todos.get("metadatas", [])

        normas_unicas = set()
        for meta in metadados:
            nid = meta.get("norma_id", "")
            if nid:
                normas_unicas.add(nid)

        return {
            "total_chunks": len(ids),
            "normas_indexadas": sorted(list(normas_unicas)),
            "total_normas": len(normas_unicas),
        }
    except Exception:
        return {
            "total_chunks": 0,
            "normas_indexadas": [],
            "total_normas": 0,
        }
