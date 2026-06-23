// frontend/src/hooks/useNormas.ts
import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from "react";
import { obterUsuarioAtual } from "../auth/session";
import {
  FORM_INICIAL,
  SUBCATEGORIAS,
  type ConfirmacaoState,
  type Norma,
  type ToastMsg,
} from "../components/Normas/NormasViewModel";
import { carregarPecas, listarPecasRelacionadas, type Peca } from "../utils/pecas";
import { converterParaBase64 } from "../utils/NormasUtils";
import { normasDb, historicoDb } from "../utils/storage";

export default function useNormas() {
  const [pecas] = useState<Peca[]>(() => carregarPecas());
  const [normas, setNormas] = useState<Norma[]>(() => normasDb.list());
  const usuario = obterUsuarioAtual();
  const podeEditar = usuario?.perfil === "administrador" || usuario?.perfil === "checker";

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const adicionarToast = useCallback((tipoMensagem: ToastMsg["tipo"], mensagemConteudo: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, tipo: tipoMensagem, mensagem: mensagemConteudo }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const removerToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const bloquearAtalhos = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) e.preventDefault();
    };
    window.addEventListener("keydown", bloquearAtalhos);
    return () => window.removeEventListener("keydown", bloquearAtalhos);
  }, []);

  const [modalEstaVisivel, setModalEstaVisivel] = useState(false);
  const [etapaModal, setEtapaModal] = useState(1);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
  const [normaVisualizar, setNormaVisualizar] = useState<Norma | null>(null);
  const [erroCampos, setErroCampos] = useState<Partial<Record<keyof Norma, string>>>({});

  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [filtroItem, setFiltroItem] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const [pdfAberto, setPdfAberto] = useState<{ url: string; nome: string } | null>(null);
  const [imagensAbertas, setImagensAbertas] = useState<string[] | null>(null);
  const [indiceImagemAberta, setIndiceImagemAberta] = useState<number | null>(null);

  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState>({
    visivel: false, titulo: "", mensagem: "", onConfirmar: () => {},
  });
  const pedirConfirmacao = (titulo: string, mensagem: string, onConfirmar: () => void) => {
    setConfirmacao({ visivel: true, titulo, mensagem, onConfirmar });
  };
  const fecharConfirmacao = () => setConfirmacao((prev) => ({ ...prev, visivel: false }));

  const [form, setForm] = useState<Partial<Norma>>(FORM_INICIAL);
  const updateForm = (campo: keyof Norma, valor: unknown) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erroCampos[campo]) setErroCampos((prev) => ({ ...prev, [campo]: undefined }));
  };

  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [arquivosImagens, setArquivosImagens] = useState<File[]>([]);
  const pecasRelacionadas = useMemo(() => {
    if (!normaVisualizar) return [];
    return listarPecasRelacionadas(pecas, normaVisualizar.id);
  }, [normaVisualizar, pecas]);

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setArquivoPdf(e.target.files[0]);
  };
  const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setArquivosImagens((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const subcategoriasDisponiveis =
    filtroCategoria !== "Todas" ? (SUBCATEGORIAS[filtroCategoria] ?? []) : [];

  const itensDisponiveis = Array.from(
    new Set(
      normas
        .filter((n) => n.subcategoria === filtroSubcategoria && n.item)
        .map((n) => n.item),
    ),
  ).sort();

  const filtrosAtivos =
    termoPesquisa !== "" || filtroCategoria !== "Todas" ||
    filtroSubcategoria !== "" || filtroItem !== "" || filtroStatus !== "Todos";

  const limparFiltros = () => {
    setTermoPesquisa(""); setFiltroCategoria("Todas");
    setFiltroSubcategoria(""); setFiltroItem(""); setFiltroStatus("Todos");
  };

  const handleMudancaCategoriaFiltro = (cat: string) => {
    setFiltroCategoria(cat); setFiltroSubcategoria(""); setFiltroItem("");
  };
  const handleMudancaSubcategoriaFiltro = (sub: string) => {
    setFiltroSubcategoria(sub); setFiltroItem("");
  };

  const termoMinusculo = termoPesquisa.toLowerCase();
  const normasFiltradas = normas.filter((n) => {
    const matchBusca =
      n.id.toLowerCase().includes(termoMinusculo) ||
      n.codigo.toLowerCase().includes(termoMinusculo) ||
      n.titulo.toLowerCase().includes(termoMinusculo) ||
      (n.palavrasChave?.some((p) => p.toLowerCase().includes(termoMinusculo)));
    const matchCategoria = filtroCategoria === "Todas" || n.categoria === filtroCategoria;
    const matchSub = !filtroSubcategoria || n.subcategoria === filtroSubcategoria;
    const matchItem = !filtroItem || n.item === filtroItem;
    const matchStatus = filtroStatus === "Todos" || n.status === filtroStatus;
    return matchBusca && matchCategoria && matchSub && matchItem && matchStatus;
  });

  const abrirModalCadastro = () => {
    setIdEmEdicao(null); setForm(FORM_INICIAL);
    setEtapaModal(1); setErroCampos({}); setModalEstaVisivel(true);
  };
  const abrirModalEdicao = (norma: Norma) => {
    setIdEmEdicao(norma.id); setForm(norma);
    setEtapaModal(1); setErroCampos({}); setModalEstaVisivel(true);
  };
  const fecharModal = () => {
    setModalEstaVisivel(false); setIdEmEdicao(null);
    setForm(FORM_INICIAL); setArquivoPdf(null);
    setArquivosImagens([]); setErroCampos({});
  };

  const handleProximoPasso = () => {
    const erros: typeof erroCampos = {};
    if (!form.id?.trim()) erros.id = "Campo obrigatório";
    if (!form.titulo?.trim()) erros.titulo = "Campo obrigatório";
    if (Object.keys(erros).length > 0) {
      setErroCampos(erros);
      adicionarToast("erro", "Preencha os campos obrigatórios antes de avançar.");
      return;
    }
    setEtapaModal((prev) => prev + 1);
  };

  const handleSave = async () => {
    try {
      let urlPdf = form.urlPdf;
      let nomePdf = form.nomePdf;

      if (arquivoPdf) {
        if (arquivoPdf.size > 3 * 1024 * 1024) {
          adicionarToast("erro", "O PDF é muito grande (Máx 3MB)."); return;
        }
        urlPdf = await converterParaBase64(arquivoPdf);
        nomePdf = arquivoPdf.name;
      }

      let imagens = form.imagens ?? [];
      if (arquivosImagens.length > 0) {
        const novas = await Promise.all(
          arquivosImagens.map(async (f) => {
            if (f.size > 2 * 1024 * 1024) throw new Error(`Imagem ${f.name} excede 2MB.`);
            return await converterParaBase64(f);
          }),
        );
        imagens = [...imagens, ...novas];
      }

      const normaSalva: Norma = {
        ...(form as Norma),
        notas: (form.notas ?? []).filter((n) => n.trim() !== ""),
        referencias: (form.referencias ?? []).filter((r) => r.trim() !== ""),
        palavrasChave: (form.palavrasChave ?? []).filter((p) => p.trim() !== ""),
        nomePdf: nomePdf ?? undefined,
        urlPdf: urlPdf ?? undefined,
        imagens,
        criadoPor: form.criadoPor ?? usuario?.nome,
      };

      if (idEmEdicao) {
        normasDb.update(normaSalva);
        historicoDb.add({
          normaId: normaSalva.id,
          codigoNorma: normaSalva.codigo,
          tituloNorma: normaSalva.titulo,
          usuarioNome: usuario?.nome ?? "Sistema",
          tipoAlteracao: "EDICAO",
          detalhes: `Norma "${normaSalva.id}" editada.`,
          data: new Date().toISOString(),
        });
        setNormas(normasDb.list());
        adicionarToast("sucesso", `Norma "${normaSalva.id}" atualizada com sucesso!`);
      } else {
        normasDb.create(normaSalva);
        historicoDb.add({
          normaId: normaSalva.id,
          codigoNorma: normaSalva.codigo,
          tituloNorma: normaSalva.titulo,
          usuarioNome: usuario?.nome ?? "Sistema",
          tipoAlteracao: "CADASTRO",
          detalhes: `Norma "${normaSalva.id}" cadastrada com sucesso.`,
          data: new Date().toISOString(),
        });
        setNormas(normasDb.list());
        adicionarToast("sucesso", `Norma "${normaSalva.id}" registrada com sucesso!`);
      }
      fecharModal();
    } catch (err) {
      adicionarToast("erro", err instanceof Error ? err.message : "Erro ao processar ficheiros.");
    }
  };

  const handleDelete = (id: string) => {
    const norma = normas.find((n) => n.id === id);
    pedirConfirmacao(
      "Excluir norma",
      `Tem certeza que deseja excluir "${id}"? Esta ação não pode ser desfeita.`,
      () => {
        normasDb.remove(id);
        historicoDb.add({
          normaId: id,
          codigoNorma: norma?.codigo,
          tituloNorma: norma?.titulo ?? id,
          usuarioNome: usuario?.nome ?? "Sistema",
          tipoAlteracao: "EXCLUSAO",
          detalhes: `Norma "${id}" excluída do sistema.`,
          data: new Date().toISOString(),
        });
        setNormas(normasDb.list());
        fecharConfirmacao();
        adicionarToast("sucesso", `Norma "${id}" excluída.`);
      },
    );
  };

  return {
    podeEditar, normas, toasts, removerToast,
    modalEstaVisivel, etapaModal, setEtapaModal,
    idEmEdicao, normaVisualizar, setNormaVisualizar,
    erroCampos, termoPesquisa, setTermoPesquisa,
    filtroCategoria, filtroSubcategoria, filtroItem, filtroStatus,
    setFiltroItem, setFiltroStatus,
    pdfAberto, setPdfAberto,
    imagensAbertas, setImagensAbertas,
    indiceImagemAberta, setIndiceImagemAberta,
    confirmacao, fecharConfirmacao, form, updateForm,
    arquivoPdf, setArquivoPdf, arquivosImagens, setArquivosImagens,
    pecasRelacionadas, handlePdfChange, handleImgChange,
    subcategoriasDisponiveis, itensDisponiveis,
    filtrosAtivos, limparFiltros,
    handleMudancaCategoriaFiltro, handleMudancaSubcategoriaFiltro,
    normasFiltradas, abrirModalCadastro, abrirModalEdicao,
    fecharModal, handleProximoPasso, handleSave, handleDelete,
  };
}