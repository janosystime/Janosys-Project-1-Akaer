
import "../components/Sidebar";
import "../styles/Normas.css";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import useNormas from "../hooks/useNormas";
import useFavoritos from "../hooks/useFavoritos";
import CabecalhoNormas from "../components/Normas/CabecalhoNormas";
import ContainerDeToasts from "../components/Normas/ContainerDeToasts";
import FiltrosNormas from "../components/Normas/FiltrosNormas";
import FormularioNorma from "../components/Normas/FormularioNorma";
import ListaNormas from "../components/Normas/ListaNormas";
import ModalConfirmacao from "../components/Normas/ModalConfirmacao";
import ModaisNorma from "../components/Normas/ModaisNorma";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function Biblioteca() {
  const {
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
  } = useNormas();

  const {
    favoritosDisponiveis,
    ehFavorito,
    alternarFavorito,
    soFavoritos,
    setSoFavoritos,
    aplicarFiltroFavoritos,
  } = useFavoritos();

  const normasExibidas = aplicarFiltroFavoritos(normasFiltradas);

  return (
    <div className="app-container">
      <ContainerDeToasts toasts={toasts} onRemover={removerToast} />

      <main className="page">
        <CabecalhoNormas podeEditar={podeEditar} onNovaNorma={abrirModalCadastro} />

        <FiltrosNormas
          termoPesquisa={termoPesquisa}
          onTermoPesquisaChange={setTermoPesquisa}
          filtrosAtivos={filtrosAtivos}
          onLimparFiltros={limparFiltros}
          filtroCategoria={filtroCategoria}
          filtroSubcategoria={filtroSubcategoria}
          filtroItem={filtroItem}
          filtroStatus={filtroStatus}
          subcategoriasDisponiveis={subcategoriasDisponiveis}
          itensDisponiveis={itensDisponiveis}
          onCategoriaChange={handleMudancaCategoriaFiltro}
          onSubcategoriaChange={handleMudancaSubcategoriaFiltro}
          onItemChange={setFiltroItem}
          onStatusChange={setFiltroStatus}
        />

        {favoritosDisponiveis && (
          <button
            type="button"
            className={`btn ${soFavoritos ? "btn-warning" : "btn-ghost"}`}
            onClick={() => setSoFavoritos(!soFavoritos)}
            style={{ alignSelf: "flex-start", marginBottom: "8px" }}
            title="Mostrar apenas favoritos"
          >
            <i className={`${soFavoritos ? "fas" : "far"} fa-star`}></i> Só favoritos
          </button>
        )}

        <ListaNormas
          normas={normas}
          normasFiltradas={normasExibidas}
          podeEditar={podeEditar}
          filtrosAtivos={filtrosAtivos}
          onLimparFiltros={limparFiltros}
          onEditar={abrirModalEdicao}
          onExcluir={handleDelete}
          onVerDetalhes={setNormaVisualizar}
          onVerPdf={(url, nome) => setPdfAberto({ url, nome })}
          onVerImagens={(imagensParaVisualizar) => {
            setImagensAbertas(imagensParaVisualizar);
            setIndiceImagemAberta(0);
          }}
          ehFavorito={favoritosDisponiveis ? ehFavorito : undefined}
          onToggleFavorito={favoritosDisponiveis ? alternarFavorito : undefined}
        />

        <FormularioNorma
          visivel={modalEstaVisivel}
          idEmEdicao={idEmEdicao}
          etapaModal={etapaModal}
          setEtapaModal={setEtapaModal}
          erroCampos={erroCampos}
          form={form}
          updateForm={updateForm}
          arquivoPdf={arquivoPdf}
          setArquivoPdf={setArquivoPdf}
          arquivosImagens={arquivosImagens}
          setArquivosImagens={setArquivosImagens}
          onFechar={fecharModal}
          onProximoPasso={handleProximoPasso}
          onSalvar={handleSave}
          handlePdfChange={handlePdfChange}
          handleImgChange={handleImgChange}
        />

        <ModaisNorma
          normaVisualizar={normaVisualizar}
          pecasRelacionadas={pecasRelacionadas}
          podeEditar={podeEditar}
          onFecharDetalhes={() => setNormaVisualizar(null)}
          onEditar={abrirModalEdicao}
          onExcluir={handleDelete}
          onAbrirPdf={(urlNorma, nomePdfVisualizado) => setPdfAberto({ url: urlNorma, nome: nomePdfVisualizado })}
          onAbrirImagens={(imagensParaVisualizar, indice) => {
            setImagensAbertas(imagensParaVisualizar);
            setIndiceImagemAberta(indice);
          }}
          pdfAberto={pdfAberto}
          onFecharPdf={() => setPdfAberto(null)}
          imagensAbertas={imagensAbertas}
          indiceImagemAberta={indiceImagemAberta}
          onFecharImagens={() => {
            setIndiceImagemAberta(null);
            setImagensAbertas(null);
          }}
        />
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
