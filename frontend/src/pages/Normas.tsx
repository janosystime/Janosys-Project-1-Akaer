
import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from "react";
import { obterUsuarioAtual } from '../auth/session'

import "../components/Sidebar";
import "../styles/Normas.css";
import {
  carregarPecas,
  listarPecasRelacionadas,
  type Peca,
} from "../helpers/pecas";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ContainerDeToasts from "../components/Normas/ContainerDeToasts";
import ModalConfirmacao from "../components/Normas/ModalConfirmacao";
import VisualizadorPdf from "../components/Normas/VisualizadorPdf";
import LightboxImagens from "../components/Normas/LightboxImagens";
import ModalDetalhesNorma from "../components/Normas/ModalDetalhesNorma";
import CartaoNorma from "../components/Normas/CartaoNorma";
import { NORMAS_BASE } from "../components/Normas/mocks";
import {
  CAT_ICONES,
  CATEGORIAS,
  FORM_INICIAL,
  ITENS_POR_SUBCATEGORIA,
  ORGANIZACOES,
  ORG_ORIGENS,
  STATUS_OPCOES,
  SUBCATEGORIAS,
  type ConfirmacaoState,
  type Norma,
  type ToastMsg,
} from "../components/Normas/NormasViewModel";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const converterParaBase64 = (arquivoAtual: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.readAsDataURL(arquivoAtual);
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = (erroAtual) => reject(erroAtual);
  });
};

function normalizarUrlPdf(urlPdf?: string): string | undefined {
  if (!urlPdf) return urlPdf;
  if (
    urlPdf.startsWith("data:") ||
    urlPdf.startsWith("blob:") ||
    urlPdf.startsWith("http://") ||
    urlPdf.startsWith("https://") ||
    urlPdf.startsWith("/pdf/")
  ) {
    return urlPdf;
  }

  if (urlPdf.startsWith("/")) {
    return `/pdf${urlPdf}`;
  }

  return `/pdf/${urlPdf}`;
}

function normalizarNormasSalvas(normasSalvas: Norma[]): Norma[] {
  return normasSalvas.map((normaAtual) => {
    const normaBase = NORMAS_BASE.find(nb => nb.id === normaAtual.id);
    return {
      ...normaAtual,
      urlPdf: normaAtual.urlPdf
        ? normalizarUrlPdf(normaAtual.urlPdf)
        : normaBase?.urlPdf,
      imagens: normaAtual.imagens?.length
        ? normaAtual.imagens
        : normaBase?.imagens,
      nomePdf: normaAtual.nomePdf || normaBase?.nomePdf,
    };
  });
}

