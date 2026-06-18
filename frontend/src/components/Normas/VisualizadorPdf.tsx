/**
 * VisualizadorPdf.tsx
 *
 * Visualizador protegido de PDFs do SIGNA com marca d'água em mosaico diagonal.
 * - Mantém react-pdf (Document / Page).
 * - Marca d'água via MarcaDaguaPdf (overlay SVG data-URI, sem dependências extras).
 * - Nome do usuário lido de obterUsuarioAtual() (sessão mock via localStorage).
 * - renderTextLayer e renderAnnotationLayer desativados.
 * - Menu de contexto bloqueado.
 * - Navegação multi-página preservada.
 */

import { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { obterUsuarioAtual } from "../../auth/session";
import { API_BASE_URL } from "../../config/api";
import MarcaDaguaPdf from "./MarcaDaguaPdf";

// Worker do pdf.js — configurado aqui (no componente que usa o Document) para
// funcionar em QUALQUER página que abra o visualizador (Home, Biblioteca, etc.).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// ─── Largura base da página ────────────────────────────────────────────────
const LARGURA_PAGINA = Math.min(window.innerWidth * 0.8, 800);

// ─── Props ─────────────────────────────────────────────────────────────────
type PropsVisualizadorPdf = {
  /** ID da norma — o PDF é carregado/baixado pelo backend (/normas/:id/view|download). */
  id: string;
  nome: string;
  onClose: () => void;
};

// ─── Componente ────────────────────────────────────────────────────────────
export default function VisualizadorPdf({
  id,
  nome,
  onClose,
}: PropsVisualizadorPdf) {
  // Sessão
  const usuario = obterUsuarioAtual();
  const nomeUsuario = usuario?.nome ?? "Usuário Desconhecido";

  // URL de visualização (PDF servido inline pelo backend; nunca mais estático público)
  const urlView = `${API_BASE_URL}/normas/${encodeURIComponent(id)}/view`;

  // Estado do botão de download
  const [baixando, setBaixando] = useState(false);

  // Baixa o PDF com marca d'água gravada (nome + data/hora + CONFIDENCIAL).
  // Usa fetch para enviar o header x-usuario-nome (um <a> simples não envia headers).
  const baixarComMarcaDagua = useCallback(async () => {
    setBaixando(true);
    try {
      const resposta = await fetch(
        `${API_BASE_URL}/normas/${encodeURIComponent(id)}/download`,
        { headers: { "x-usuario-nome": nomeUsuario } }
      );
      if (!resposta.ok) throw new Error("Falha no download");
      const blob = await resposta.blob();
      const urlBlob = URL.createObjectURL(blob);
      const ancora = document.createElement("a");
      ancora.href = urlBlob;
      ancora.download = nome || `${id}.pdf`;
      document.body.appendChild(ancora);
      ancora.click();
      ancora.remove();
      URL.revokeObjectURL(urlBlob);
    } catch {
      alert("Erro ao baixar o PDF. Tente novamente.");
    } finally {
      setBaixando(false);
    }
  }, [id, nome, nomeUsuario]);

  // Estado do documento
  const [totalPaginas, setTotalPaginas] = useState<number>();
  const [paginaAtual, setPaginaAtual] = useState<number>(1);

  // Altura real da página renderizada (atualizada por onRenderSuccess)
  const [alturaPagina, setAlturaPagina] = useState<number>(
    Math.round(LARGURA_PAGINA * 1.414) // A4 como estimativa inicial
  );

  // Ref para o wrapper da página (usado para leitura de altura real, se necessário)
  const wrapperPaginaRef = useRef<HTMLDivElement>(null);

  // ── Callbacks ──────────────────────────────────────────────────────────
  function onDocumentLoadSuccess({
    numPages,
  }: {
    numPages: number;
  }): void {
    setTotalPaginas(numPages);
    setPaginaAtual(1);
  }

  /**
   * Captura a altura real da página após renderização do canvas.
   * PageProps.onRenderSuccess recebe um objeto PageViewport com { height }.
   */
  const onPageRenderSuccess = useCallback(
    (page: { height: number; width: number }) => {
      if (page?.height) {
        setAlturaPagina(Math.round(page.height));
      }
    },
    []
  );

  const irParaPaginaAnterior = () =>
    setPaginaAtual((p) => Math.max(1, p - 1));

  const irParaProximaPagina = () =>
    setPaginaAtual((p) => Math.min(totalPaginas ?? p, p + 1));

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className="pdf-viewer-overlay"
      onClick={onClose}
    >
      <div
        className="pdf-viewer-container pdf-fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <i className="fas fa-file-pdf icon-pdf-red" />
            {nome}
          </div>
          <div className="pdf-viewer-actions">
            <button
              className="btn btn-primary"
              onClick={baixarComMarcaDagua}
              disabled={baixando}
              title="Baixar com marca d'água"
            >
              <i className={`fas ${baixando ? "fa-spinner fa-spin" : "fa-download"}`} />
              <span style={{ marginLeft: 6 }}>
                {baixando ? "Gerando..." : "Baixar (marca d'água)"}
              </span>
            </button>
            <button
              className="btn btn-danger btn-icon"
              onClick={onClose}
              title="Fechar"
            >
              <i className="fas fa-xmark" />
            </button>
          </div>
        </div>

        {/* Documento */}
        <div className="pdf-document-container">
          <Document
            file={urlView}
            onLoadSuccess={onDocumentLoadSuccess}
            renderMode="canvas"
            loading={
              <div className="pdf-loading-message">A carregar documento…</div>
            }
            error={
              <div className="pdf-error-message">Erro ao carregar o PDF.</div>
            }
          >
            {/*
             * Wrapper relativo: necessário para que a marca d'água (position:absolute)
             * fique exatamente sobre o canvas da página.
             */}
            <div
              ref={wrapperPaginaRef}
              style={{ position: "relative", display: "inline-block" }}
            >
              <Page
                key={`pagina-${paginaAtual}`}
                pageNumber={paginaAtual}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={LARGURA_PAGINA}
                onRenderSuccess={onPageRenderSuccess}
              />

              {/* Marca d'água sobreposta à página */}
              <MarcaDaguaPdf
                nomeUsuario={nomeUsuario}
                largura={LARGURA_PAGINA}
                altura={alturaPagina}
              />
            </div>
          </Document>
        </div>

        {/* Paginação */}
        {totalPaginas && totalPaginas > 1 && (
          <div className="pdf-pagination">
            <button
              className="btn btn-ghost btn-icon"
              disabled={paginaAtual <= 1}
              onClick={irParaPaginaAnterior}
              title="Página anterior"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <span className="pdf-page-indicator">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              className="btn btn-ghost btn-icon"
              disabled={paginaAtual >= totalPaginas}
              onClick={irParaProximaPagina}
              title="Próxima página"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}