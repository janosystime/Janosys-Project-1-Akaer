/**
 * MarcaDaguaPdf.tsx
 *
 * Overlay de marca d'água em mosaico diagonal, posicionado sobre cada <Page>
 * do react-pdf. Usa SVG data-URI como background-image para máxima performance
 * e sem dependências adicionais.
 *
 * Uso:
 *   <MarcaDaguaPdf nomeUsuario="João Silva" largura={800} altura={1131} />
 */

interface PropsMarcaDagua {
  nomeUsuario: string;
  /** Largura em px do <Page> renderizado (mesmo valor passado para `width` no <Page>) */
  largura: number;
  /** Altura em px do <Page> renderizado — pode vir de onRenderSuccess ou ser estimada */
  altura: number;
}

/** Formata data/hora no padrão "dd/mm/aaaa HH:MM" */
function formatarDataHora(data: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()} ` +
    `${pad(data.getHours())}:${pad(data.getMinutes())}`
  );
}

/**
 * Gera um SVG em linha com duas linhas de texto (nome + data/hora)
 * e retorna como data-URI para uso em background-image.
 * O tile tem 320×120 px e o texto fica rotacionado −35°.
 */
function gerarSvgTile(nomeUsuario: string, dataHora: string): string {
  // Escapa caracteres que quebrariam o SVG inline
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
        // Dificulta seleção via DevTools / print
        WebkitUserSelect: "none",
        MozUserSelect: "none",
      }}
    />
  );
}