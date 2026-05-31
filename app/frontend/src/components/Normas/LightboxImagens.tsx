import { useEffect, useState } from "react";

type PropsLightboxImagens = {
  imagens: string[];
  indiceInicial: number;
  onClose: () => void;
};

export default function LightboxImagens({
  imagens,
  indiceInicial,
  onClose,
}: PropsLightboxImagens) {
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
    <div
      className="lightbox-overlay protecao-conteudo"
      onClick={onClose}
      onContextMenu={(eventoContexto) => eventoContexto.preventDefault()}
    >
      <div
        className="lightbox-container"
        onClick={(eventoClique) => eventoClique.stopPropagation()}
      >
        <button className="lightbox-close" onClick={onClose} title="Fechar">
          <i className="fas fa-xmark"></i>
        </button>
        <img
          src={imagens[indiceAtual]}
          alt={`Anexo ${indiceAtual + 1}`}
          className="lightbox-img img-protegida"
          draggable="false"
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