export default function Biblioteca() {
  const [pecas] = useState<Peca[]>(() => carregarPecas());
  const [normas, setNormas] = useState<Norma[]>(() => {
    const normasSalvas = localStorage.getItem("biblioteca_normas");
    if (normasSalvas) {
      try {
        const parsed = JSON.parse(normasSalvas) as Norma[];
        if (Array.isArray(parsed)) {
          return normalizarNormasSalvas(parsed);
        }
      } catch (erroDeLeitura) {
        console.error("Erro ao ler normas do localStorage:", erroDeLeitura);
      }
    }
    return NORMAS_BASE;
  });

  const usuario = obterUsuarioAtual()
  const podeEditar = usuario?.perfil === 'administrador'

  useEffect(() => {
    localStorage.setItem("biblioteca_normas", JSON.stringify(normas));
  }, [normas]);

  useEffect(() => {
    const bloquearAtalhos = (eventoTeclado: KeyboardEvent) => {
      if ((eventoTeclado.ctrlKey || eventoTeclado.metaKey) && (eventoTeclado.key === 'p' || eventoTeclado.key === 's')) {
        eventoTeclado.preventDefault();
      }
    };

    window.addEventListener('keydown', bloquearAtalhos);
    return () => window.removeEventListener('keydown', bloquearAtalhos);
  }, []);

  const [modalEstaVisivel, setModalEstaVisivel] = useState(false);
  const [etapaModal, setEtapaModal] = useState(1);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
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
  const [imagensAbertas, setImagensAbertas] = useState<string[] | null>(null);
  const [indiceImagemAberta, setIndiceImagemAberta] = useState<number | null>(null);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const adicionarToast = useCallback(
    (tipoMensagem: ToastMsg["tipo"], mensagemConteudo: string) => {
      const identificadorToast = Date.now();
      setToasts((toastsAnteriores) => [
        ...toastsAnteriores,
        { id: identificadorToast, tipo: tipoMensagem, mensagem: mensagemConteudo },
      ]);
      setTimeout(
        () =>
          setToasts((toastsAnteriores) =>
            toastsAnteriores.filter((toastAtual) => toastAtual.id !== identificadorToast),
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
    onConfirmar: () => { },
  });
  const pedirConfirmacao = (
    tituloAviso: string,
    mensagemAviso: string,
    funcaoConfirmar: () => void,
  ) => {
    setConfirmacao({ visivel: true, titulo: tituloAviso, mensagem: mensagemAviso, onConfirmar: funcaoConfirmar });
  };
  const fecharConfirmacao = () =>
    setConfirmacao((confirmacaoAnterior) => ({
      ...confirmacaoAnterior,
      visivel: false,
    }));

  const [form, setForm] = useState<Partial<Norma>>(FORM_INICIAL);
  const updateForm = (campoParaAtualizar: keyof Norma, valorNovo: unknown) => {
    setForm((formularioAnterior) => ({
      ...formularioAnterior,
      [campoParaAtualizar]: valorNovo,
    }));
    if (erroCampos[campoParaAtualizar])
      setErroCampos((errosAnteriores) => ({
        ...errosAnteriores,
        [campoParaAtualizar]: undefined,
      }));
  };

  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [arquivosImagens, setArquivosImagens] = useState<File[]>([]);
  const pecasRelacionadas = useMemo(() => {
    if (!normaVisualizar) return [];
    return listarPecasRelacionadas(pecas, normaVisualizar.id);
  }, [normaVisualizar, pecas]);

  const handlePdfChange = (eventoMudanca: ChangeEvent<HTMLInputElement>) => {
    if (eventoMudanca.target.files?.[0]) setArquivoPdf(eventoMudanca.target.files[0]);
  };
  const handleImgChange = (eventoMudanca: ChangeEvent<HTMLInputElement>) => {
    if (eventoMudanca.target.files)
      setArquivosImagens((imagensAnteriores) => [
        ...imagensAnteriores,
        ...Array.from(eventoMudanca.target.files!),
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

  const handleMudancaCategoriaFiltro = (novaCategoriaSelecionada: string) => {
    setFiltroCategoria(novaCategoriaSelecionada);
    setFiltroSubcategoria("");
    setFiltroItem("");
  };

  const handleMudancaSubcategoriaFiltro = (novaSubcategoriaSelecionada: string) => {
    setFiltroSubcategoria(novaSubcategoriaSelecionada);
    setFiltroItem("");
  };

  const termoMinusculo = termoPesquisa.toLowerCase();

  const normasFiltradas = normas.filter((normaAtual) => {
    const matchBusca =
      normaAtual.id.toLowerCase().includes(termoMinusculo) ||
      normaAtual.codigo.toLowerCase().includes(termoMinusculo) ||
      normaAtual.titulo.toLowerCase().includes(termoMinusculo) ||
      (normaAtual.palavrasChave &&
        normaAtual.palavrasChave.some((palavraAtual) =>
          palavraAtual.toLowerCase().includes(termoMinusculo)
        ));

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
    setIdEmEdicao(null);
    setForm(FORM_INICIAL);
    setEtapaModal(1);
    setErroCampos({});
    setModalEstaVisivel(true);
  };

  const abrirModalEdicao = (normaParaEditar: Norma) => {
    setIdEmEdicao(normaParaEditar.id);
    setForm(normaParaEditar);
    setEtapaModal(1);
    setErroCampos({});
    setModalEstaVisivel(true);
  };

  const fecharModal = () => {
    setModalEstaVisivel(false);
    setIdEmEdicao(null);
    setForm(FORM_INICIAL);
    setArquivoPdf(null);
    setArquivosImagens([]);
    setErroCampos({});
  };

  const handleProximoPasso = () => {
    const errosEncontrados: typeof erroCampos = {};
    if (!form.id?.trim()) errosEncontrados.id = "Campo obrigatório";
    if (!form.titulo?.trim()) errosEncontrados.titulo = "Campo obrigatório";
    if (Object.keys(errosEncontrados).length > 0) {
      setErroCampos(errosEncontrados);
      adicionarToast(
        "erro",
        "Preencha os campos obrigatórios antes de avançar.",
      );
      return;
    }
    setEtapaModal((etapaAnterior) => etapaAnterior + 1);
  };

  const handleSave = async () => {
    try {
      let stringBase64Pdf = form.urlPdf;
      let nomeArquivoPdf = form.nomePdf;

      if (arquivoPdf) {
        if (arquivoPdf.size > 3 * 1024 * 1024) {
          adicionarToast(
            "erro",
            "O PDF é muito grande para salvar localmente (Máx 3MB).",
          );
          return;
        }
        stringBase64Pdf = await converterParaBase64(arquivoPdf);
        nomeArquivoPdf = arquivoPdf.name;
      }

      let stringsBase64Imagens = form.imagens || [];
      if (arquivosImagens.length > 0) {
        const novasImagensBase64 = await Promise.all(
          arquivosImagens.map(async (arquivoImagemAtual) => {
            if (arquivoImagemAtual.size > 2 * 1024 * 1024) {
              throw new Error(
                `Imagem ${arquivoImagemAtual.name} excede o limite de 2MB.`,
              );
            }
            return await converterParaBase64(arquivoImagemAtual);
          }),
        );
        stringsBase64Imagens = [...stringsBase64Imagens, ...novasImagensBase64];
      }

      const normaSalva = {
        ...form,
        notas: (form.notas || []).filter((notaAtual) => notaAtual.trim() !== ""),
        referencias: (form.referencias || []).filter(
          (referenciaAtual) => referenciaAtual.trim() !== "",
        ),
        palavrasChave: (form.palavrasChave || []).filter(
          (palavraAtual) => palavraAtual.trim() !== "",
        ),
        nomePdf: nomeArquivoPdf,
        urlPdf: stringBase64Pdf,
        imagens: stringsBase64Imagens,
      } as Norma;

      if (idEmEdicao) {
        setNormas((normasAnteriores) =>
          normasAnteriores.map((normaAnalisada) =>
            normaAnalisada.id === idEmEdicao ? normaSalva : normaAnalisada
          )
        );
        adicionarToast(
          "sucesso",
          `Norma "${normaSalva.id}" atualizada com sucesso!`,
        );
      } else {
        setNormas([normaSalva, ...normas]);
        adicionarToast(
          "sucesso",
          `Norma "${normaSalva.id}" registada com sucesso!`,
        );
      }
      fecharModal();

    } catch (erroDeProcessamento: unknown) {
      console.error(erroDeProcessamento);
      if (erroDeProcessamento instanceof Error && erroDeProcessamento.name === "QuotaExceededError") {
        adicionarToast(
          "erro",
          "Limite de armazenamento excedido! Tente remover anexos antigos ou usar ficheiros menores.",
        );
      } else {
        adicionarToast(
          "erro",
          erroDeProcessamento instanceof Error
            ? erroDeProcessamento.message
            : "Erro ao processar os ficheiros.",
        );
      }
    }
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
      <ContainerDeToasts toasts={toasts} onRemover={removerToast} />

      <main className="page">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-book-open"></i> Biblioteca de Normas
          </h1>
          {podeEditar && (
            <button className="btn btn-primary" onClick={abrirModalCadastro}>
              <i className="fas fa-circle-plus"></i> Nova Norma
            </button>
          )}
        </div>

        <div className="filtros-container">
          <div className="filtros-header">
            <div className="form-group search-group">
              <i className="fas fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                className="form-input search-input"
                placeholder="Pesquisar por ID, Código, Título ou Palavra-chave..."
                value={termoPesquisa}
                onChange={(eventoMudanca) => setTermoPesquisa(eventoMudanca.target.value)}
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
            {CATEGORIAS.map((nomeCategoriaAtual) => (
              <button
                key={nomeCategoriaAtual}
                className={`filter-badge theme-cat-${nomeCategoriaAtual.toLowerCase()} ${filtroCategoria === nomeCategoriaAtual ? "active" : ""}`}
                onClick={() => handleMudancaCategoriaFiltro(nomeCategoriaAtual)}
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
                  onClick={() => handleMudancaSubcategoriaFiltro("")}
                >
                  <i className="fas fa-border-all"></i> Todas
                </button>
                {subcategoriasDisponiveis.map((nomeSubcategoriaAtual) => (
                  <button
                    key={nomeSubcategoriaAtual}
                    className={`filter-badge theme-subcategoria ${filtroSubcategoria === nomeSubcategoriaAtual ? "active" : ""}`}
                    onClick={() =>
                      handleMudancaSubcategoriaFiltro(nomeSubcategoriaAtual)
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
                onClick={() => setFiltroItem("")}
              >
                <i className="fas fa-border-all"></i> Todos
              </button>
              {itensDisponiveis.map((nomeItemAtual) => (
                <button
                  key={nomeItemAtual}
                  className={`filter-badge theme-subcategoria ${filtroItem === nomeItemAtual ? "active" : ""}`}
                  onClick={() => setFiltroItem(nomeItemAtual)}
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
              onClick={() => setFiltroStatus("Todos")}
            >
              <i className="fas fa-border-all"></i> Todos
            </button>
            {STATUS_OPCOES.map((nomeStatusAtual) => (
              <button
                key={nomeStatusAtual}
                className={`filter-badge filter-badge-status-${nomeStatusAtual.toLowerCase()} ${filtroStatus === nomeStatusAtual ? "active" : ""}`}
                onClick={() => setFiltroStatus(nomeStatusAtual)}
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
              onEdit={podeEditar ? abrirModalEdicao : undefined}
              onDelete={podeEditar ? handleDelete : undefined}
              onShowDetails={setNormaVisualizar}
              onViewPdf={(urlVisualizada, nomePdfVisualizado) => setPdfAberto({ url: urlVisualizada, nome: nomePdfVisualizado })}
              onViewImages={(imagensParaVisualizar) => {
                setImagensAbertas(imagensParaVisualizar);
                setIndiceImagemAberta(0);
              }}
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

        {modalEstaVisivel && (
          <div className="modal-overlay" onClick={fecharModal}>
            <div
              className="modal modal-large"
              onClick={(eventoClique) => eventoClique.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <i className="fas fa-file-circle-plus"></i>{" "}
                  {idEmEdicao ? "Editar Norma" : "Registar Nova Norma"}
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
                    className={`stepper-step ${etapaModal >= step ? "active" : ""} ${etapaModal > step ? "completed" : ""}`}
                  >
                    <span className="stepper-number">
                      {etapaModal > step ? (
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
                onSubmit={(eventoSubmissao) => {
                  eventoSubmissao.preventDefault();
                  if (etapaModal < 3) {
                    handleProximoPasso();
                  } else {
                    handleSave();
                  }
                }}
              >
                {etapaModal === 1 && (
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
                        disabled={!!idEmEdicao}
                        onChange={(eventoMudanca) =>
                          updateForm("id", eventoMudanca.target.value)
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
                        onChange={(eventoMudanca) =>
                          updateForm("codigo", eventoMudanca.target.value)
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
                        onChange={(eventoMudanca) =>
                          updateForm("titulo", eventoMudanca.target.value)
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
                        onChange={(eventoMudanca) =>
                          updateForm("organizacao", eventoMudanca.target.value)
                        }
                      >
                        {ORGANIZACOES.map((nomeOrganizacaoAtual) => (
                          <option key={nomeOrganizacaoAtual} value={nomeOrganizacaoAtual}>
                            {ORG_ORIGENS[nomeOrganizacaoAtual]} {nomeOrganizacaoAtual}
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
                        onChange={(eventoMudanca) =>
                          updateForm("revisao", eventoMudanca.target.value)
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
                        onChange={(eventoMudanca) => {
                          const novaCategoria = eventoMudanca.target.value;
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
                        {CATEGORIAS.map((nomeCategoriaAtual) => (
                          <option key={nomeCategoriaAtual} value={nomeCategoriaAtual}>
                            {nomeCategoriaAtual}
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
                        onChange={(eventoMudanca) => {
                          const novaSubcategoria = eventoMudanca.target.value;
                          updateForm("subcategoria", novaSubcategoria);
                          updateForm("item", "");
                        }}
                      >
                        {(SUBCATEGORIAS[form.categoria ?? ""] ?? []).map(
                          (nomeSubcategoriaAtual) => (
                            <option key={nomeSubcategoriaAtual} value={nomeSubcategoriaAtual}>
                              {nomeSubcategoriaAtual}
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
                        onChange={(eventoMudanca) =>
                          updateForm("item", eventoMudanca.target.value)
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
                        ).map((nomeItemAtual) => (
                          <option key={nomeItemAtual} value={nomeItemAtual}>
                            {nomeItemAtual}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {etapaModal === 2 && (
                  <>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-circle-dot"></i> Status
                        </label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={(eventoMudanca) =>
                            updateForm("status", eventoMudanca.target.value)
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
                          onChange={(eventoMudanca) =>
                            updateForm("tipo", eventoMudanca.target.value)
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
                        <i className="fas fa-key"></i> Palavras-chave
                      </label>
                      <div className="dynamic-list">
                        {(form.palavrasChave || []).map(
                          (palavraAtual, indicePalavraAtual) => (
                            <div key={indicePalavraAtual} className="dynamic-row">
                              <input
                                className="form-input"
                                value={palavraAtual}
                                onChange={(eventoMudanca) => {
                                  const novasPalavras = [
                                    ...(form.palavrasChave || []),
                                  ];
                                  novasPalavras[indicePalavraAtual] =
                                    eventoMudanca.target.value;
                                  updateForm("palavrasChave", novasPalavras);
                                }}
                                placeholder="Palavra-chave..."
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-icon"
                                onClick={() =>
                                  updateForm(
                                    "palavrasChave",
                                    (form.palavrasChave || []).filter(
                                      (_palavraIgnorada, indiceAtualCopia) =>
                                        indiceAtualCopia !== indicePalavraAtual,
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
                            updateForm("palavrasChave", [
                              ...(form.palavrasChave || []),
                              "",
                            ])
                          }
                        >
                          <i className="fas fa-plus"></i> Nova palavra-chave
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-pen-to-square"></i> Notas Técnicas
                      </label>
                      <div className="dynamic-list">
                        {(form.notas || []).map((notaAtual, indiceNotaAtual) => (
                          <div key={indiceNotaAtual} className="dynamic-row">
                            <input
                              className="form-input"
                              value={notaAtual}
                              onChange={(eventoMudanca) => {
                                const novasNotas = [...(form.notas || [])];
                                novasNotas[indiceNotaAtual] = eventoMudanca.target.value;
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
                                  (form.notas || []).filter(
                                    (_notaIgnorada, indiceAtualCopia) =>
                                      indiceAtualCopia !== indiceNotaAtual,
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
                            updateForm("notas", [...(form.notas || []), ""])
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
                        {(form.referencias || []).map(
                          (referenciaAtual, indiceReferenciaAtual) => (
                            <div key={indiceReferenciaAtual} className="dynamic-row">
                              <input
                                className="form-input"
                                value={referenciaAtual}
                                onChange={(eventoMudanca) => {
                                  const novasReferencias = [
                                    ...(form.referencias || []),
                                  ];
                                  novasReferencias[indiceReferenciaAtual] =
                                    eventoMudanca.target.value;
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
                                    (form.referencias || []).filter(
                                      (_referenciaIgnorada, indiceAtualCopia) =>
                                        indiceAtualCopia !== indiceReferenciaAtual,
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
                              ...(form.referencias || []),
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

                {etapaModal === 3 && (
                  <div className="form-grid">
                    <div className="file-upload-group">
                      <label className="form-label">
                        <i className="fas fa-file-pdf"></i> Arquivo PDF
                      </label>
                      {form.urlPdf && !arquivoPdf ? (
                        <div className="attachment-pdf">
                          <i className="fas fa-file-pdf"></i>
                          <span className="attachment-pdf-name">{form.nomePdf}</span>
                          <button type="button" className="btn-remove-file" onClick={() => { updateForm('urlPdf', undefined); updateForm('nomePdf', undefined); }}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ) : (
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
                            <span className="file-hint">Máximo 3MB (.pdf)</span>
                          </div>
                          {arquivoPdf && (
                            <button
                              type="button"
                              className="btn-remove-file"
                              onClick={(eventoClique) => {
                                eventoClique.preventDefault();
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
                      )}
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
                          <span className="file-name">Adicionar imagens</span>
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

                      {form.imagens && form.imagens.length > 0 && (
                        <div className="image-preview-list">
                          {form.imagens.map((urlImagemExistente, indiceImagemExistente) => (
                            <div key={`existente-${indiceImagemExistente}`} className="image-preview-item">
                              <img src={urlImagemExistente} alt="Preview" />
                              <button type="button" className="btn-remove-preview" onClick={() => {
                                const novasImagensFormulario = [...form.imagens!];
                                novasImagensFormulario.splice(indiceImagemExistente, 1);
                                updateForm('imagens', novasImagensFormulario);
                              }}>
                                <i className="fas fa-xmark"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {arquivosImagens.length > 0 && (
                        <div className="image-preview-list">
                          {arquivosImagens.map(
                            (arquivoImagemNovo, indiceImagemNovo) => (
                              <div
                                key={`nova-${indiceImagemNovo}`}
                                className="image-preview-item"
                              >
                                <img
                                  src={URL.createObjectURL(arquivoImagemNovo)}
                                  alt="Preview"
                                />
                                <button
                                  type="button"
                                  className="btn-remove-preview"
                                  onClick={() =>
                                    setArquivosImagens((imagensAnteriores) =>
                                      imagensAnteriores.filter(
                                        (_imagemIgnorada, indiceAtualParaFiltro) =>
                                          indiceAtualParaFiltro !== indiceImagemNovo,
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
                    {etapaModal > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() =>
                          setEtapaModal((etapaAnterior) => etapaAnterior - 1)
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
                    {etapaModal < 3 ? (
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

          <ModalDetalhesNorma
            norma={normaVisualizar}
            pecasRelacionadas={pecasRelacionadas}
            onClose={() => setNormaVisualizar(null)}
            onEdit={podeEditar ? abrirModalEdicao : undefined}
            onDelete={podeEditar ? handleDelete : undefined}
            onViewPdf={(urlVisualizada, nomePdfVisualizado) => setPdfAberto({ url: urlVisualizada, nome: nomePdfVisualizado })}
            onViewImages={(imagensParaVisualizar, indice) => {
              setImagensAbertas(imagensParaVisualizar);
              setIndiceImagemAberta(indice);
            }}
          />
        )}

        {pdfAberto && (
          <VisualizadorPdf
            url={pdfAberto.url}
            nome={pdfAberto.nome}
            onClose={() => setPdfAberto(null)}
          />
        )}
        {indiceImagemAberta !== null && imagensAbertas && (
          <LightboxImagens
            imagens={imagensAbertas}
            indiceInicial={indiceImagemAberta}
            onClose={() => {
              setIndiceImagemAberta(null);
              setImagensAbertas(null);
            }}
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
