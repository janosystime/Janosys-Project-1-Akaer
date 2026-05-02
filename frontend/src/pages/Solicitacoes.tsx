import { useState, useCallback } from "react";
import "../styles/Normas.css";
import { obterUsuarioAtual } from "../auth/session";

interface Solicitacao {
  id: number;
  codigo: string;
  titulo: string;
  motivo?: string;
  solicitante: string;
  data: string;
  status: "Aguardando análise" | "Em análise" | "Aceita" | "Indeferida";
  motivoRecusa?: string;
}

const SOLICITACOES_BASE: Solicitacao[] = [
  {
    id: 1,
    codigo: "AS9100",
    titulo: "Quality Management Systems - Requirements for Aviation",
    solicitante: "Ana Silva",
    data: "2026-03-01",
    status: "Aceita",
  },
  {
    id: 2,
    codigo: "MIL-STD-810",
    titulo: "Environmental Engineering Considerations and Laboratory Tests",
    solicitante: "Carlos Mendes",
    data: "2026-03-05",
    status: "Em análise",
  },
  {
    id: 3,
    codigo: "RTCA DO-160",
    titulo: "Environmental Conditions and Test Procedures for Airborne Equipment",
    solicitante: "Fernanda Rocha",
    data: "2026-03-10",
    status: "Aguardando análise",
  },
  {
    id: 4,
    codigo: "SAE ARP4754",
    titulo: "Guidelines for Development of Civil Aircraft and Systems",
    solicitante: "Marcos Oliveira",
    data: "2026-03-12",
    status: "Aguardando análise",
  },
  {
    id: 5,
    codigo: "MIL-STD-1553",
    titulo: "Digital Time Division Command/Response Multiplex Data Bus",
    solicitante: "Julia Ferreira",
    data: "2026-03-15",
    status: "Em análise",
  },
  {
    id: 6,
    codigo: "ASTM B117",
    titulo: "Standard Practice for Operating Salt Spray Apparatus",
    solicitante: "Ricardo Souza",
    data: "2026-03-18",
    status: "Indeferida",
  },
  {
    id: 7,
    codigo: "",
    titulo: "Norma de proteção contra corrosão em estruturas metálicas aeronáuticas",
    solicitante: "Patrícia Lima",
    data: "2026-03-20",
    status: "Aguardando análise",
  },
  {
    id: 8,
    codigo: "ISO 10007",
    titulo: "Quality Management - Guidelines for Configuration Management",
    solicitante: "Eduardo Costa",
    data: "2026-03-22",
    status: "Aceita",
  },
  {
    id: 9,
    codigo: "RTCA DO-178C",
    titulo: "Software Considerations in Airborne Systems and Equipment Certification",
    solicitante: "Beatriz Nunes",
    data: "2026-04-01",
    status: "Aguardando análise",
  },
  {
    id: 10,
    codigo: "ARP5412",
    titulo: "Aircraft Lightning Environment and Related Test Waveforms",
    solicitante: "Thiago Alves",
    data: "2026-04-10",
    status: "Em análise",
  },
];

interface ToastMsg {
  id: number;
  tipo: "sucesso" | "erro";
  mensagem: string;
}

