/*
 * Usuarios.tsx — gerenciamento de usuários do sistema.
 * Acessível somente pelo administrador (proteção feita no App.tsx).
 */

import { useState, useCallback, useEffect } from "react";
import "../styles/Normas.css";
import "../styles/Usuarios.css";

// ============================================
// SIGNA — Tipos e Interface de Usuário
// ============================================
export type PerfilUsuario = "administrador" | "usuario" | "checker";

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  senha: string;
  perfil: PerfilUsuario;
  telefone: string;
  departamento: string;
  dataCriacao: string;
}

// ============================================
// SIGNA — Camada de dados (mock localStorage)
// Substituir estas funções pelas chamadas à API quando o BD estiver pronto:
// Ex: GET /api/usuarios | POST /api/usuarios | PUT /api/usuarios/:id | DELETE /api/usuarios/:id
// ============================================
const STORAGE_KEY = "signa_usuarios";

const USUARIOS_INICIAIS: Usuario[] = [
  {
    id: 1,
    nome: "Administrador Janosys",
    login: "admin",
    senha: "123",
    perfil: "administrador",
    telefone: "(12) 99999-0001",
    departamento: "TI",
    dataCriacao: "2026-01-01",
  },
  {
    id: 2,
    nome: "Usuario Janosys",
    login: "usuario",
    senha: "123",
    perfil: "usuario",
    telefone: "(12) 99999-0002",
    departamento: "Engenharia",
    dataCriacao: "2026-01-02",
  },
  {
    id: 3,
    nome: "Checker Janosys",
    login: "checker",
    senha: "123",
    perfil: "checker",
    telefone: "(12) 99999-0003",
    departamento: "Operações",
    dataCriacao: "2026-01-03",
  },
];

function carregarUsuarios(): Usuario[] {
  const salvo = localStorage.getItem(STORAGE_KEY);
  return salvo ? JSON.parse(salvo) : USUARIOS_INICIAIS;
}

