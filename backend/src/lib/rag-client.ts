/**
 * rag-client.ts — Cliente assíncrono para o microserviço RAG do SIGNA
 *
 * Todas as chamadas são fire-and-forget: não bloqueiam a resposta ao frontend.
 * Erros são logados mas nunca propagados para o controller.
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from './prisma';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';
const PDF_DIR = path.join(__dirname, '..', '..', 'pdfs');

interface IngestPayload {
  norma_id: string;
  titulo: string;
  codigo: string;
  organizacao: string;
  categoria: string;
  notas: string[];
  pdf_base64: string | null;
  pdf_nome: string;
}

/**
 * Extrai o conteúdo do PDF como string base64 pura (sem prefixo data:).
 * Tenta primeiro do campo urlPdf (data URL), depois do arquivo físico em pdfs/.
 */
function extrairPdfBase64(norma: any): string | null {
  const url: string | null = norma?.urlPdf ?? null;
  if (!url) return null;

  // Caso 1: data URL (base64 embutido)
  if (url.startsWith('data:')) {
    const virgula = url.indexOf(',');
    return virgula >= 0 ? url.substring(virgula + 1) : url;
  }

  // Caso 2: path relativo — tenta ler do diretório de PDFs
  try {
    const nomeArquivo = path.basename(url);
    const caminho = path.join(PDF_DIR, nomeArquivo);
    if (fs.existsSync(caminho)) {
      const buffer = fs.readFileSync(caminho);
      return buffer.toString('base64');
    }
  } catch (err) {
    console.error('[RAG] Erro ao ler PDF do filesystem:', err);
  }

  return null;
}

/**
 * Monta o payload de ingestão a partir de um objeto norma do Prisma.
 */
function montarPayload(norma: any): IngestPayload {
  const notasArray = Array.isArray(norma.notas) ? norma.notas as string[] : [];

  return {
    norma_id: norma.id,
    titulo: norma.titulo || '',
    codigo: norma.codigo || '',
    organizacao: norma.organizacao || '',
    categoria: norma.categoria || '',
    notas: notasArray,
    pdf_base64: extrairPdfBase64(norma),
    pdf_nome: norma.nomePdf || `${norma.id}.pdf`,
  };
}

/**
 * Notifica o RAG para ingerir (ou re-ingerir) uma norma.
 * Fire-and-forget: nunca bloqueia, nunca lança exceção.
 */
export async function notificarIngestaoRAG(norma: any): Promise<void> {
  try {
    const payload = montarPayload(norma);
    console.log('[RAG] Ingestão disparada para norma:', norma.id);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    await fetch(`${RAG_SERVICE_URL}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    console.log('[RAG] Ingestão aceita pelo serviço RAG para norma:', norma.id);
  } catch (error) {
    console.error('[RAG] Erro ao notificar ingestão:', error);
  }
}

/**
 * Notifica o RAG para remover uma norma do índice.
 * Fire-and-forget: nunca bloqueia, nunca lança exceção.
 */
export async function notificarRemocaoRAG(normaId: string): Promise<void> {
  try {
    console.log('[RAG] Remoção disparada para norma:', normaId);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    await fetch(`${RAG_SERVICE_URL}/api/ingest/${encodeURIComponent(normaId)}`, {
      method: 'DELETE',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    console.log('[RAG] Remoção aceita pelo serviço RAG para norma:', normaId);
  } catch (error) {
    console.error('[RAG] Erro ao notificar remoção:', error);
  }
}

/**
 * Sincroniza todas as normas do banco com o serviço RAG.
 * Usado na inicialização do backend (bootstrap).
 * Fire-and-forget: loga erros mas nunca lança exceção.
 */
export async function sincronizarTodasNormasRAG(): Promise<void> {
  try {
    console.log('[RAG] Buscando todas as normas do banco para sincronização...');

    const todasNormas = await prisma.norma.findMany();
    const payloads: IngestPayload[] = todasNormas.map(montarPayload);

    console.log(`[RAG] Enviando ${payloads.length} normas para sincronização...`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000); // 5min timeout

    const response = await fetch(`${RAG_SERVICE_URL}/api/ingest/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ normas: payloads }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const resultado = await response.json();
      console.log('[RAG] Sincronização concluída:', resultado);
    } else {
      console.error('[RAG] Erro na sincronização, status:', response.status);
    }
  } catch (error) {
    console.error('[RAG] Erro ao sincronizar todas as normas:', error);
  }
}
