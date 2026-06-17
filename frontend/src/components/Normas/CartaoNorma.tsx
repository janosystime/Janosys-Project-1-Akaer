import type { Norma } from "./NormasViewModel";
import { CAT_ICONES, ORG_ORIGENS } from "./NormasViewModel";

type PropsCartaoNorma = {
  norma: Norma;
  onEdit?: (normaAtual: Norma) => void;
  onDelete?: (idParaDeletar: string) => void;
  onShowDetails: (normaAtual: Norma) => void;
  onViewPdf: (urlPdf: string, nomePdf: string) => void;
  onViewImages: (listaImagens: string[]) => void;
};

export default function CartaoNorma({
  norma,
  onEdit,
  onDelete,
  onShowDetails,
  onViewPdf,
  onViewImages,
}: PropsCartaoNorma) {
  const classeCorTema = `theme-cat-${norma.categoria.toLowerCase()}`;
  const possuiAnexos = norma.urlPdf || (norma.imagens && norma.imagens.length > 0);

  return (
    <div
      className={`norma-card ${classeCorTema} clicavel`}
      onClick={() => onShowDetails(norma)}
    >
      <div className="norma-card-body">
        <div className={`norma-card-main-icon ${classeCorTema}`}>
          <i
            className={`fas ${CAT_ICONES[norma.categoria] || "fa-file-lines"}`}
          ></i>
        </div>
        <div className="norma-info">
          <h3>
            {norma.id} <span className="codigo-norma">({norma.codigo})</span>
          </h3>
          <p className="norma-titulo">{norma.titulo}</p>
          <div className="badges-container">
            <span
              className={`badge theme-org-${norma.organizacao.toLowerCase()}`}
            >
              <span className="badge-origin">
                {ORG_ORIGENS[norma.organizacao] || "🌐"}
              </span>
              {norma.organizacao}
            </span>
            <span className={`badge ${classeCorTema}`}>
              <i
                className={`fas ${CAT_ICONES[norma.categoria] || "fa-tag"}`}
              ></i>{" "}
              {norma.categoria}
            </span>
            {norma.subcategoria && (
              <span className="badge theme-subcategoria">
                <i className="fas fa-layer-group"></i> {norma.subcategoria}
              </span>
            )}
            {norma.item && (
              <span className="badge theme-subcategoria badge-secundario">
                <i className="fas fa-cube"></i> {norma.item}
              </span>
            )}
            <span
              className={`badge ${norma.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}
            >
              <i
                className={`fas ${norma.tipo === "Pública" ? "fa-globe" : "fa-lock"}`}
              ></i>{" "}
              {norma.tipo}
            </span>
            <span className={`badge ${norma.status.toLowerCase()}`}>
              {norma.status === "Vigente" ? (
                <i className="fas fa-check-circle"></i>
              ) : (
                <i className="fas fa-times-circle"></i>
              )}{" "}
              {norma.status}
            </span>
            {possuiAnexos && (
              <span className="badge theme-subcategoria">
                <i className="fas fa-paperclip"></i> Anexos
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="norma-card-actions">
        {norma.urlPdf && (
          <button
            className="btn btn-info btn-icon"
            onClick={(eventoClique) => {
              eventoClique.stopPropagation();
              onViewPdf(norma.urlPdf!, norma.nomePdf || "documento.pdf");
            }}
            title="Visualizar PDF"
          >
            <i className="fas fa-file-pdf"></i>
          </button>
        )}

        {norma.imagens && norma.imagens.length > 0 && (
          <button
            className="btn btn-info btn-icon"
            onClick={(eventoClique) => {
              eventoClique.stopPropagation();
              onViewImages(norma.imagens!);
            }}
            title="Visualizar Imagens"
          >
            <i className="fas fa-images"></i>
          </button>
        )}

        {onEdit && (
          <button
            className="btn btn-warning btn-icon"
            onClick={(eventoClique) => {
              eventoClique.stopPropagation();
              onEdit(norma);
            }}
            title="Editar"
          >
            <i className="fas fa-pen"></i>
          </button>
        )}
        {onDelete && (
          <button
            className="btn btn-danger btn-icon"
            onClick={(eventoClique) => {
              eventoClique.stopPropagation();
              onDelete(norma.id);
            }}
            title="Excluir"
          >
            <i className="fas fa-trash"></i>
          </button>
        )}

      </div>
    </div>
  );
}
