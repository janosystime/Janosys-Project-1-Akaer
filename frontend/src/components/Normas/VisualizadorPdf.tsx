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
import { Document, Page } from "react-pdf";
import { obterUsuarioAtual } from "../../auth/session";
import MarcaDaguaPdf from "./MarcaDaguaPdf";

// ─── Largura base da página ────────────────────────────────────────────────
const LARGURA_PAGINA = Math.min(window.innerWidth * 0.8, 800);

// ─── Props ─────────────────────────────────────────────────────────────────
type PropsVisualizadorPdf = {
  url: string;
  nome: string;
  onClose: () => void;
};

// ─── Componente ────────────────────────────────────────────────────────────
export default function VisualizadorPdf({
  url,
  nome,
  onClose,
}: PropsVisualizadorPdf) {
  // Sessão
  const usuario = obterUsuarioAtual();
  const nomeUsuario = usuario?.nome ?? "Usuário Desconhecido";

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
      className="pdf-viewer-overlay protecao-conteudo"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="pdf-viewer-container pdf-fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <i className="fas fa-file-pdf icon-pdf-red" />
            {nome}{" "}
            <span className="pdf-protected-label">(Leitura Protegida)</span>
          </div>
          <div className="pdf-viewer-actions">
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
            file={url}
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
                renderTextLayer={false}
                renderAnnotationLayer={false}
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