import type { ToastMsg } from "./NormasViewModel";

type PropsContainerDeToasts = {
  toasts: ToastMsg[];
  onRemover: (idParaRemover: number) => void;
};

export default function ContainerDeToasts({
  toasts,
  onRemover,
}: PropsContainerDeToasts) {
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
