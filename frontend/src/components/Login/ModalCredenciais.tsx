// ModalCredenciais.tsx
import { useRef, useState, useEffect } from "react";

const CREDENCIAIS = [
  { login: "admin", senha: "123", perfil: "Administrador" },
  { login: "checker", senha: "123", perfil: "Checker" },
  { login: "usuario", senha: "123", perfil: "Usuário" },
];

export default function ModalCredenciais({ onFechar }: { onFechar: () => void }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = (clientX: number, clientY: number) => {
    dragging.current = true;
    offset.current = { x: clientX - pos.x, y: clientY - pos.y };
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!dragging.current) return;
    setPos({ x: clientX - offset.current.x, y: clientY - offset.current.y });
  };

  const stopDrag = () => { dragging.current = false; };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => stopDrag();
    const onTouchMove = (e: TouchEvent) => { moveDrag(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchEnd = () => stopDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pos]);

  return (
    <div
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        userSelect: "none",
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: 8,
        padding: "4px 16px",
        width: 220,
        boxShadow: "0 4px 0px rgba(0,0,0,0.15)",
        touchAction: "none",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onMouseDown={(e) => { startDrag(e.clientX, e.clientY); e.preventDefault(); }}
        onTouchStart={(e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, cursor: "grab" }}
      >
        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--c-text-1)" }}>
          <i className="fas fa-key" style={{ marginRight: 20 }}></i>CREDENCIAIS
        </span>
        <button className="btn-close" onClick={onFechar} style={{ width: 20, height: 20 }}>
          <i className="fas fa-xmark"></i>
        </button>
      </div>
      <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "var(--c-text-muted)" }}>
            <th style={{ textAlign: "left", paddingBottom: 4 }}>Login</th>
            <th style={{ textAlign: "left", paddingBottom: 4 }}>Senha</th>
            <th style={{ textAlign: "left", paddingBottom: 4 }}>| PERFIL</th>
          </tr>
        </thead>
        <tbody>
          {CREDENCIAIS.map((c) => (
            <tr key={c.login} style={{ borderTop: "1px solid var(--c-border)" }}>
              <td style={{ padding: "4px 0", fontWeight: 700, fontFamily: "monospace" }}>{c.login}</td>
              <td style={{ padding: "4px 0", textAlign: "center", fontWeight: 700, fontFamily: "monospace" }}>{c.senha}</td>
              <td style={{ padding: "4px 0" }}>| {c.perfil}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}