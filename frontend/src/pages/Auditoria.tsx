import { useState, useEffect, useCallback } from "react";
import { History, ShieldAlert, Search, RefreshCw, Layers, Calendar, User, FileText } from "lucide-react";
import "../styles/Normas.css";

interface LogAuditoria {
  id: number;
  normaId: string;
  codigoNorma: string | null;
  tituloNorma: string;
  usuarioNome: string;
  tipoAlteracao: "CADASTRO" | "EDICAO" | "EXCLUSAO";
  detalhes: string;
  data: string;
}

interface ToastMsg {
  id: number;
  tipo: "sucesso" | "erro";
  mensagem: string;
}

function ToastContainer({ toasts, onRemover }: { toasts: ToastMsg[]; onRemover: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tipo}`}>
          <i className={`fas ${t.tipo === "sucesso" ? "fa-check-circle" : "fa-circle-exclamation"}`}></i>
          <span>{t.mensagem}</span>
          <button className="toast-close" onClick={() => onRemover(t.id)}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
}

const TIPO_ESTILO: Record<LogAuditoria["tipoAlteracao"], string> = {
  CADASTRO: "badge vigente",
  EDICAO: "badge theme-subcategoria",
  EXCLUSAO: "badge revogada",
};

const TIPO_ICONE: Record<LogAuditoria["tipoAlteracao"], string> = {
  CADASTRO: "fa-plus-circle",
  EDICAO: "fa-pen-to-square",
  EXCLUSAO: "fa-trash-can",
};

export default function Auditoria() {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const adicionarToast = useCallback((tipo: ToastMsg["tipo"], mensagem: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removerToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Fetch auditoria logs
  const fetchLogs = useCallback(async () => {
    setCarregando(true);
    try {
      const response = await fetch("http://localhost:3001/historico");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        adicionarToast("erro", "Erro ao carregar logs de auditoria.");
      }
    } catch (err) {
      adicionarToast("erro", "Não foi possível conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }, [adicionarToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtragem dos logs
  const termoMinusculo = termoPesquisa.toLowerCase();
  const logsFiltrados = logs.filter((log) => {
    const matchBusca =
      log.normaId.toLowerCase().includes(termoMinusculo) ||
      (log.codigoNorma && log.codigoNorma.toLowerCase().includes(termoMinusculo)) ||
      log.tituloNorma.toLowerCase().includes(termoMinusculo) ||
      log.usuarioNome.toLowerCase().includes(termoMinusculo) ||
      log.detalhes.toLowerCase().includes(termoMinusculo);

    const matchTipo = filtroTipo === "Todos" || log.tipoAlteracao === filtroTipo;

    return matchBusca && matchTipo;
  });

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onRemover={removerToast} />

      <main className="page">
        {/* Header da Página */}
        <div className="page-header">
          <h1 className="page-title">
            <ShieldAlert style={{ marginRight: 8, color: "var(--c-theme)" }} /> 
            Auditoria & Logs do Sistema
          </h1>
          <button className="btn btn-ghost" onClick={fetchLogs} disabled={carregando} title="Recarregar logs">
            <RefreshCw size={16} className={carregando ? "fa-spin" : ""} style={{ marginRight: 6 }} />
            Atualizar
          </button>
        </div>

        <p style={{ color: "var(--c-text-muted)", fontSize: "0.9rem", marginTop: "-10px", marginBottom: "25px" }}>
          Painel administrativo de segurança. Monitora nativamente em tempo real as operações de inclusão, alteração e exclusão acionadas via Triggers no banco de dados MySQL.
        </p>

        {/* Filtros e Busca */}
        <div className="filtros-container">
          <div className="filtros-header">
            <div className="form-group search-group">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Pesquisar por norma, código, usuário ou detalhes da alteração..."
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
              <Layers size={16} style={{ marginRight: 4, verticalAlign: "middle" }} /> Tipo de Log:
            </span>
            {["Todos", "CADASTRO", "EDICAO", "EXCLUSAO"].map((t) => (
              <button
                key={t}
                className={`filter-badge ${filtroTipo === t ? "active theme-all" : ""}`}
                onClick={() => setFiltroTipo(t)}
              >
                {t === "Todos" ? "Todos" : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">
          {carregando ? "Carregando logs..." : `${logsFiltrados.length} registros de auditoria encontrados`}
        </p>

        {/* Tabela de Logs */}
        {carregando ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <RefreshCw size={32} className="fa-spin" color="var(--c-theme)" />
          </div>
        ) : (
          <div className="tabela-container" style={{ maxHeight: "65vh", overflowY: "auto" }}>
            <table className="tabela-usuarios">
              <thead>
                <tr>
                  <th style={{ width: "15%" }}><Calendar size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Data / Hora</th>
                  <th style={{ width: "12%" }}><Layers size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Ação</th>
                  <th style={{ width: "18%" }}><User size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Executor</th>
                  <th style={{ width: "18%" }}><FileText size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Norma</th>
                  <th>Detalhes da Operação</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map((log) => (
                  <tr key={log.id} className="row-hover-animation" style={{ transition: "all 0.2s" }}>
                    <td style={{ fontSize: "0.82rem", color: "var(--c-text-2)" }}>
                      {new Date(log.data).toLocaleString("pt-BR")}
                    </td>
                    <td>
                      <span className={TIPO_ESTILO[log.tipoAlteracao]} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                        <i className={`fas ${TIPO_ICONE[log.tipoAlteracao]} badge-icon`}></i>
                        {log.tipoAlteracao}
                      </span>
                    </td>
                    <td>
                      <div className="td-nome" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        <div className="usuario-avatar-mini" style={{ width: 24, height: 24, fontSize: "0.65rem" }}>
                          {log.usuarioNome.slice(0, 2).toUpperCase()}
                        </div>
                        {log.usuarioNome}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--c-text-1)" }}>
                        {log.normaId}
                      </div>
                      {log.codigoNorma && (
                        <span style={{ fontSize: "0.72rem", color: "var(--c-text-muted)" }}>
                          ({log.codigoNorma})
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--c-text-2)", lineHeight: "1.4" }}>
                      {log.detalhes}
                    </td>
                  </tr>
                ))}

                {logsFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state compact">
                        <History size={40} color="var(--c-text-muted)" />
                        <p>Nenhum registro de auditoria encontrado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
