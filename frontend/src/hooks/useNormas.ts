import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from "react";
import { obterUsuarioAtual } from "../auth/session";
import { NORMAS_BASE } from "../components/Normas/mocks";
import {
  FORM_INICIAL,
  SUBCATEGORIAS,
  type ConfirmacaoState,
  type Norma,
  type ToastMsg,
} from "../components/Normas/NormasViewModel";
import { carregarPecas, listarPecasRelacionadas, type Peca } from "../utils/pecas";
import { converterParaBase64, normalizarNormasSalvas } from "../utils/NormasUtils";

export default function useNormas() {
  const [pecas] = useState<Peca[]>(() => carregarPecas());
  const [normas, setNormas] = useState<Norma[]>(() => {
    const normasSalvas = localStorage.getItem("biblioteca_normas");
    if (normasSalvas) {
      try {
        const parsed = JSON.parse(normasSalvas) as Norma[];
        if (Array.isArray(parsed)) {
          return normalizarNormasSalvas(parsed, NORMAS_BASE);
        }
      } catch (erroDeLeitura) {
        console.error("Erro ao ler normas do localStorage:", erroDeLeitura);
      }
    }
    return NORMAS_BASE;
  });

  const usuario = obterUsuarioAtual();
  const podeEditar = usuario?.perfil === "administrador";

  useEffect(() => {
    localStorage.setItem("biblioteca_normas", JSON.stringify(normas));
  }, [normas]);

  useEffect(() => {
    const bloquearAtalhos = (eventoTeclado: KeyboardEvent) => {
      if ((eventoTeclado.ctrlKey || eventoTeclado.metaKey) && (eventoTeclado.key === "p" || eventoTeclado.key === "s")) {
        eventoTeclado.preventDefault();
      }
    };

    window.addEventListener("keydown", bloquearAtalhos);
    return () => window.removeEventListener("keydown", bloquearAtalhos);
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

  return {
    podeEditar,
    normas,
    toasts,
    removerToast,
    modalEstaVisivel,
    etapaModal,
    setEtapaModal,
    idEmEdicao,
    normaVisualizar,
    setNormaVisualizar,
    erroCampos,
    termoPesquisa,
    setTermoPesquisa,
    filtroCategoria,
    filtroSubcategoria,
    filtroItem,
    filtroStatus,
    setFiltroItem,
    setFiltroStatus,
    pdfAberto,
    setPdfAberto,
    imagensAbertas,
    setImagensAbertas,
    indiceImagemAberta,
    setIndiceImagemAberta,
    confirmacao,
    fecharConfirmacao,
    form,
    updateForm,
    arquivoPdf,
    setArquivoPdf,
    arquivosImagens,
    setArquivosImagens,
    pecasRelacionadas,
    handlePdfChange,
    handleImgChange,
    subcategoriasDisponiveis,
    itensDisponiveis,
    filtrosAtivos,
    limparFiltros,
    handleMudancaCategoriaFiltro,
    handleMudancaSubcategoriaFiltro,
    normasFiltradas,
    abrirModalCadastro,
    abrirModalEdicao,
    fecharModal,
    handleProximoPasso,
    handleSave,
    handleDelete,
  };
}
