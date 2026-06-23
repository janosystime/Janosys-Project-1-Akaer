
import { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { obterUsuarioAtual } from "../../auth/session";
import MarcaDaguaPdf from "./MarcaDaguaPdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const LARGURA_PAGINA = Math.min(window.innerWidth * 0.8, 800);

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
  const usuario = obterUsuarioAtual();
  const nomeUsuario = usuario?.nome ?? "Usuário Desconhecido";

  const urlView = url;
  
  const [totalPaginas, setTotalPaginas] = useState<number>();
  const [paginaAtual, setPaginaAtual] = useState<number>(1);

  const [alturaPagina, setAlturaPagina] = useState<number>(
    Math.round(LARGURA_PAGINA * 1.414) 
  );

  const wrapperPaginaRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({
    numPages,
  }: {
    numPages: number;
  }): void {
    setTotalPaginas(numPages);
    setPaginaAtual(1);
  }

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

  return (
    <div
      className="pdf-viewer-overlay"
      onClick={onClose}
    >
      <div
        className="pdf-viewer-container pdf-fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <i className="fas fa-file-pdf icon-pdf-red" />
            {nome}
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

              <MarcaDaguaPdf
                nomeUsuario={nomeUsuario}
                largura={LARGURA_PAGINA}
                altura={alturaPagina}
              />
            </div>
          </Document>
        </div>

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