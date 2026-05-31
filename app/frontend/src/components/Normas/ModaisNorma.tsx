import LightboxImagens from "./LightboxImagens";
import ModalDetalhesNorma from "./ModalDetalhesNorma";
import VisualizadorPdf from "./VisualizadorPdf";
import type { Norma } from "./NormasViewModel";
import type { Peca } from "../../utils/pecas";

type PropsModaisNorma = {
  normaVisualizar: Norma | null;
  pecasRelacionadas: Peca[];
  podeEditar: boolean;
  onFecharDetalhes: () => void;
  onEditar: (norma: Norma) => void;
  onExcluir: (id: string) => void;
  onAbrirPdf: (url: string, nome: string) => void;
  onAbrirImagens: (imagens: string[], indice: number) => void;
  pdfAberto: { url: string; nome: string } | null;
  onFecharPdf: () => void;
  imagensAbertas: string[] | null;
  indiceImagemAberta: number | null;
  onFecharImagens: () => void;
};

export default function ModaisNorma({
  normaVisualizar,
  pecasRelacionadas,
  podeEditar,
  onFecharDetalhes,
  onEditar,
  onExcluir,
  onAbrirPdf,
  onAbrirImagens,
  pdfAberto,
  onFecharPdf,
  imagensAbertas,
  indiceImagemAberta,
  onFecharImagens,
}: PropsModaisNorma) {
  return (
    <>
      {normaVisualizar && (
        <ModalDetalhesNorma
          norma={normaVisualizar}
          pecasRelacionadas={pecasRelacionadas}
          onClose={onFecharDetalhes}
          onEdit={podeEditar ? onEditar : undefined}
          onDelete={podeEditar ? onExcluir : undefined}
          onViewPdf={onAbrirPdf}
          onViewImages={onAbrirImagens}
        />
      )}

      {pdfAberto && (
        <VisualizadorPdf
          url={pdfAberto.url}
          nome={pdfAberto.nome}
          onClose={onFecharPdf}
        />
      )}
      {indiceImagemAberta !== null && imagensAbertas && (
        <LightboxImagens
          imagens={imagensAbertas}
          indiceInicial={indiceImagemAberta}
          onClose={onFecharImagens}
        />
      )}
    </>
  );
}
