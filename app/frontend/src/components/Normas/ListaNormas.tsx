import CartaoNorma from "./CartaoNorma";
import type { Norma } from "./NormasViewModel";

type PropsListaNormas = {
  normas: Norma[];
  normasFiltradas: Norma[];
  podeEditar: boolean;
  filtrosAtivos: boolean;
  onLimparFiltros: () => void;
  onEditar: (norma: Norma) => void;
  onExcluir: (id: string) => void;
  onVerDetalhes: (norma: Norma) => void;
  onVerPdf: (url: string, nome: string) => void;
  onVerImagens: (imagens: string[]) => void;
};

export default function ListaNormas({
  normas,
  normasFiltradas,
  podeEditar,
  filtrosAtivos,
  onLimparFiltros,
  onEditar,
  onExcluir,
  onVerDetalhes,
  onVerPdf,
  onVerImagens,
}: PropsListaNormas) {
  return (
    <>
      <p className="results-count">
        {normasFiltradas.length === normas.length
          ? `${normas.length} norma${normas.length !== 1 ? "s" : ""} no total`
          : `${normasFiltradas.length} de ${normas.length} norma${normas.length !== 1 ? "s" : ""}`}
      </p>

      <div className="normas-lista">
        {normasFiltradas.map((normaMapeada, indiceMapeado) => (
          <CartaoNorma
            key={indiceMapeado}
            norma={normaMapeada}
            onEdit={podeEditar ? onEditar : undefined}
            onDelete={podeEditar ? onExcluir : undefined}
            onShowDetails={onVerDetalhes}
            onViewPdf={onVerPdf}
            onViewImages={onVerImagens}
          />

        ))}
        {normasFiltradas.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <p>Nenhuma norma encontrada.</p>
            {filtrosAtivos && (
              <button className="btn btn-ghost" onClick={onLimparFiltros}>
                <i className="fas fa-filter-circle-xmark"></i> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
