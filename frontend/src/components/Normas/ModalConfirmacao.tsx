type PropsModalConfirmacao = {
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export default function ModalConfirmacao({
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
}: PropsModalConfirmacao) {
  return (
    <div className="modal-overlay confirmacao-overlay" onClick={onCancelar}>
      <div
        className="modal modal-confirmacao"
        onClick={(eventoClique) => eventoClique.stopPropagation()}
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
