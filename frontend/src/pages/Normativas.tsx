import { useState, type FormEvent } from "react";
import "../components/Sidebar";
import "../styles/Normativas.css";

interface Norma {
  id: string;
  titulo: string;
  organizacao: string;
  disciplina: string;
  status: string;
  notas: string[];
  referencias: string[];
}

const NORMAS_BASE: Norma[] = [
  {
    id: "RBAC 25.1309",
    titulo: "Análise de Segurança de Sistemas",
    organizacao: "ANAC",
    disciplina: "Design",
    status: "Vigente",
    notas: ["Norma principal de safety."],
    referencias: ["SAE ARP4761"],
  },
  {
    id: "FAR 25.571",
    titulo: "Damage Tolerance and Fatigue Evaluation",
    organizacao: "FAA",
    disciplina: "Stress",
    status: "Vigente",
    notas: [],
    referencias: [],
  },
  {
    id: "MS33540",
    titulo: "Torque Limits for Threaded Fasteners",
    organizacao: "DoD",
    disciplina: "Design",
    status: "Revogada",
    notas: [
      "Substituída por normativas mais recentes.",
      "Verificar manuais OEM.",
    ],
    referencias: ["NAS1348"],
  },
];

const ORGANIZACOES = [
  "ANAC",
  "FAA",
  "EASA",
  "ICAO",
  "DoD",
  "SAE",
  "ISO",
  "AKAER",
];
const DISCIPLINAS = [
  "Manufacturing",
  "Materials",
  "Design",
  "Stress",
  "Lightning",
];

