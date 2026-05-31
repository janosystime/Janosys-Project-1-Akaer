import { CAT_ICONES, CATEGORIAS, STATUS_OPCOES } from "./NormasViewModel";

type PropsFiltrosNormas = {
  termoPesquisa: string;
  onTermoPesquisaChange: (valor: string) => void;
  filtrosAtivos: boolean;
  onLimparFiltros: () => void;
  filtroCategoria: string;
  filtroSubcategoria: string;
  filtroItem: string;
  filtroStatus: string;
  subcategoriasDisponiveis: string[];
  itensDisponiveis: string[];
  onCategoriaChange: (categoria: string) => void;
  onSubcategoriaChange: (subcategoria: string) => void;
  onItemChange: (item: string) => void;
  onStatusChange: (status: string) => void;
};

export default function FiltrosNormas({
  termoPesquisa,
  onTermoPesquisaChange,
  filtrosAtivos,
  onLimparFiltros,
  filtroCategoria,
  filtroSubcategoria,
  filtroItem,
  filtroStatus,
  subcategoriasDisponiveis,
  itensDisponiveis,
  onCategoriaChange,
  onSubcategoriaChange,
  onItemChange,
  onStatusChange,
}: PropsFiltrosNormas) {
  return (
    <div className="filtros-container">
      <div className="filtros-header">
        <div className="form-group search-group">
          <i className="fas fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Pesquisar por ID, Código, Título ou Palavra-chave..."
            value={termoPesquisa}
            onChange={(eventoMudanca) => onTermoPesquisaChange(eventoMudanca.target.value)}
          />
          {termoPesquisa && (
            <button
              className="search-clear"
              onClick={() => onTermoPesquisaChange("")}
              title="Limpar busca"
            >
              <i className="fas fa-xmark"></i>
            </button>
          )}
        </div>

        {filtrosAtivos && (
          <button
            className="btn btn-limpar-filtros"
            onClick={onLimparFiltros}
          >
            <i className="fas fa-filter-circle-xmark"></i> Limpar filtros
          </button>
        )}
      </div>

      <div className="filter-badges-row">
        <span className="filter-label">
          <i className="fas fa-tags"></i> Categoria:
        </span>
        <button
          className={`filter-badge ${filtroCategoria === "Todas" ? "active theme-all" : ""}`}
          onClick={() => onCategoriaChange("Todas")}
        >
          <i className="fas fa-border-all"></i> Todas
        </button>
        {CATEGORIAS.map((nomeCategoriaAtual) => (
          <button
            key={nomeCategoriaAtual}
            className={`filter-badge theme-cat-${nomeCategoriaAtual.toLowerCase()} ${filtroCategoria === nomeCategoriaAtual ? "active" : ""}`}
            onClick={() => onCategoriaChange(nomeCategoriaAtual)}
          >
            <i
              className={`fas ${CAT_ICONES[nomeCategoriaAtual] || "fa-tag"}`}
            ></i>{" "}
            {nomeCategoriaAtual}
          </button>
        ))}
      </div>

      {filtroCategoria !== "Todas" &&
        subcategoriasDisponiveis.length > 0 && (
          <div className="filter-badges-row sub-row">
            <span className="filter-label">
              <i className="fas fa-layer-group"></i> Subcategoria:
            </span>
            <button
              className={`filter-badge ${filtroSubcategoria === "" ? "active theme-all" : ""}`}
              onClick={() => onSubcategoriaChange("")}
            >
              <i className="fas fa-border-all"></i> Todas
            </button>
            {subcategoriasDisponiveis.map((nomeSubcategoriaAtual) => (
              <button
                key={nomeSubcategoriaAtual}
                className={`filter-badge theme-subcategoria ${filtroSubcategoria === nomeSubcategoriaAtual ? "active" : ""}`}
                onClick={() =>
                  onSubcategoriaChange(nomeSubcategoriaAtual)
                }
              >
                <i className="fas fa-layer-group"></i> {nomeSubcategoriaAtual}
              </button>
            ))}
          </div>
        )}

      {filtroSubcategoria !== "" && itensDisponiveis.length > 0 && (
        <div className="filter-badges-row item-row">
          <span className="filter-label">
            <i className="fas fa-cube"></i> Item:
          </span>
          <button
            className={`filter-badge ${filtroItem === "" ? "active theme-all" : ""}`}
            onClick={() => onItemChange("")}
          >
            <i className="fas fa-border-all"></i> Todos
          </button>
          {itensDisponiveis.map((nomeItemAtual) => (
            <button
              key={nomeItemAtual}
              className={`filter-badge theme-subcategoria ${filtroItem === nomeItemAtual ? "active" : ""}`}
              onClick={() => onItemChange(nomeItemAtual)}
            >
              <i className="fas fa-cube"></i> {nomeItemAtual}
            </button>
          ))}
        </div>
      )}

      <div className="filter-badges-row">
        <span className="filter-label">
          <i className="fas fa-circle-dot"></i> Status:
        </span>
        <button
          className={`filter-badge ${filtroStatus === "Todos" ? "active theme-all" : ""}`}
          onClick={() => onStatusChange("Todos")}
        >
          <i className="fas fa-border-all"></i> Todos
        </button>
        {STATUS_OPCOES.map((nomeStatusAtual) => (
          <button
            key={nomeStatusAtual}
            className={`filter-badge filter-badge-status-${nomeStatusAtual.toLowerCase()} ${filtroStatus === nomeStatusAtual ? "active" : ""}`}
            onClick={() => onStatusChange(nomeStatusAtual)}
          >
            {nomeStatusAtual === "Vigente" ? (
              <i className="fas fa-check-circle"></i>
            ) : (
              <i className="fas fa-times-circle"></i>
            )}{" "}
            {nomeStatusAtual}
          </button>
        ))}
      </div>
    </div>
  );
}
