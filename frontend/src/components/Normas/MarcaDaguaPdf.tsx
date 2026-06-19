
interface PropsMarcaDagua {
  nomeUsuario: string;
  largura: number;
  altura: number;
}

function formatarDataHora(data: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()} ` +
    `${pad(data.getHours())}:${pad(data.getMinutes())}`
  );
}

function gerarSvgTile(nomeUsuario: string, dataHora: string): string {
  const escapar = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const nome = escapar(nomeUsuario);
  const dt = escapar(dataHora);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="120">
      <g transform="rotate(-35, 160, 60)" fill="rgba(30,30,30,0.13)"
         font-family="Arial, Helvetica, sans-serif">
        <text x="160" y="52" font-size="13" font-weight="600"
              text-anchor="middle" letter-spacing="1">${nome}</text>
        <text x="160" y="70" font-size="10" font-weight="400"
              text-anchor="middle" letter-spacing="0.5">${dt}</text>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function MarcaDaguaPdf({
  nomeUsuario,
  largura,
  altura,
}: PropsMarcaDagua) {
  const dataHora = formatarDataHora(new Date());
  const tileUrl = gerarSvgTile(nomeUsuario, dataHora);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: largura,
        height: altura,
        pointerEvents: "none",
        userSelect: "none",
        backgroundImage: `url("${tileUrl}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "320px 120px",
        zIndex: 10,
        WebkitUserSelect: "none",
        MozUserSelect: "none",
      }}
    />
  );
}