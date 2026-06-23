// frontend/src/pages/Versionamento.tsx
import { useState } from "react";
import { GitBranch, Search, RefreshCw, Layers, Calendar, User, FileText } from "lucide-react";
import "../styles/Normas.css";
import { historicoDb, type HistoricoEntry } from "../utils/storage";

const EVENTO_ESTILO: Record<HistoricoEntry["tipoAlteracao"], string> = {
  CADASTRO: "badge vigente",
  EDICAO: "badge theme-subcategoria",
  EXCLUSAO: "badge revogada",
};

const EVENTO_LABEL: Record<HistoricoEntry["tipoAlteracao"], string> = {
  CADASTRO: "Cadastro inicial",
  EDICAO: "Edição",
  EXCLUSAO: "Exclusão",
};

export default function Versionamento() {
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [filtroEvento, setFiltroEvento] = useState("Todos");
  const [versoes, setVersoes] = useState<HistoricoEntry[]>(() => historicoDb.list());

  const termoMinusculo = termoPesquisa.toLowerCase();
  const versoesFiltradas = versoes.filter((v) => {
    const matchBusca =
      v.normaId.toLowerCase().includes(termoMinusculo) ||
      v.tituloNorma.toLowerCase().includes(termoMinusculo) ||
      v.usuarioNome.toLowerCase().includes(termoMinusculo);
    const matchEvento = filtroEvento === "Todos" || v.tipoAlteracao === filtroEvento;
    return matchBusca && matchEvento;
  });

  return (
    <div className="app-container">
      <main className="page">
        <div className="page-header">
          <h1 className="page-title">
            <GitBranch style={{ marginRight: 8, color: "var(--c-theme)" }} />
            Versionamento de Normas
          </h1>
          <button className="btn btn-ghost" onClick={() => setVersoes(historicoDb.list())} title="Recarregar">
            <RefreshCw size={16} style={{ marginRight: 6 }} /> Atualizar
          </button>
        </div>

        <p style={{ color: "var(--c-text-muted)", fontSize: "0.9rem", marginTop: "-10px", marginBottom: "25px" }}>
          Histórico de alterações das normas. Cada cadastro, edição ou exclusão gera um registro automático.
        </p>

        <div className="filtros-container">
          <div className="filtros-header">
            <div className="form-group search-group">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Pesquisar por norma, título ou autor..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
              />
              {termoPesquisa && (
                <button className="search-clear" onClick={() => setTermoPesquisa("")}>
                  <i className="fas fa-xmark"></i>
                </button>
              )}
            </div>
          </div>
          <div className="filter-badges-row">
            <span className="filter-label">
              <Layers size={16} style={{ marginRight: 4, verticalAlign: "middle" }} /> Tipo:
            </span>
            {["Todos", "CADASTRO", "EDICAO", "EXCLUSAO"].map((t) => (
              <button
                key={t}
                className={`filter-badge ${filtroEvento === t ? "active theme-all" : ""}`}
                onClick={() => setFiltroEvento(t)}
              >
                {t === "Todos" ? "Todos" : t === "CADASTRO" ? "Cadastro" : t === "EDICAO" ? "Edição" : "Exclusão"}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">{versoesFiltradas.length} registros encontrados</p>

        <div className="tabela-container" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <table className="tabela-usuarios">
            <thead>
              <tr>
                <th style={{ width: "15%" }}><Calendar size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Data / Hora</th>
                <th style={{ width: "12%" }}><Layers size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Tipo</th>
                <th style={{ width: "15%" }}><FileText size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Norma</th>
                <th>Detalhes</th>
                <th style={{ width: "16%" }}><User size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Autor</th>
              </tr>
            </thead>
            <tbody>
              {versoesFiltradas.map((v) => (
                <tr key={v.id} className="row-hover-animation">
                  <td style={{ fontSize: "0.82rem", color: "var(--c-text-2)" }}>
                    {new Date(v.data).toLocaleString("pt-BR")}
                  </td>
                  <td>
                    <span className={EVENTO_ESTILO[v.tipoAlteracao]} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                      {EVENTO_LABEL[v.tipoAlteracao]}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.82rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--c-text-1)" }}>{v.normaId}</div>
                    {v.codigoNorma && (
                      <span style={{ fontSize: "0.72rem", color: "var(--c-text-muted)" }}>
                        cód. {v.codigoNorma}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--c-text-2)", lineHeight: "1.4" }}>
                    {v.detalhes}
                  </td>
                  <td>
                    <div className="td-nome" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      <div className="usuario-avatar-mini" style={{ width: 24, height: 24, fontSize: "0.65rem" }}>
                        {v.usuarioNome.slice(0, 2).toUpperCase()}
                      </div>
                      {v.usuarioNome}
                    </div>
                  </td>
                </tr>
              ))}
              {versoesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state compact">
                      <GitBranch size={40} color="var(--c-text-muted)" />
                      <p>Nenhum registro encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}