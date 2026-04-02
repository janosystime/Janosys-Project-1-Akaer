import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import "../components/Sidebar";
import "../styles/Normativas.css";

interface Norma {
  id: string;
  codigo: string;
  titulo: string;
  organizacao: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tipo: string;
  revisao: string;
  status: string;
  notas: string[];
  referencias: string[];
  nomePdf?: string;
  urlPdf?: string;
  imagens?: string[];
}

interface ToastMsg {
  id: number;
  tipo: "erro" | "sucesso";
  mensagem: string;
}

interface ConfirmacaoState {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
}

const NORMAS_BASE: Norma[] = [
  {
    id: "RBAC 25.1309",
    codigo: "25.1309",
    titulo: "Análise de Segurança de Sistemas",
    organizacao: "ANAC",
    categoria: "Instalação",
    subcategoria: "Geral",
    item: "Parafuso",
    tipo: "Pública",
    revisao: "Emenda 09",
    status: "Vigente",
    notas: ["Norma principal de safety."],
    referencias: ["SAE ARP4761"],
  },
  {
    id: "FAR 25.571",
    codigo: "25.571",
    titulo: "Damage Tolerance and Fatigue Evaluation",
    organizacao: "FAA",
    categoria: "Conjunto",
    subcategoria: "União de Peças",
    item: "Soldagem",
    tipo: "Pública",
    revisao: "Amendment 27",
    status: "Vigente",
    notas: [],
    referencias: [],
  },
  {
    id: "ISO 9001:2015",
    codigo: "9001",
    titulo: "Quality management systems — Requirements",
    organizacao: "ISO",
    categoria: "Peça",
    subcategoria: "Metálica",
    item: "Usinado",
    tipo: "Pública",
    revisao: "2015",
    status: "Vigente",
    notas: [
      "Requisitos gerais para o sistema de gestão da qualidade nas plantas de manufatura.",
    ],
    referencias: ["ISO 9000:2015"],
  },
  {
    id: "CS-25",
    codigo: "CS-25",
    titulo: "Certification Specifications for Large Aeroplanes",
    organizacao: "EASA",
    categoria: "Conjunto",
    subcategoria: "Cablagem",
    item: "Conector",
    tipo: "Privada",
    revisao: "Amendment 27",
    status: "Vigente",
    notas: [
      "Especificações essenciais para certificação EASA em aeronaves de grande porte.",
    ],
    referencias: ["FAR 25"],
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
const CATEGORIAS = ["Peça", "Conjunto", "Instalação", "Geral"];

const SUBCATEGORIAS: Record<string, string[]> = {
  Peça: ["Metálica", "Não Metálica"],
  Conjunto: ["Instalação de Acessórios", "União de Peças", "Cablagem"],
  Instalação: ["Estrutura", "Hidromecânicos", "Elétrica", "Geral", "Teste"],
  Geral: ["Basic Notes", "Identificação"],
};

const ITENS_POR_SUBCATEGORIA: Record<string, string[]> = {
  Metálica: [
    "Tubo",
    "Usinado",
    "Chapa",
    "Extrudado",
    "Fundido",
    "Tratamento Superficial",
    "Teste",
  ],
  "Instalação de Acessórios": ["Tubo com Acessório"],
  "União de Peças": ["Soldagem"],
  Cablagem: ["Proteção", "Bota", "Conector"],
  Geral: [
    "Selante",
    "Metalização",
    "Rebite",
    "Parafuso",
    "Arruela",
    "Inserto",
    "Frenagem",
    "Shim",
    "Primer",
  ],
};

const STATUS_OPCOES = ["Vigente", "Revogada"];

const ORG_ORIGENS: Record<string, string> = {
  ANAC: "🇧🇷",
  FAA: "🇺🇸",
  EASA: "🇪🇺",
  ICAO: "🌐",
  DoD: "🇺🇸",
  SAE: "🇺🇸",
  ISO: "🌐",
  AKAER: "🇧🇷",
};

const CAT_ICONES: Record<string, string> = {
  Peça: "fa-gear",
  Conjunto: "fa-gears",
  Instalação: "fa-screwdriver-wrench",
  Geral: "fa-layer-group",
};

const FORM_INICIAL: Partial<Norma> = {
  id: "",
  codigo: "",
  titulo: "",
  organizacao: ORGANIZACOES[0],
  categoria: CATEGORIAS[0],
  subcategoria: SUBCATEGORIAS[CATEGORIAS[0]][0],
  item: "",
  tipo: "Pública",
  revisao: "",
  status: "Vigente",
  notas: [""],
  referencias: [""],
};

function ToastContainer({
  toasts,
  onRemover,
}: {
  toasts: ToastMsg[];
  onRemover: (id: number) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map((toastAtual) => (
        <div key={toastAtual.id} className={`toast toast-${toastAtual.tipo}`}>
          <i
            className={`fas ${toastAtual.tipo === "sucesso" ? "fa-check-circle" : "fa-circle-exclamation"}`}
          ></i>
          <span>{toastAtual.mensagem}</span>
          <button
            className="toast-close"
            onClick={() => onRemover(toastAtual.id)}
          >
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
}

function ModalConfirmacao({
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="modal-overlay confirmacao-overlay" onClick={onCancelar}>
      <div
        className="modal modal-confirmacao"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="confirmacao-icone">
          <i className="fas fa-triangle-exclamation"></i>
        </div>
        <h3 className="confirmacao-titulo">{titulo}</h3>
        <p className="confirmacao-mensagem">{mensagem}</p>
        <div className="confirmacao-acoes">
          <button className="btn btn-ghost" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn-danger-solid" onClick={onConfirmar}>
            <i className="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfViewer({
  url,
  nome,
  onClose,
}: {
  url: string;
  nome: string;
  onClose: () => void;
}) {
  return (
    <div className="pdf-viewer-overlay" onClick={onClose}>
      <div
        className="pdf-viewer-container"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="pdf-viewer-header">
          <div className="pdf-viewer-title">
            <i className="fas fa-file-pdf"></i>
            {nome}
          </div>
          <div className="pdf-viewer-actions">
            <a href={url} download={nome} className="btn btn-ghost">
              <i className="fas fa-download"></i> Baixar
            </a>
            <button className="btn btn-danger btn-icon" onClick={onClose}>
              <i className="fas fa-xmark"></i>
            </button>
          </div>
        </div>
        <iframe
          src={url}
          className="pdf-iframe"
          title="Visualizador de PDF"
        ></iframe>
      </div>
    </div>
  );
}

function ImageLightbox({
  imagens,
  indiceInicial,
  onClose,
}: {
  imagens: string[];
  indiceInicial: number;
  onClose: () => void;
}) {
  const [indiceAtual, setIndiceAtual] = useState(indiceInicial);

  useEffect(() => {
    const handleKeyDown = (eventoTeclado: KeyboardEvent) => {
      if (eventoTeclado.key === "ArrowRight")
        setIndiceAtual((indiceAnterior) =>
          Math.min(indiceAnterior + 1, imagens.length - 1),
        );
      if (eventoTeclado.key === "ArrowLeft")
        setIndiceAtual((indiceAnterior) => Math.max(indiceAnterior - 1, 0));
      if (eventoTeclado.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imagens.length, onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div
        className="lightbox-container"
        onClick={(evento) => evento.stopPropagation()}
      >
        <button className="lightbox-close" onClick={onClose}>
          <i className="fas fa-xmark"></i>
        </button>
        <img
          src={imagens[indiceAtual]}
          alt={`Anexo ${indiceAtual + 1}`}
          className="lightbox-img"
        />
        <div className="lightbox-counter">
          {indiceAtual + 1} / {imagens.length}
        </div>
        {indiceAtual > 0 && (
          <button
            className="lightbox-nav prev"
            onClick={() =>
              setIndiceAtual((indiceAnterior) => indiceAnterior - 1)
            }
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        )}
        {indiceAtual < imagens.length - 1 && (
          <button
            className="lightbox-nav next"
            onClick={() =>
              setIndiceAtual((indiceAnterior) => indiceAnterior + 1)
            }
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        )}
      </div>
    </div>
  );
}

function NormaCardItem({
  norma,
  onDelete,
  onView,
}: {
  norma: Norma;
  onDelete: (id: string) => void;
  onView: (norma: Norma) => void;
}) {
  const [selecionado, setSelecionado] = useState(false);
  const classeCorTema = `theme-cat-${norma.categoria.toLowerCase()}`;

  return (
    <div
      className={`norma-card ${classeCorTema} ${selecionado ? "selecionado" : ""}`}
      onClick={() => setSelecionado(!selecionado)}
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
              <span
                className="badge theme-subcategoria"
                style={{ opacity: 0.85 }}
              >
                <i className="fas fa-cube"></i> {norma.item}
              </span>
            )}

            <span
              className={`badge ${norma.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}
            >
              <i
                className={`fas ${norma.tipo === "Pública" ? "fa-globe" : "fa-lock"}`}
              ></i>
              {norma.tipo}
            </span>

            <span className={`badge ${norma.status.toLowerCase()}`}>
              {norma.status === "Vigente" ? (
                <i className="fas fa-check-circle"></i>
              ) : (
                <i className="fas fa-times-circle"></i>
              )}
              {norma.status}
            </span>
            {(norma.nomePdf || (norma.imagens && norma.imagens.length > 0)) && (
              <span className="badge theme-subcategoria">
                <i className="fas fa-paperclip"></i> Anexos
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="norma-card-actions">
        <button
          className="btn btn-info btn-icon"
          onClick={(evento) => {
            evento.stopPropagation();
            onView(norma);
          }}
          title="Visualizar"
        >
          <i className="fas fa-eye"></i>
        </button>
        <button
          className="btn btn-danger btn-icon"
          onClick={(evento) => {
            evento.stopPropagation();
            onDelete(norma.id);
          }}
          title="Excluir"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
}

export default function Biblioteca() {
  const [normas, setNormas] = useState<Norma[]>(NORMAS_BASE);
  const [showModal, setShowModal] = useState(false);
  const [stepModal, setStepModal] = useState(1);
  const [normaVisualizar, setNormaVisualizar] = useState<Norma | null>(null);
  const [erroCampos, setErroCampos] = useState<
    Partial<Record<keyof Norma, string>>
  >({});

  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [filtroItem, setFiltroItem] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const [pdfAberto, setPdfAberto] = useState<{
    url: string;
    nome: string;
  } | null>(null);
  const [imagemAbertaIdx, setImagemAbertaIdx] = useState<number | null>(null);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const adicionarToast = useCallback(
    (tipo: ToastMsg["tipo"], mensagem: string) => {
      const idToast = Date.now();
      setToasts((toastsAnteriores) => [
        ...toastsAnteriores,
        { id: idToast, tipo, mensagem },
      ]);
      setTimeout(
        () =>
          setToasts((toastsAnteriores) =>
            toastsAnteriores.filter((toastAtual) => toastAtual.id !== idToast),
          ),
        4000,
      );
    },
    [],
  );
  const removerToast = (idToastParaRemover: number) =>
    setToasts((toastsAnteriores) =>
      toastsAnteriores.filter(
        (toastAtual) => toastAtual.id !== idToastParaRemover,
      ),
    );

  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState>({
    visivel: false,
    titulo: "",
    mensagem: "",
    onConfirmar: () => {},
  });
  const pedirConfirmacao = (
    titulo: string,
    mensagem: string,
    onConfirmar: () => void,
  ) => {
    setConfirmacao({ visivel: true, titulo, mensagem, onConfirmar });
  };
  const fecharConfirmacao = () =>
    setConfirmacao((confirmacaoAnterior) => ({
      ...confirmacaoAnterior,
      visivel: false,
    }));

  const [form, setForm] = useState<Partial<Norma>>(FORM_INICIAL);
  const updateForm = (campo: keyof Norma, valor: unknown) => {
    setForm((formularioAnterior) => ({
      ...formularioAnterior,
      [campo]: valor,
    }));
    if (erroCampos[campo])
      setErroCampos((errosAnteriores) => ({
        ...errosAnteriores,
        [campo]: undefined,
      }));
  };

  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [arquivosImagens, setArquivosImagens] = useState<File[]>([]);

  const handlePdfChange = (evento: ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files?.[0]) setArquivoPdf(evento.target.files[0]);
  };
  const handleImgChange = (evento: ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files)
      setArquivosImagens((imagensAnteriores) => [
        ...imagensAnteriores,
        ...Array.from(evento.target.files!),
      ]);
  };

  const subcategoriasDisponiveis =
    filtroCategoria !== "Todas" ? (SUBCATEGORIAS[filtroCategoria] ?? []) : [];

  const itensDisponiveis = Array.from(
    new Set(
      normas
        .filter(
          (normaAtual) =>
            normaAtual.subcategoria === filtroSubcategoria && normaAtual.item,
        )
        .map((normaAtual) => normaAtual.item),
    ),
  ).sort();

  const filtrosAtivos =
    termoPesquisa !== "" ||
    filtroCategoria !== "Todas" ||
    filtroSubcategoria !== "" ||
    filtroItem !== "" ||
    filtroStatus !== "Todos";

  const limparFiltros = () => {
    setTermoPesquisa("");
    setFiltroCategoria("Todas");
    setFiltroSubcategoria("");
    setFiltroItem("");
    setFiltroStatus("Todos");
  };

  const handleMudancaCategoriaFiltro = (novaCategoria: string) => {
    setFiltroCategoria(novaCategoria);
    setFiltroSubcategoria("");
    setFiltroItem("");
  };

  const handleMudancaSubcategoriaFiltro = (novaSubcategoria: string) => {
    setFiltroSubcategoria(novaSubcategoria);
    setFiltroItem("");
  };

  const termoMinusculo = termoPesquisa.toLowerCase();
  const normasFiltradas = normas.filter((normaAtual) => {
    const matchBusca =
      normaAtual.id.toLowerCase().includes(termoMinusculo) ||
      normaAtual.codigo.toLowerCase().includes(termoMinusculo) ||
      normaAtual.titulo.toLowerCase().includes(termoMinusculo);
    const matchCategoria =
      filtroCategoria === "Todas" || normaAtual.categoria === filtroCategoria;
    const matchSubcategoria =
      !filtroSubcategoria || normaAtual.subcategoria === filtroSubcategoria;
    const matchItem = !filtroItem || normaAtual.item === filtroItem;
    const matchStatus =
      filtroStatus === "Todos" || normaAtual.status === filtroStatus;
    return (
      matchBusca &&
      matchCategoria &&
      matchSubcategoria &&
      matchItem &&
      matchStatus
    );
  });

  const abrirModalCadastro = () => {
    setStepModal(1);
    setErroCampos({});
    setShowModal(true);
  };
  const fecharModal = () => {
    setShowModal(false);
    setForm(FORM_INICIAL);
    setArquivoPdf(null);
    setArquivosImagens([]);
    setErroCampos({});
  };

  const handleProximoPasso = () => {
    const erros: typeof erroCampos = {};
    if (!form.id?.trim()) erros.id = "Campo obrigatório";
    if (!form.titulo?.trim()) erros.titulo = "Campo obrigatório";
    if (Object.keys(erros).length > 0) {
      setErroCampos(erros);
      adicionarToast(
        "erro",
        "Preencha os campos obrigatórios antes de avançar.",
      );
      return;
    }
    setStepModal((etapaAtual) => etapaAtual + 1);
  };

  const handleSave = () => {
    const novaNorma = {
      ...form,
      notas: form.notas?.filter((notaAtual) => notaAtual.trim() !== "") || [],
      referencias:
        form.referencias?.filter(
          (referenciaAtual) => referenciaAtual.trim() !== "",
        ) || [],
      nomePdf: arquivoPdf ? arquivoPdf.name : undefined,
      urlPdf: arquivoPdf ? URL.createObjectURL(arquivoPdf) : undefined,
      imagens: arquivosImagens.map((arquivoImagem) =>
        URL.createObjectURL(arquivoImagem),
      ),
    } as Norma;

    setNormas([novaNorma, ...normas]);
    fecharModal();
    adicionarToast(
      "sucesso",
      `Norma "${novaNorma.id}" cadastrada com sucesso!`,
    );
  };

  const handleDelete = (idParaExcluir: string) => {
    pedirConfirmacao(
      "Excluir norma",
      `Tem certeza que deseja excluir "${idParaExcluir}"? Esta ação não pode ser desfeita.`,
      () => {
        setNormas((normasAnteriores) =>
          normasAnteriores.filter(
            (normaAtual) => normaAtual.id !== idParaExcluir,
          ),
        );
        fecharConfirmacao();
        adicionarToast("sucesso", `Norma "${idParaExcluir}" excluída.`);
      },
    );
  };

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onRemover={removerToast} />

      <main className="page">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-book-open"></i> Biblioteca de Normas
          </h1>
          <button className="btn btn-primary" onClick={abrirModalCadastro}>
            <i className="fas fa-circle-plus"></i> Nova Norma
          </button>
        </div>

        <div className="filtros-container">
          <div className="filtros-header">
            <div className="form-group search-group">
              <i className="fas fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Pesquisar por ID, Código ou Título..."
                value={termoPesquisa}
                onChange={(evento) => setTermoPesquisa(evento.target.value)}
              />
              {termoPesquisa && (
                <button
                  className="search-clear"
                  onClick={() => setTermoPesquisa("")}
                  title="Limpar busca"
                >
                  <i className="fas fa-xmark"></i>
                </button>
              )}
            </div>
            {filtrosAtivos && (
              <button
                className="btn btn-limpar-filtros"
                onClick={limparFiltros}
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
              onClick={() => handleMudancaCategoriaFiltro("Todas")}
            >
              <i className="fas fa-border-all"></i> Todas
            </button>
            {CATEGORIAS.map((nomeCategoria) => (
              <button
                key={nomeCategoria}
                className={`filter-badge theme-cat-${nomeCategoria.toLowerCase()} ${filtroCategoria === nomeCategoria ? "active" : ""}`}
                onClick={() => handleMudancaCategoriaFiltro(nomeCategoria)}
              >
                <i
                  className={`fas ${CAT_ICONES[nomeCategoria] || "fa-tag"}`}
                ></i>{" "}
                {nomeCategoria}
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
                  onClick={() => handleMudancaSubcategoriaFiltro("")}
                >
                  <i className="fas fa-border-all"></i> Todas
                </button>
                {subcategoriasDisponiveis.map((nomeSubcategoria) => (
                  <button
                    key={nomeSubcategoria}
                    className={`filter-badge theme-subcategoria ${filtroSubcategoria === nomeSubcategoria ? "active" : ""}`}
                    onClick={() =>
                      handleMudancaSubcategoriaFiltro(nomeSubcategoria)
                    }
                  >
                    <i className="fas fa-layer-group"></i> {nomeSubcategoria}
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
                onClick={() => setFiltroItem("")}
              >
                <i className="fas fa-border-all"></i> Todos
              </button>
              {itensDisponiveis.map((nomeItem) => (
                <button
                  key={nomeItem}
                  className={`filter-badge theme-subcategoria ${filtroItem === nomeItem ? "active" : ""}`}
                  onClick={() => setFiltroItem(nomeItem)}
                >
                  <i className="fas fa-cube"></i> {nomeItem}
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
              onClick={() => setFiltroStatus("Todos")}
            >
              <i className="fas fa-border-all"></i> Todos
            </button>
            {STATUS_OPCOES.map((nomeStatus) => (
              <button
                key={nomeStatus}
                className={`filter-badge filter-badge-status-${nomeStatus.toLowerCase()} ${filtroStatus === nomeStatus ? "active" : ""}`}
                onClick={() => setFiltroStatus(nomeStatus)}
              >
                {nomeStatus === "Vigente" ? (
                  <i className="fas fa-check-circle"></i>
                ) : (
                  <i className="fas fa-times-circle"></i>
                )}{" "}
                {nomeStatus}
              </button>
            ))}
          </div>
        </div>

        <p className="results-count">
          {normasFiltradas.length === normas.length
            ? `${normas.length} norma${normas.length !== 1 ? "s" : ""} no total`
            : `${normasFiltradas.length} de ${normas.length} norma${normas.length !== 1 ? "s" : ""}`}
        </p>

        <div className="normas-lista">
          {normasFiltradas.map((normaAtual, indiceNorma) => (
            <NormaCardItem
              key={indiceNorma}
              norma={normaAtual}
              onDelete={handleDelete}
              onView={setNormaVisualizar}
            />
          ))}
          {normasFiltradas.length === 0 && (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <p>Nenhuma norma encontrada.</p>
              {filtrosAtivos && (
                <button className="btn btn-ghost" onClick={limparFiltros}>
                  <i className="fas fa-filter-circle-xmark"></i> Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={fecharModal}>
            <div
              className="modal modal-large"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <i className="fas fa-file-circle-plus"></i> Registar Nova
                  Norma
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  onClick={fecharModal}
                >
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <div className="stepper-container">
                {[
                  { label: "Identificação", step: 1 },
                  { label: "Classificação", step: 2 },
                  { label: "Anexos", step: 3 },
                ].map(({ label, step }) => (
                  <div
                    key={step}
                    className={`stepper-step ${stepModal >= step ? "active" : ""} ${stepModal > step ? "completed" : ""}`}
                  >
                    <span className="stepper-number">
                      {stepModal > step ? (
                        <i className="fas fa-check"></i>
                      ) : (
                        step
                      )}
                    </span>
                    {label}
                  </div>
                ))}
              </div>

              <form
                onSubmit={(evento) => {
                  evento.preventDefault();
                  if (stepModal < 3) {
                    handleProximoPasso();
                  } else {
                    handleSave();
                  }
                }}
              >
                {stepModal === 1 && (
                  <div className="form-grid">
                    <div
                      className={`form-group ${erroCampos.id ? "has-error" : ""}`}
                    >
                      <label className="form-label">
                        <i className="fas fa-id-card"></i> Identificador{" "}
                        <span className="campo-obrigatorio">*</span>
                      </label>
                      <input
                        className="form-input"
                        value={form.id}
                        onChange={(evento) =>
                          updateForm("id", evento.target.value)
                        }
                        placeholder="Ex: RBAC 25.1309"
                      />
                      {erroCampos.id && (
                        <span className="form-erro">
                          <i className="fas fa-circle-exclamation"></i>{" "}
                          {erroCampos.id}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-hashtag"></i> Código
                      </label>
                      <input
                        className="form-input"
                        value={form.codigo}
                        onChange={(evento) =>
                          updateForm("codigo", evento.target.value)
                        }
                        placeholder="Ex: 25.1309"
                      />
                    </div>

                    <div
                      className={`form-group full-width ${erroCampos.titulo ? "has-error" : ""}`}
                    >
                      <label className="form-label">
                        <i className="fas fa-heading"></i> Título{" "}
                        <span className="campo-obrigatorio">*</span>
                      </label>
                      <input
                        className="form-input"
                        value={form.titulo}
                        onChange={(evento) =>
                          updateForm("titulo", evento.target.value)
                        }
                        placeholder="Nome completo"
                      />
                      {erroCampos.titulo && (
                        <span className="form-erro">
                          <i className="fas fa-circle-exclamation"></i>{" "}
                          {erroCampos.titulo}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-building"></i> Órgão
                      </label>
                      <select
                        className="form-select"
                        value={form.organizacao}
                        onChange={(evento) =>
                          updateForm("organizacao", evento.target.value)
                        }
                      >
                        {ORGANIZACOES.map((nomeOrganizacao) => (
                          <option key={nomeOrganizacao} value={nomeOrganizacao}>
                            {ORG_ORIGENS[nomeOrganizacao]} {nomeOrganizacao}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-code-branch"></i> Revisão
                      </label>
                      <input
                        className="form-input"
                        value={form.revisao}
                        onChange={(evento) =>
                          updateForm("revisao", evento.target.value)
                        }
                        placeholder="Ex: Rev. A"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-tags"></i> Categoria
                      </label>
                      <select
                        className="form-select"
                        value={form.categoria}
                        onChange={(evento) => {
                          const novaCategoria = evento.target.value;
                          updateForm("categoria", novaCategoria);

                          const subcategoriasDaCategoria =
                            SUBCATEGORIAS[novaCategoria] || [];
                          const novaSubcategoria =
                            subcategoriasDaCategoria.length > 0
                              ? subcategoriasDaCategoria[0]
                              : "";
                          updateForm("subcategoria", novaSubcategoria);

                          updateForm("item", "");
                        }}
                      >
                        {CATEGORIAS.map((nomeCategoria) => (
                          <option key={nomeCategoria} value={nomeCategoria}>
                            {nomeCategoria}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-layer-group"></i> Subcategoria
                      </label>
                      <select
                        className="form-select"
                        value={form.subcategoria}
                        onChange={(evento) => {
                          const novaSubcategoria = evento.target.value;
                          updateForm("subcategoria", novaSubcategoria);
                          updateForm("item", "");
                        }}
                      >
                        {(SUBCATEGORIAS[form.categoria ?? ""] ?? []).map(
                          (nomeSub) => (
                            <option key={nomeSub} value={nomeSub}>
                              {nomeSub}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-cube"></i> Item
                      </label>
                      <select
                        className="form-select"
                        value={form.item}
                        onChange={(evento) =>
                          updateForm("item", evento.target.value)
                        }
                        disabled={
                          !form.subcategoria ||
                          !(
                            ITENS_POR_SUBCATEGORIA[form.subcategoria]?.length >
                            0
                          )
                        }
                      >
                        <option value="" disabled hidden>
                          {form.subcategoria &&
                          ITENS_POR_SUBCATEGORIA[form.subcategoria]?.length > 0
                            ? "Selecione um item"
                            : "Sem itens aplicáveis"}
                        </option>
                        {(
                          ITENS_POR_SUBCATEGORIA[form.subcategoria ?? ""] ?? []
                        ).map((nomeItem) => (
                          <option key={nomeItem} value={nomeItem}>
                            {nomeItem}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {stepModal === 2 && (
                  <>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-circle-dot"></i> Status
                        </label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={(evento) =>
                            updateForm("status", evento.target.value)
                          }
                        >
                          <option value="Vigente">Vigente</option>
                          <option value="Revogada">Revogada</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-globe"></i> Tipo
                        </label>
                        <select
                          className="form-select"
                          value={form.tipo}
                          onChange={(evento) =>
                            updateForm("tipo", evento.target.value)
                          }
                        >
                          <option value="Pública">Pública</option>
                          <option value="Privada">Privada</option>
                        </select>
                      </div>
                    </div>

                    <hr className="divider" />

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-pen-to-square"></i> Notas Técnicas
                      </label>
                      <div className="dynamic-list">
                        {form.notas?.map((notaAtual, indiceNota) => (
                          <div key={indiceNota} className="dynamic-row">
                            <input
                              className="form-input"
                              value={notaAtual}
                              onChange={(evento) => {
                                const novasNotas = [...form.notas!];
                                novasNotas[indiceNota] = evento.target.value;
                                updateForm("notas", novasNotas);
                              }}
                              placeholder="Nota..."
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-icon"
                              onClick={() =>
                                updateForm(
                                  "notas",
                                  form.notas!.filter(
                                    (_, indiceAtual) =>
                                      indiceAtual !== indiceNota,
                                  ),
                                )
                              }
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-ghost btn-add-more"
                          onClick={() =>
                            updateForm("notas", [...form.notas!, ""])
                          }
                        >
                          <i className="fas fa-plus"></i> Nova nota
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-link"></i> Referências
                      </label>
                      <div className="dynamic-list">
                        {form.referencias?.map(
                          (referenciaAtual, indiceReferencia) => (
                            <div key={indiceReferencia} className="dynamic-row">
                              <input
                                className="form-input"
                                value={referenciaAtual}
                                onChange={(evento) => {
                                  const novasReferencias = [
                                    ...form.referencias!,
                                  ];
                                  novasReferencias[indiceReferencia] =
                                    evento.target.value;
                                  updateForm("referencias", novasReferencias);
                                }}
                                placeholder="Referência..."
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-icon"
                                onClick={() =>
                                  updateForm(
                                    "referencias",
                                    form.referencias!.filter(
                                      (_, indiceAtual) =>
                                        indiceAtual !== indiceReferencia,
                                    ),
                                  )
                                }
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ),
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost btn-add-more"
                          onClick={() =>
                            updateForm("referencias", [
                              ...form.referencias!,
                              "",
                            ])
                          }
                        >
                          <i className="fas fa-plus"></i> Nova referência
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {stepModal === 3 && (
                  <div className="form-grid">
                    <div className="file-upload-group">
                      <label className="form-label">
                        <i className="fas fa-file-pdf"></i> Arquivo PDF
                      </label>
                      <label
                        className={`file-upload-zone ${arquivoPdf ? "has-file" : ""}`}
                      >
                        <div className="file-icon">
                          <i
                            className={`fas ${arquivoPdf ? "fa-check" : "fa-upload"}`}
                          ></i>
                        </div>
                        <div className="file-info">
                          <span className="file-name">
                            {arquivoPdf
                              ? arquivoPdf.name
                              : "Anexar arquivo PDF"}
                          </span>
                          <span className="file-hint">Máximo 20MB (.pdf)</span>
                        </div>
                        {arquivoPdf && (
                          <button
                            type="button"
                            className="btn-remove-file"
                            onClick={(evento) => {
                              evento.preventDefault();
                              setArquivoPdf(null);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden-input"
                          onChange={handlePdfChange}
                        />
                      </label>
                    </div>

                    <div className="file-upload-group">
                      <label className="form-label">
                        <i className="fas fa-images"></i> Imagens
                      </label>
                      <label className="file-upload-zone">
                        <div className="file-icon">
                          <i className="fas fa-image"></i>
                        </div>
                        <div className="file-info">
                          <span className="file-name">Anexar imagens</span>
                          <span className="file-hint">JPG, PNG, WebP</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden-input"
                          onChange={handleImgChange}
                        />
                      </label>
                      {arquivosImagens.length > 0 && (
                        <div className="image-preview-list">
                          {arquivosImagens.map(
                            (arquivoImagem, indiceImagem) => (
                              <div
                                key={indiceImagem}
                                className="image-preview-item"
                              >
                                <img
                                  src={URL.createObjectURL(arquivoImagem)}
                                  alt="Preview"
                                />
                                <button
                                  type="button"
                                  className="btn-remove-preview"
                                  onClick={() =>
                                    setArquivosImagens((imagensAnteriores) =>
                                      imagensAnteriores.filter(
                                        (_, indiceAtual) =>
                                          indiceAtual !== indiceImagem,
                                      ),
                                    )
                                  }
                                >
                                  <i className="fas fa-xmark"></i>
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <div>
                    {stepModal > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          setStepModal((etapaAtual) => etapaAtual - 1)
                        }
                      >
                        Voltar
                      </button>
                    )}
                  </div>
                  <div className="modal-footer-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={fecharModal}
                    >
                      Cancelar
                    </button>
                    {stepModal < 3 ? (
                      <button type="submit" className="btn btn-primary">
                        Avançar{" "}
                        <i className="fas fa-arrow-right icon-right"></i>
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-primary">
                        <i className="fas fa-check"></i> Salvar
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {normaVisualizar && (
          <div
            className="modal-overlay"
            onClick={() => setNormaVisualizar(null)}
          >
            <div
              className="modal modal-large"
              onClick={(evento) => evento.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <i className="fas fa-magnifying-glass-chart"></i> Detalhes da
                  Norma
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNormaVisualizar(null)}
                >
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
              <div className="view-details">
                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-id-card"></i> ID
                    </span>
                    <span className="view-value">{normaVisualizar.id}</span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-hashtag"></i> Código
                    </span>
                    <span className="view-value">
                      {normaVisualizar.codigo || "—"}
                    </span>
                  </div>
                </div>
                <div className="view-item">
                  <span className="view-label">
                    <i className="fas fa-heading"></i> Título
                  </span>
                  <span className="view-value">{normaVisualizar.titulo}</span>
                </div>

                <div className="view-grid">
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-building"></i> Órgão
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge theme-org-${normaVisualizar.organizacao.toLowerCase()}`}
                      >
                        <span className="badge-origin">
                          {ORG_ORIGENS[normaVisualizar.organizacao] || "🌐"}
                        </span>
                        {normaVisualizar.organizacao}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-globe"></i> Tipo
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge ${normaVisualizar.tipo === "Pública" ? "badge-tipo-publica" : "badge-tipo-privada"}`}
                      >
                        <i
                          className={`fas ${normaVisualizar.tipo === "Pública" ? "fa-globe" : "fa-lock"}`}
                        ></i>
                        {normaVisualizar.tipo || "Pública"}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-code-branch"></i> Revisão
                    </span>
                    <span className="view-value">
                      {normaVisualizar.revisao || "—"}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-circle-dot"></i> Status
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge ${normaVisualizar.status.toLowerCase()}`}
                      >
                        {normaVisualizar.status === "Vigente" ? (
                          <i className="fas fa-check-circle"></i>
                        ) : (
                          <i className="fas fa-times-circle"></i>
                        )}
                        {normaVisualizar.status}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-tags"></i> Categoria
                    </span>
                    <span className="view-value view-badges">
                      <span
                        className={`badge theme-cat-${normaVisualizar.categoria.toLowerCase()}`}
                      >
                        <i
                          className={`fas ${CAT_ICONES[normaVisualizar.categoria] || "fa-tag"}`}
                        ></i>
                        {normaVisualizar.categoria}
                      </span>
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-layer-group"></i> Subcategoria
                    </span>
                    <span className="view-value">
                      {normaVisualizar.subcategoria || "—"}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-cube"></i> Item
                    </span>
                    <span className="view-value">
                      {normaVisualizar.item || "—"}
                    </span>
                  </div>
                </div>

                <hr className="divider" />

                {normaVisualizar.notas.length > 0 && (
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-pen-to-square"></i> Notas Técnicas
                    </span>
                    <ul className="view-list">
                      {normaVisualizar.notas.map((notaAtual, indiceNota) => (
                        <li key={indiceNota}>
                          <i className="fas fa-caret-right view-list-icon"></i>{" "}
                          {notaAtual}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {normaVisualizar.referencias.length > 0 && (
                  <div className="view-item">
                    <span className="view-label">
                      <i className="fas fa-link"></i> Referências
                    </span>
                    <ul className="view-list">
                      {normaVisualizar.referencias.map(
                        (referenciaAtual, indiceReferencia) => (
                          <li key={indiceReferencia}>
                            <i className="fas fa-caret-right view-list-icon"></i>{" "}
                            {referenciaAtual}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {(normaVisualizar.urlPdf ||
                  (normaVisualizar.imagens &&
                    normaVisualizar.imagens.length > 0)) && (
                  <>
                    <hr className="divider" />
                    <div className="view-item">
                      <span className="view-label">
                        <i className="fas fa-paperclip"></i> Anexos
                      </span>
                      {normaVisualizar.urlPdf && (
                        <div
                          className="attachment-pdf"
                          onClick={() =>
                            setPdfAberto({
                              url: normaVisualizar.urlPdf!,
                              nome: normaVisualizar.nomePdf!,
                            })
                          }
                        >
                          <i className="fas fa-file-pdf"></i>
                          <span className="attachment-pdf-name">
                            {normaVisualizar.nomePdf}
                          </span>
                        </div>
                      )}
                      {normaVisualizar.imagens &&
                        normaVisualizar.imagens.length > 0 && (
                          <div className="attachment-image-grid">
                            {normaVisualizar.imagens.map(
                              (urlImagem, indiceImagem) => (
                                <div
                                  key={indiceImagem}
                                  className="attachment-image-item"
                                  onClick={() =>
                                    setImagemAbertaIdx(indiceImagem)
                                  }
                                >
                                  <img
                                    src={urlImagem}
                                    alt={`Anexo ${indiceImagem + 1}`}
                                  />
                                  <div className="image-hover-overlay">
                                    <i className="fas fa-magnifying-glass-plus"></i>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </>
                )}

                {normaVisualizar.notas.length === 0 &&
                  normaVisualizar.referencias.length === 0 &&
                  !normaVisualizar.urlPdf &&
                  (!normaVisualizar.imagens ||
                    normaVisualizar.imagens.length === 0) && (
                    <div className="empty-state compact">
                      <i className="fas fa-folder-open"></i>
                      <p>Nenhuma nota ou anexo.</p>
                    </div>
                  )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setNormaVisualizar(null)}
                >
                  <i className="fas fa-check"></i> Concluído
                </button>
              </div>
            </div>
          </div>
        )}

        {pdfAberto && (
          <PdfViewer
            url={pdfAberto.url}
            nome={pdfAberto.nome}
            onClose={() => setPdfAberto(null)}
          />
        )}
        {imagemAbertaIdx !== null && normaVisualizar?.imagens && (
          <ImageLightbox
            imagens={normaVisualizar.imagens}
            indiceInicial={imagemAbertaIdx}
            onClose={() => setImagemAbertaIdx(null)}
          />
        )}
      </main>

      {confirmacao.visivel && (
        <ModalConfirmacao
          titulo={confirmacao.titulo}
          mensagem={confirmacao.mensagem}
          onConfirmar={confirmacao.onConfirmar}
          onCancelar={fecharConfirmacao}
        />
      )}
    </div>
  );
}
