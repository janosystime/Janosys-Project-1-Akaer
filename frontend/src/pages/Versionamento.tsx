import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config/api";
import { GitBranch, Search, RefreshCw, Layers, Calendar, User, FileText, CircleDot } from "lucide-react";
import "../styles/Normas.css";

interface VersaoNorma {
  id: number;
  normaId: string;
  numero: number;
  evento: "CADASTRO" | "EDICAO";
  titulo: string;
  status: string;
  revisao: string | null;
  usuarioNome: string | null;
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

const EVENTO_ESTILO: Record<VersaoNorma["evento"], string> = {
  CADASTRO: "badge vigente",
  EDICAO: "badge theme-subcategoria",
};

const EVENTO_LABEL: Record<VersaoNorma["evento"], string> = {
  CADASTRO: "Cadastro inicial",
  EDICAO: "Edição",
};

export default function Versionamento() {
  const [versoes, setVersoes] = useState<VersaoNorma[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [filtroEvento, setFiltroEvento] = useState("Todos");
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const adicionarToast = useCallback((tipo: ToastMsg["tipo"], mensagem: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removerToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchVersoes = useCallback(async () => {
    setCarregando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/normas/versoes`);
      if (response.ok) {
        const data = await response.json();
        setVersoes(data);
      } else {
        adicionarToast("erro", "Erro ao carregar o versionamento.");
      }
    } catch {
      adicionarToast("erro", "Não foi possível conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }, [adicionarToast]);

  useEffect(() => {
    fetchVersoes();
  }, [fetchVersoes]);

  const termoMinusculo = termoPesquisa.toLowerCase();
  const versoesFiltradas = versoes.filter((v) => {
    const matchBusca =
      v.normaId.toLowerCase().includes(termoMinusculo) ||
      v.titulo.toLowerCase().includes(termoMinusculo) ||
      (v.usuarioNome && v.usuarioNome.toLowerCase().includes(termoMinusculo));

    const matchEvento = filtroEvento === "Todos" || v.evento === filtroEvento;

    return matchBusca && matchEvento;
  });

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onRemover={removerToast} />

      <main className="page">
        <div className="page-header">
          <h1 className="page-title">
            <GitBranch style={{ marginRight: 8, color: "var(--c-theme)" }} />
            Versionamento de Normas
          </h1>
          <button className="btn btn-ghost" onClick={fetchVersoes} disabled={carregando} title="Recarregar versões">
            <RefreshCw size={16} className={carregando ? "fa-spin" : ""} style={{ marginRight: 6 }} />
            Atualizar
          </button>
        </div>

        <p style={{ color: "var(--c-text-muted)", fontSize: "0.9rem", marginTop: "-10px", marginBottom: "25px" }}>
          Histórico de versões das normas. Cada cadastro gera a versão 1 e cada edição cria uma nova versão,
          preservando o estado anterior (título, status, revisão e autor de cada momento).
        </p>

        <div className="filtros-container">
          <div className="filtros-header">
            <div className="form-group search-group">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Pesquisar por norma, título ou autor da versão..."
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
            {["Todos", "CADASTRO", "EDICAO"].map((t) => (
              <button
                key={t}
                className={`filter-badge ${filtroEvento === t ? "active theme-all" : ""}`}
                onClick={() => setFiltroEvento(t)}
              >
                {t === "Todos" ? "Todos" : t === "CADASTRO" ? "Cadastro" : "Edição"}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">
          {carregando ? "Carregando versões..." : `${versoesFiltradas.length} versões encontradas`}
        </p>

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
                  <th style={{ width: "10%" }}><GitBranch size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Versão</th>
                  <th style={{ width: "15%" }}><FileText size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Norma</th>
                  <th>Título</th>
                  <th style={{ width: "12%" }}><CircleDot size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Status</th>
                  <th style={{ width: "16%" }}><User size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Autor</th>
                </tr>
              </thead>
              <tbody>
                {versoesFiltradas.map((v) => (
                  <tr key={v.id} className="row-hover-animation" style={{ transition: "all 0.2s" }}>
                    <td style={{ fontSize: "0.82rem", color: "var(--c-text-2)" }}>
                      {new Date(v.data).toLocaleString("pt-BR")}
                    </td>
                    <td>
                      <span className={EVENTO_ESTILO[v.evento]} style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                        v{v.numero} · {EVENTO_LABEL[v.evento]}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--c-text-1)" }}>{v.normaId}</div>
                      {v.revisao && (
                        <span style={{ fontSize: "0.72rem", color: "var(--c-text-muted)" }}>
                          rev. {v.revisao}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--c-text-2)", lineHeight: "1.4" }}>
                      {v.titulo}
                    </td>
                    <td>
                      <span className={`badge ${v.status.toLowerCase()}`} style={{ fontSize: "0.72rem" }}>
                        {v.status}
                      </span>
                    </td>
                    <td>
                      <div className="td-nome" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        <div className="usuario-avatar-mini" style={{ width: 24, height: 24, fontSize: "0.65rem" }}>
                          {(v.usuarioNome ?? "—").slice(0, 2).toUpperCase()}
                        </div>
                        {v.usuarioNome ?? "—"}
                      </div>
                    </td>
                  </tr>
                ))}

                {versoesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state compact">
                        <GitBranch size={40} color="var(--c-text-muted)" />
                        <p>Nenhuma versão encontrada.</p>
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