function NormaCardItem({
  norma,
  onDelete,
}: {
  norma: Norma;
  onDelete: (id: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const [selecionado, setSelecionado] = useState(false);
  const temDetalhes = norma.notas.length > 0 || norma.referencias.length > 0;

  return (
    <div
      className={`norma-card ${selecionado ? "selecionado" : ""}`}
      onClick={() => setSelecionado(!selecionado)}
    >
      <div className="norma-info">
        <h3>{norma.id}</h3>
        <p className="norma-titulo">{norma.titulo}</p>

        <div className="badges-container">
          <span className="badge">{norma.organizacao}</span>
          <span className="badge">{norma.disciplina}</span>
          <span className={`badge ${norma.status.toLowerCase()}`}>
            {norma.status === "Vigente" ? (
              <i className="fas fa-check-circle"></i>
            ) : (
              <i className="fas fa-times-circle"></i>
            )}{" "}
            {norma.status}
          </span>
        </div>

        {temDetalhes && (
          <button
            className="btn-expand"
            onClick={(evento) => {
              evento.stopPropagation();
              setExpandido(!expandido);
            }}
          >
            {expandido ? "Ocultar Detalhes" : "Ver Detalhes"}
            <i className={`fas fa-chevron-${expandido ? "up" : "down"}`}></i>
          </button>
        )}

        {expandido && temDetalhes && (
          <div className="norma-detalhes">
            {norma.notas.length > 0 && (
              <div className="detalhe-item">
                <strong>
                  <i className="fas fa-pen-to-square"></i> Notas:
                </strong>
                <ul>
                  {norma.notas.map((notaAtual, indice) => (
                    <li key={indice}>{notaAtual}</li>
                  ))}
                </ul>
              </div>
            )}
            {norma.referencias.length > 0 && (
              <div className="detalhe-item">
                <strong>
                  <i className="fas fa-link"></i> Referências:
                </strong>
                <ul>
                  {norma.referencias.map((referenciaAtual, indice) => (
                    <li key={indice}>{referenciaAtual}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        className="btn btn-danger btn-icon"
        onClick={(evento) => {
          evento.stopPropagation();
          onDelete(norma.id);
        }}
        title="Excluir Norma"
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
}

export default function Biblioteca() {
  const [normas, setNormas] = useState<Norma[]>(NORMAS_BASE);
  const [showModal, setShowModal] = useState(false);

  const [id, setId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [organizacao, setOrganizacao] = useState(ORGANIZACOES[0]);
  const [disciplina, setDisciplina] = useState(DISCIPLINAS[0]);
  const [status, setStatus] = useState("Vigente");
  const [notas, setNotas] = useState<string[]>([""]);
  const [referencias, setReferencias] = useState<string[]>([""]);
  const [termoPesquisa, setTermoPesquisa] = useState("");

  const handleAddNota = () => setNotas([...notas, ""]);

  const handleRemoveNota = (indiceParaRemover: number) =>
    setNotas(
      notas.filter(
        (_notaAtual, indiceAtual) => indiceAtual !== indiceParaRemover,
      ),
    );

  const handleChangeNota = (indiceParaAlterar: number, novoValor: string) => {
    const novasNotas = [...notas];
    novasNotas[indiceParaAlterar] = novoValor;
    setNotas(novasNotas);
  };

  const handleAddReferencia = () => setReferencias([...referencias, ""]);

  const handleRemoveReferencia = (indiceParaRemover: number) =>
    setReferencias(
      referencias.filter(
        (_referenciaAtual, indiceAtual) => indiceAtual !== indiceParaRemover,
      ),
    );

  const handleChangeReferencia = (
    indiceParaAlterar: number,
    novoValor: string,
  ) => {
    const novasReferencias = [...referencias];
    novasReferencias[indiceParaAlterar] = novoValor;
    setReferencias(novasReferencias);
  };

  const termoMinusculo = termoPesquisa.toLowerCase();
  const normasFiltradas = normas.filter((norma) => {
    const encontrouId = norma.id.toLowerCase().includes(termoMinusculo);
    const encontrouTitulo = norma.titulo.toLowerCase().includes(termoMinusculo);
    return encontrouId || encontrouTitulo;
  });

  const handleSave = (evento: FormEvent) => {
    evento.preventDefault();
    if (!id || !titulo) {
      alert("Preencha o ID e o Título!");
      return;
    }

    const notasValidas = notas.filter((notaAtual) => notaAtual.trim() !== "");
    const referenciasValidas = referencias.filter(
      (referenciaAtual) => referenciaAtual.trim() !== "",
    );

    const novaNorma: Norma = {
      id,
      titulo,
      organizacao,
      disciplina,
      status,
      notas: notasValidas,
      referencias: referenciasValidas,
    };

    setNormas([novaNorma, ...normas]);
    setShowModal(false);

    setId("");
    setTitulo("");
    setOrganizacao(ORGANIZACOES[0]);
    setDisciplina(DISCIPLINAS[0]);
    setStatus("Vigente");
    setNotas([""]);
    setReferencias([""]);
  };

  const handleDelete = (idParaExcluir: string) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a norma ${idParaExcluir}?`,
    );
    if (confirmacao) {
      setNormas(normas.filter((norma) => norma.id !== idParaExcluir));
    }
  };

  return (
    <div
      className="app-container"
      style={{ display: "flex", minHeight: "100vh" }}
    >
      <main className="page" style={{ flex: 1, padding: "20px" }}>
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-book"></i> Biblioteca de Normas
          </h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus"></i> Nova Norma
          </button>
        </div>

        <div className="form-group search-group">
          <i className="fas fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Pesquisar por ID ou Título..."
            value={termoPesquisa}
            onChange={(evento) => setTermoPesquisa(evento.target.value)}
          />
        </div>

        <div className="normas-lista">
          {normasFiltradas.map((norma, indice) => (
            <NormaCardItem key={indice} norma={norma} onDelete={handleDelete} />
          ))}

          {normasFiltradas.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <p>Nenhuma norma encontrada com esse termo.</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <div className="modal-header">
                <h2>
                  <i className="fas fa-file-circle-plus"></i> Cadastrar Nova
                  Norma
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  title="Fechar"
                >
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Identificador (ID)</label>
                    <input
                      className="form-input"
                      value={id}
                      onChange={(evento) => setId(evento.target.value)}
                      placeholder="Ex: RBAC-25"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Título</label>
                    <input
                      className="form-input"
                      value={titulo}
                      onChange={(evento) => setTitulo(evento.target.value)}
                      placeholder="Nome da norma"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Órgão / Organização</label>
                    <select
                      className="form-select"
                      value={organizacao}
                      onChange={(evento) => setOrganizacao(evento.target.value)}
                    >
                      {ORGANIZACOES.map((nomeOrganizacao) => (
                        <option key={nomeOrganizacao} value={nomeOrganizacao}>
                          {nomeOrganizacao}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Disciplina</label>
                    <select
                      className="form-select"
                      value={disciplina}
                      onChange={(evento) => setDisciplina(evento.target.value)}
                    >
                      {DISCIPLINAS.map((nomeDisciplina) => (
                        <option key={nomeDisciplina} value={nomeDisciplina}>
                          {nomeDisciplina}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(evento) => setStatus(evento.target.value)}
                    >
                      <option value="Vigente">Vigente</option>
                      <option value="Revogada">Revogada</option>
                    </select>
                  </div>
                </div>

                <hr className="divider" />

                <div className="form-group">
                  <label className="form-label">Notas</label>
                  <div className="dynamic-list">
                    {notas.map((notaAtual, indiceAtual) => (
                      <div key={indiceAtual} className="dynamic-row">
                        <input
                          className="form-input"
                          value={notaAtual}
                          onChange={(evento) =>
                            handleChangeNota(indiceAtual, evento.target.value)
                          }
                          placeholder="Adicione uma nota descritiva..."
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-icon"
                          onClick={() => handleRemoveNota(indiceAtual)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-ghost btn-add-more"
                      onClick={handleAddNota}
                    >
                      <i className="fas fa-plus"></i> Adicionar outra nota
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Normas Referenciadas</label>
                  <div className="dynamic-list">
                    {referencias.map((referenciaAtual, indiceAtual) => (
                      <div key={indiceAtual} className="dynamic-row">
                        <input
                          className="form-input"
                          value={referenciaAtual}
                          onChange={(evento) =>
                            handleChangeReferencia(
                              indiceAtual,
                              evento.target.value,
                            )
                          }
                          placeholder="Ex: FAR 25.1309"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-icon"
                          onClick={() => handleRemoveReferencia(indiceAtual)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-ghost btn-add-more"
                      onClick={handleAddReferencia}
                    >
                      <i className="fas fa-plus"></i> Adicionar outra referência
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fas fa-xmark"></i> Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-check"></i> Salvar Norma
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
