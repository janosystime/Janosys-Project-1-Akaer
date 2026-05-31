import { useState } from "react";
import { Document, Page } from "react-pdf";

type PropsVisualizadorPdf = {
  url: string;
  nome: string;
  onClose: () => void;
};

export default function VisualizadorPdf({
  url,
  nome,
  onClose,
}: PropsVisualizadorPdf) {
  const [totalPaginas, setTotalPaginas] = useState<number>();
  const [paginaAtual, setPaginaAtual] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages: paginasEncontradas }: { numPages: number }): void {
    setTotalPaginas(paginasEncontradas);
  }

  return (
    <div
      className="pdf-viewer-overlay protecao-conteudo"
      onClick={onClose}
      onContextMenu={(eventoContexto) => eventoContexto.preventDefault()}
    >
      <div
        className="pdf-viewer-container pdf-fullscreen"
        onClick={(eventoClique) => eventoClique.stopPropagation()}
      >
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <i className="fas fa-file-pdf icon-pdf-red"></i>
            {nome} <span className="pdf-protected-label">(Leitura Protegida)</span>
          </div>
          <div className="pdf-viewer-actions">
            <button className="btn btn-danger btn-icon" onClick={onClose} title="Fechar">
              <i className="fas fa-xmark"></i>
            </button>
          </div>
        </div>

        <div className="pdf-document-container">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            renderMode="canvas"
            loading={<div className="pdf-loading-message">A carregar documento...</div>}
            error={<div className="pdf-error-message">Erro ao carregar o PDF.</div>}
          >
            <Page
              pageNumber={paginaAtual}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={Math.min(window.innerWidth * 0.8, 800)}
            />
          </Document>
        </div>

        {totalPaginas && totalPaginas > 1 && (
          <div className="pdf-pagination">
            <button
              className="btn btn-ghost btn-icon"
              disabled={paginaAtual <= 1}
              onClick={() => setPaginaAtual(paginaAnterior => paginaAnterior - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="pdf-page-indicator">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              className="btn btn-ghost btn-icon"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPaginaAtual(paginaAnterior => paginaAnterior + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