function salvarUsuarios(lista: Usuario[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

// ============================================
// SIGNA — Toast
// ============================================
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

// ============================================
// SIGNA — Badge de perfil
// ============================================
const PERFIL_ESTILO: Record<PerfilUsuario, string> = {
  administrador: "badge theme-cat-instalação",
  usuario:    "badge theme-cat-conjunto",
  checker:      "badge theme-subcategoria",
};

const PERFIL_ICONE: Record<PerfilUsuario, string> = {
  administrador: "fa-shield-halved",
  usuario:    "fa-helmet-safety",
  checker:      "fa-user",
};

const PERFIL_SIGLA: Record<PerfilUsuario, string> = {
  administrador: "ADM",
  usuario: "USU",
  checker: "CHK",
};

const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  administrador: "ADM",
  usuario: "USU",
  checker: "CHK",
};

// ============================================
// SIGNA — Formulário vazio
// ============================================
const FORM_VAZIO = {
  nome: "",
  login: "",
  senha: "",
  perfil: "usuario" as PerfilUsuario,
  telefone: "",
  departamento: "",
};

// ============================================
// SIGNA — Componente Principal
// ============================================
export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [filtroPerfil, setFiltroPerfil] = useState("Todos");
  const [filtroDepartamento, setFiltroDepartamento] = useState("Todos");
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

  // Modal de cadastro/edição
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Modal de confirmação de exclusão
  const [usuarioExcluindo, setUsuarioExcluindo] = useState<Usuario | null>(null);

  // ── Toast ──
  const adicionarToast = useCallback((tipo: ToastMsg["tipo"], mensagem: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, tipo, mensagem }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removerToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Carregar dados da API
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch("http://localhost:3001/usuarios");
        if (response.ok) {
          const data = await response.json();
          setUsuarios(data);
        } else {
          adicionarToast("erro", "Erro ao buscar usuários no servidor.");
        }
      } catch (err) {
        adicionarToast("erro", "Erro ao conectar com a API de usuários.");
      }
    }
    fetchUsuarios();
  }, [adicionarToast]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Filtro ──
  const departamentos = ["Todos", ...Array.from(new Set(usuarios.map(u => u.departamento).filter(Boolean)))];

  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = termoPesquisa.toLowerCase();
    const matchBusca =
      u.nome.toLowerCase().includes(termo) ||
      u.login.toLowerCase().includes(termo) ||
      u.departamento.toLowerCase().includes(termo) ||
      u.perfil.toLowerCase().includes(termo);
    const matchPerfil = filtroPerfil === "Todos" || u.perfil === filtroPerfil;
    const matchDepartamento = filtroDepartamento === "Todos" || u.departamento === filtroDepartamento;
    return matchBusca && matchPerfil && matchDepartamento;
  }).sort((a, b) => ordemAsc
  ? a.nome.localeCompare(b.nome)
  : b.nome.localeCompare(a.nome)
  );
  

  // ── Abrir modal novo ──
  function abrirModalNovo() {
    setUsuarioEditando(null);
    setForm(FORM_VAZIO);
    setSenhaVisivel(false);
    setModalAberto(true);
  }

  // ── Abrir modal edição ──
  function abrirModalEdicao(u: Usuario) {
    setUsuarioEditando(u);
    setForm({
      nome: u.nome,
      login: u.login,
      senha: "", // Don't autofill hashed password
      perfil: u.perfil,
      telefone: u.telefone,
      departamento: u.departamento,
    });
    setSenhaVisivel(false);
    setModalAberto(true);
  }

  // ── Salvar (criar ou editar) ──
  async function handleSalvar() {
    if (!form.nome.trim() || !form.login.trim()) {
      adicionarToast("erro", "Nome e login são obrigatórios.");
      return;
    }

    if (!usuarioEditando && !form.senha.trim()) {
      adicionarToast("erro", "A senha é obrigatória para novos usuários.");
      return;
    }

    try {
      if (usuarioEditando) {
        const response = await fetch(`http://localhost:3001/usuarios/${usuarioEditando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        if (response.ok) {
          const atualizado = await response.json();
          setUsuarios((prev) =>
            prev.map((u) => (u.id === usuarioEditando.id ? atualizado : u))
          );
          adicionarToast("sucesso", "Usuário atualizado com sucesso.");
          setModalAberto(false);
        } else {
          const errorData = await response.json();
          adicionarToast("erro", errorData.error || "Erro ao atualizar usuário.");
        }
      } else {
        const response = await fetch("http://localhost:3001/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        if (response.ok) {
          const novo = await response.json();
          setUsuarios((prev) => [novo, ...prev]);
          adicionarToast("sucesso", "Usuário criado com sucesso.");
          setModalAberto(false);
        } else {
          const errorData = await response.json();
          adicionarToast("erro", errorData.error || "Erro ao criar usuário.");
        }
      }
    } catch (err) {
      adicionarToast("erro", "Erro ao conectar com o servidor.");
    }
  }

  // ── Excluir ──
  async function handleExcluir() {
    if (!usuarioExcluindo) return;
    
    try {
      const response = await fetch(`http://localhost:3001/usuarios/${usuarioExcluindo.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setUsuarios((prev) => prev.filter((u) => u.id !== usuarioExcluindo.id));
        adicionarToast("sucesso", "Usuário removido.");
        setUsuarioExcluindo(null);
      } else {
        const errorData = await response.json();
        adicionarToast("erro", errorData.error || "Erro ao remover usuário.");
      }
    } catch (err) {
      adicionarToast("erro", "Erro ao conectar com o servidor.");
    }
  }

  // ── Render ──
  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onRemover={removerToast} />

      <main className="page">

        {/* ── Header ── */}
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-users"></i> Gerenciamento de Usuários
          </h1>
          <button className="btn btn-primary" onClick={abrirModalNovo}>
            <i className="fas fa-user-plus"></i> Novo Usuário
          </button>
        </div>

        {/* ── Busca ── */}
        <div className="filtros-container">
          <div className="filtros-header">
            <div className="form-group search-group">
              <i className="fas fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Pesquisar por nome, login, perfil ou departamento..."
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
            <span className="filter-label"><i className="fas fa-shield-halved"></i> Perfil:</span>
            {["Todos", "administrador", "usuario", "checker"].map((p) => (
              <button
                key={p}
                className={`filter-badge ${filtroPerfil === p ? "active theme-all" : ""}`}
                onClick={() => setFiltroPerfil(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="filter-badges-row">
            <span className="filter-label"><i className="fas fa-building"></i> Departamento:</span>
            {departamentos.map((d) => (
              <button
                key={d}
                className={`filter-badge ${filtroDepartamento === d ? "active theme-all" : ""}`}
                onClick={() => setFiltroDepartamento(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">
          {usuariosFiltrados.length === usuarios.length
            ? `${usuarios.length} ${usuarios.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}`
            : `${usuariosFiltrados.length} de ${usuarios.length} usuários`}
        </p>

        {/* ── Tabela / Cards ── */}
        {isMobile ? (
          <div className="usuarios-cards">
            <button className="btn-sort btn-sort-mobile" onClick={() => setOrdemAsc((v) => !v)}>
              <i className="fas fa-right-left" style={{ transform: "rotate(90deg)" }}></i>
              {ordemAsc ? "A → Z" : "Z → A"}
            </button>
            {usuariosFiltrados.map((u) => (
              <div key={u.id} className="usuario-card" onClick={() => setUsuarioSelecionado(u)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="usuario-card-nome">{u.nome}</div>
                  <span className={PERFIL_ESTILO[u.perfil]} style={{ fontSize: "0.72rem" }}>
                    <i className={`fas ${PERFIL_ICONE[u.perfil]} badge-icon`}></i>
                    {PERFIL_LABEL[u.perfil]}
                  </span>
                </div>
                <div className="usuario-card-body">
                  <span className="usuario-card-label"><i className="fas fa-at"></i> Login</span>
                  <span className="usuario-card-value td-mono">{u.login}</span>
                  <span className="usuario-card-label"><i className="fas fa-building"></i> Departamento</span>
                  <span className="usuario-card-value">{u.departamento || "—"}</span>
                  <span className="usuario-card-label"><i className="fas fa-phone"></i> Telefone</span>
                  <span className="usuario-card-value">{u.telefone || "—"}</span>
                </div>
              </div>
            ))}
            {usuariosFiltrados.length === 0 && (
              <div className="empty-state compact">
                <i className="fas fa-users-slash"></i>
                <p>Nenhum usuário encontrado.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="tabela-container">
            <table className="tabela-usuarios">
              <thead>
                <tr>
                  <th>
                    <button className="btn-sort" onClick={() => setOrdemAsc((v) => !v)} title="Ordenar por nome">
                      <i className="fas fa-user"></i> Nome
                      <i className="fas fa-right-left" style={{ marginLeft: 6, fontSize: "0.8rem", transform: "rotate(90deg)" }}></i>
                    </button>
                  </th>
                  <th><i className="fas fa-at"></i> Login</th>
                  <th><i className="fas fa-shield-halved"></i> Perfil</th>
                  <th><i className="fas fa-building"></i> Departamento</th>
                  <th><i className="fas fa-phone"></i> Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="td-nome">
                        <div className="usuario-avatar-mini">{PERFIL_SIGLA[u.perfil]}</div>
                        {u.nome}
                      </div>
                    </td>
                    <td className="td-mono">{u.login}</td>
                    <td>
                      <span className={PERFIL_ESTILO[u.perfil]}>
                        <i className={`fas ${PERFIL_ICONE[u.perfil]} badge-icon`}></i>
                        {u.perfil.charAt(0).toUpperCase() + u.perfil.slice(1)}
                      </span>
                    </td>
                    <td>{u.departamento || "—"}</td>
                    <td>{u.telefone || "—"}</td>
                    <td>
                      <div className="td-acoes">
                        <button className="btn btn-warning btn-icon" onClick={() => abrirModalEdicao(u)} title="Editar">
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => setUsuarioExcluindo(u)} title="Excluir">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state compact">
                        <i className="fas fa-users-slash"></i>
                        <p>Nenhum usuário encontrado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Modal: Cadastro / Edição ── */}
        {modalAberto && (
          <div className="modal-overlay" onClick={() => setModalAberto(false)}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className={`fas ${usuarioEditando ? "fa-user-pen" : "fa-user-plus"}`}></i>{" "}
                  {usuarioEditando ? "Editar Usuário" : "Novo Usuário"}
                </h2>
                <button type="button" className="btn-close" onClick={() => setModalAberto(false)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <div className="view-details">
                {/* Data de criação — só na edição */}
                {usuarioEditando && (
                  <div className="view-item">
                    <span className="view-label"><i className="fas fa-calendar"></i> Data de Cadastro</span>
                    <span className="view-value">
                      {new Date(usuarioEditando.dataCriacao + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}

                <div className="view-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-user"></i> Nome completo *</label>
                    <input
                      className="form-input"
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      placeholder="Nome do usuário"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-at"></i> Login *</label>
                    <input
                      className="form-input"
                      value={form.login}
                      onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                      placeholder="Login de acesso"
                    />
                  </div>
                </div>

                <div className="view-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-lock"></i> Senha *</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="form-input"
                        type={senhaVisivel ? "text" : "password"}
                        value={form.senha}
                        onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                        placeholder="Senha de acesso"
                        style={{ paddingRight: "2.5rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setSenhaVisivel((v) => !v)}
                        style={{
                          position: "absolute", right: "0.75rem", top: "50%",
                          transform: "translateY(-50%)", background: "none",
                          border: "none", cursor: "pointer", color: "var(--c-text-muted)",
                        }}
                        title={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                      >
                        <i className={`fas ${senhaVisivel ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-shield-halved"></i> Perfil *</label>
                    <select
                      className="form-input"
                      value={form.perfil}
                      onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value as PerfilUsuario }))}
                    >
                      <option value="administrador">Administrador</option>
                      <option value="usuario">Usuario</option>
                      <option value="checker">Checker</option>
                    </select>
                  </div>
                </div>

                <div className="view-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-building"></i> Departamento</label>
                    <input
                      className="form-input"
                      value={form.departamento}
                      onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))}
                      placeholder="Ex: Engenharia, TI, Operações..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-phone"></i> Telefone</label>
                    <input
                      className="form-input"
                      value={form.telefone}
                      onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                      placeholder="(12) 99999-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSalvar}>
                  <i className={`fas ${usuarioEditando ? "fa-floppy-disk" : "fa-user-plus"}`}></i>{" "}
                  {usuarioEditando ? "Salvar Alterações" : "Criar Usuário"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Confirmação de Exclusão ── */}
        {usuarioExcluindo && (
          <div className="modal-overlay" onClick={() => setUsuarioExcluindo(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-triangle-exclamation"></i> Confirmar Exclusão</h2>
                <button type="button" className="btn-close" onClick={() => setUsuarioExcluindo(null)}>
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <div style={{ padding: "1rem 0" }}>
                <p style={{ color: "var(--c-text-2)", marginBottom: "1rem" }}>
                  Tem certeza que deseja excluir o usuário abaixo? Esta ação não pode ser desfeita.
                </p>
                <div className="view-grid view-grid-exclusao">
                  <div className="view-item">
                    <span className="view-label">Nome</span>
                    <span className="view-value">{usuarioExcluindo.nome}</span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">Login</span>
                    <span className="view-value">{usuarioExcluindo.login}</span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">Perfil</span>
                    <span className="view-value">
                      <span className={PERFIL_ESTILO[usuarioExcluindo.perfil]} style={{ fontSize: "0.6rem"}}>
                        <i className={`fas ${PERFIL_ICONE[usuarioExcluindo.perfil]} badge-icon`}></i>
                        {usuarioExcluindo.perfil.charAt(0).toUpperCase() + usuarioExcluindo.perfil.slice(1)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setUsuarioExcluindo(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger-solid" onClick={handleExcluir}>
                  <i className="fas fa-trash"></i> Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Detalhes Mobile ── */}
        {usuarioSelecionado && (
          <div className="modal-overlay" onClick={() => setUsuarioSelecionado(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0, flex: 1 }}>
                  <i className="fas fa-user" style={{ flexShrink: 0 }}></i>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem"}}>
                    {usuarioSelecionado.nome}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexShrink: 0 }}>
                  <button className="btn btn-warning btn-icon" onClick={() => { abrirModalEdicao(usuarioSelecionado); setUsuarioSelecionado(null); }} title="Editar">
                    <i className="fas fa-pen"></i>
                  </button>
                  <button className="btn btn-danger btn-icon" onClick={() => { setUsuarioExcluindo(usuarioSelecionado); setUsuarioSelecionado(null); }} title="Excluir">
                    <i className="fas fa-trash"></i>
                  </button>
                  <button type="button" className="btn-close" onClick={() => setUsuarioSelecionado(null)}>
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
              </div>
              <div className="view-details">
                <div className="view-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="usuario-detalhe-card">
                    <span className="view-label"><i className="fas fa-at"></i> Login</span>
                    <span className="view-value td-mono">{usuarioSelecionado.login}</span>
                  </div>
                  <div className="usuario-detalhe-card" style={{ alignItems: "flex-start" }}>
                    <span className="view-label"><i className="fas fa-shield-halved"></i> Perfil</span>
                    <span className={PERFIL_ESTILO[usuarioSelecionado.perfil]} style={{ fontSize: "0.75rem", marginTop: "4px", alignSelf: "flex-start" }}>
                      <i className={`fas ${PERFIL_ICONE[usuarioSelecionado.perfil]} badge-icon`}></i>
                      {PERFIL_LABEL[usuarioSelecionado.perfil]}
                    </span>
                  </div>
                  <div className="usuario-detalhe-card">
                    <span className="view-label"><i className="fas fa-building"></i> Departamento</span>
                    <span className="view-value">{usuarioSelecionado.departamento || "—"}</span>
                  </div>
                  <div className="usuario-detalhe-card">
                    <span className="view-label"><i className="fas fa-phone"></i> Telefone</span>
                    <span className="view-value">{usuarioSelecionado.telefone || "—"}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div></div>
                <button type="button" className="btn btn-ghost" onClick={() => setUsuarioSelecionado(null)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}