function ToastContainer({
  toasts,
  onRemover,
}: {
  toasts: ToastMsg[];
  onRemover: (id: number) => void;
}) {
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

const STATUS_ESTILO: Record<Solicitacao["status"], string> = {
  "Aguardando análise": "badge badge-tipo-publica",
  "Em análise": "badge theme-subcategoria",
  "Aceita": "badge vigente",
  "Indeferida": "badge revogada",
};

const STATUS_ICONE: Record<Solicitacao["status"], string> = {
  "Aguardando análise": "fa-clock",
  "Em análise": "fa-magnifying-glass",
  "Aceita": "fa-check-circle",
  "Indeferida": "fa-times-circle",
};

const STATUS_ORDEM: Record<Solicitacao["status"], number> = {
  "Aguardando análise": 0,
  "Em análise": 1,
  "Aceita": 2,
  "Indeferida": 3,
};

const STATUS_OPCOES = ["Todos", "Aguardando análise", "Em análise", "Aceita", "Indeferida"];

export default function Solicitacoes() {
  const usuario = obterUsuarioAtual();
  const isAdmin = usuario?.perfil === "administrador";

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(SOLICITACOES_BASE);
  const [showModal, setShowModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [motivo, setMotivo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  {/* ── States: Modal de Análise de Solicitação ── */}
  const [solicitacaoAnalise, setSolicitacaoAnalise] = useState<Solicitacao | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [confirmacaoInsercao, setConfirmacaoInsercao] = useState(false);

  const adicionarToast = useCallback((tipo: ToastMsg["tipo"], mensagem: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removerToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleSolicitar = () => {
    if (!codigo.trim() && !titulo.trim()) {
      adicionarToast("erro", "Preencha ao menos um campo antes de solicitar.");
      return;
    }  

    const nova: Solicitacao = {
      id: Date.now(),
      codigo: codigo.trim(),
      titulo: titulo.trim(),
      motivo: motivo.trim(),
      solicitante: usuario?.nome ?? "Usuário",
      data: new Date().toISOString().split("T")[0],
      status: "Aguardando análise",
    };

    setSolicitacoes((prev) => [nova, ...prev]);
    setCodigo("");
    setTitulo("");
    setShowModal(false);
    setMotivo("");
    adicionarToast("sucesso", "Solicitação enviada com sucesso!");
  };

const atualizarStatus = (id: number, novoStatus: Solicitacao["status"], extras?: Partial<Solicitacao>) => {
  setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: novoStatus, ...extras } : s));
};

const abrirModalAnalise = (s: Solicitacao) => {
  setSolicitacaoAnalise(s);
  setMotivoRecusa("");
  setConfirmacaoInsercao(false);
  if (s.status === "Aguardando análise") {
    atualizarStatus(s.id, "Em análise");
  }
};

const termoMinusculo = termoPesquisa.toLowerCase();
const solicitacoesFiltradas = solicitacoes
  .filter((s) => {
    const matchBusca =
      s.codigo.toLowerCase().includes(termoMinusculo) ||
      s.titulo.toLowerCase().includes(termoMinusculo) ||
      s.solicitante.toLowerCase().includes(termoMinusculo);
    const matchStatus = filtroStatus === "Todos" || s.status === filtroStatus;
    return matchBusca && matchStatus;
  })
  .sort((a, b) => {
    // Primeiro ordena por status
    if (STATUS_ORDEM[a.status] !== STATUS_ORDEM[b.status]) {
      return STATUS_ORDEM[a.status] - STATUS_ORDEM[b.status];
    }
    // Depois por data — mais recente primeiro
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  const total = solicitacoes.length;
  const totalTexto = total === 1 ? "1 solicitação no total" : `${total} solicitações no total`;
  const filtradoTexto = `${solicitacoesFiltradas.length} de ${total} solicitações`;

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onRemover={removerToast} />

      <main className="page">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-clipboard-list"></i> Painel de Solicitações de Normas
          </h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-circle-plus"></i> Nova Solicitação
          </button>
        </div>

        {/* Filtros */}
        <div className="filtros-container">
          <div className="filtros-header">
            <div className="form-group search-group">
              <i className="fas fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Pesquisar por código, título ou solicitante..."
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
              <i className="fas fa-circle-dot"></i> Status:
            </span>
            {STATUS_OPCOES.map((s) => (
              <button
                key={s}
                className={`filter-badge ${filtroStatus === s ? "active theme-all" : ""}`}
                onClick={() => setFiltroStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">
          {solicitacoesFiltradas.length === total ? totalTexto : filtradoTexto}
        </p>

        {/* ── Lista de Solicitações ── */}
        <div className="normas-lista">
          {solicitacoesFiltradas.map((s) => (
            <div key={s.id} className="norma-card solicitacao-card" onClick={() => isAdmin && abrirModalAnalise(s)} style={{ cursor: isAdmin ? "pointer" : "default" }}>
              <div className="norma-card-body solicitacao-body">
                
                {/* Lado esquerdo — status, código e título */}
                <div className="badges-container" style={{ flex: 1 }}>
                  <span className={STATUS_ESTILO[s.status]}>
                    <i className={`fas ${STATUS_ICONE[s.status]}`}></i> {s.status}
                  </span>
                  {s.codigo && (
                    <span className="badge theme-subcategoria">
                      <i className="fas fa-hashtag"></i> {s.codigo}
                    </span>
                  )}
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--c-text-1)" }}>
                    {s.titulo || "Sem título"}
                  </span>
                </div>

                {/* Lado direito — solicitante e data (só admin) empilhados */}
                <div className="card-info-lateral">
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--c-text-muted)" }}>
                    <i className="fas fa-user" style={{ marginRight: 4 }}></i>{s.solicitante}
                  </span>
                  {isAdmin && (
                    <span style={{ fontSize: "0.68rem", color: "var(--c-text-muted)" }}>
                      <i className="fas fa-calendar" style={{ marginRight: 4 }}></i>
                      {new Date(s.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {solicitacoesFiltradas.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-clipboard"></i>
              <p>Nenhuma solicitação encontrada.</p>
            </div>
          )}
        </div>

        {/* ── Modal: Nova Solicitação ── */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-file-circle-plus"></i> Nova Solicitação
                </h2>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--c-text-muted)", marginBottom: 20 }}>
                Informe os dados da norma que deseja solicitar. Os campos não são obrigatórios.
              </p>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-hashtag"></i> Código
                </label>
                <input
                  className="form-input"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: AS9100, MIL-STD-810..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-heading"></i> Título
                </label>
                <input
                  className="form-input"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Nome ou descrição da norma..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-comment-alt"></i> Motivo da Solicitação
                </label>
                <textarea
                  className="form-input"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o motivo da solicitação..."
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <div></div>
                <div className="modal-footer-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSolicitar}>
                    <i className="fas fa-paper-plane"></i> Enviar Solicitação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Analisar Solicitação (admin) ── */}
        {solicitacaoAnalise && (
          <div className="modal-overlay" onClick={() => setSolicitacaoAnalise(null)}>
            <div className="modal modal-large modal-analisar" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-magnifying-glass-chart"></i> Analisar Solicitação</h2>
                <button type="button" className="btn-close" onClick={() => setSolicitacaoAnalise(null)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <div className="view-details">
                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-user"></i> Solicitante</span>
                    <span className="view-value">{solicitacaoAnalise.solicitante}</span>
                  </div>
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-calendar"></i> Data</span>
                    <span className="view-value">{new Date(solicitacaoAnalise.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  {solicitacaoAnalise.codigo && (
                    <div className="view-item">
                      <span className="view-label"><i className="fas fa-hashtag"></i> Código</span>
                      <span className="view-value">{solicitacaoAnalise.codigo}</span>
                    </div>
                  )}
                </div>

                <div className="view-item">
                  <span className="view-label"><i className="fas fa-heading"></i> Título</span>
                  <span className="view-value">{solicitacaoAnalise.titulo || "—"}</span>
                </div>

                {solicitacaoAnalise.motivo && (
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-comment-alt"></i> Motivo da Solicitação</span>
                    <span className="view-value">{solicitacaoAnalise.motivo}</span>
                  </div>
                )}

                <div className="view-item">
                  <span className="view-label"><i className="fas fa-circle-dot"></i> Status Atual</span>
                  <div className="view-badges">
                    <span className={STATUS_ESTILO[solicitacaoAnalise.status]}>
                      <i className={`fas ${STATUS_ICONE[solicitacaoAnalise.status]}`}></i> {solicitacaoAnalise.status}
                    </span>
                  </div>
                </div>

                {solicitacaoAnalise.status !== "Aceita" && solicitacaoAnalise.status !== "Indeferida" && (
                  <>
                    <div className="view-item">
                      <label className={`checkbox-card ${confirmacaoInsercao ? "checked theme-cat-geral" : ""}`}>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={confirmacaoInsercao}
                          onChange={(e) => setConfirmacaoInsercao(e.target.checked)}
                        />
                        <div className="checkbox-content">
                          <span className="checkbox-title">Confirmar inserção na biblioteca</span>
                          <span className="checkbox-desc">Confirmo que a norma foi inserida manualmente na Biblioteca de Normas.</span>
                        </div>
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="form-label"><i className="fas fa-times-circle"></i> Motivo da Recusa</label>
                      <textarea
                        className="form-input"
                        value={motivoRecusa}
                        onChange={(e) => setMotivoRecusa(e.target.value)}
                        placeholder="Obrigatório para indeferir..."
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {solicitacaoAnalise.status === "Indeferida" && solicitacaoAnalise.motivoRecusa && (
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-times-circle"></i> Motivo da Recusa</span>
                    <span className="view-value">{solicitacaoAnalise.motivoRecusa}</span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setSolicitacaoAnalise(null)}>
                  Fechar
                </button>
                {solicitacaoAnalise.status !== "Aceita" && solicitacaoAnalise.status !== "Indeferida" && (
                  <div className="modal-footer-actions">
                    <button
                      type="button"
                      className="btn btn-danger-solid"
                      onClick={() => {
                        if (!motivoRecusa.trim()) {
                          adicionarToast("erro", "Preencha o motivo da recusa antes de indeferir.");
                          return;
                        }
                        atualizarStatus(solicitacaoAnalise.id, "Indeferida", { motivoRecusa: motivoRecusa.trim() });
                        setSolicitacaoAnalise(null);
                        adicionarToast("erro", "Solicitação indeferida.");
                      }}
                    >
                      <i className="fas fa-times-circle"></i> Indeferir
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!confirmacaoInsercao}
                      onClick={() => {
                        atualizarStatus(solicitacaoAnalise.id, "Aceita");
                        setSolicitacaoAnalise(null);
                        adicionarToast("sucesso", "Solicitação aceita.");
                      }}
                    >
                      <i className="fas fa-check-circle"></i> Aceitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}