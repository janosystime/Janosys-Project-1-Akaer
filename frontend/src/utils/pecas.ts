// Componente para exibir as peças relacionadas a uma norma
// não sabia onde colocar isso, então tirei as peças do Home.tsx e coloquei nesse helper pra facilitar a organização e deixar a exibição de peças centralizado em um arquivo só

export interface Peca {
  nome: string;
  categoria: string;
  subcategoria: string;
  normasVinculadas: string[];
}

const CHAVE_PECAS_STORAGE = "biblioteca_pecas";

export const PECAS_BASE: Peca[] = [
  { nome: "Tubo", categoria: "Peça", subcategoria: "Metálica", normasVinculadas: ["FAR 25.571"] },
  { nome: "Usinado", categoria: "Peça", subcategoria: "Metálica", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Chapa", categoria: "Peça", subcategoria: "Metálica", normasVinculadas: [] },
  { nome: "Extrudado", categoria: "Peça", subcategoria: "Metálica", normasVinculadas: ["FAR 25.571"] },
  { nome: "Fundido", categoria: "Peça", subcategoria: "Metálica", normasVinculadas: ["FAR 25.571", "ISO 9001:2015"] },
  { nome: "Tratamento Superficial", categoria: "Peça", subcategoria: "Metálica", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Teste", categoria: "Peça", subcategoria: "Metálica", normasVinculadas: ["FAR 25.571"] },
  { nome: "Material Composto", categoria: "Peça", subcategoria: "Não Metálica", normasVinculadas: ["FAR 25.571", "ISO 9001:2015"] },
  { nome: "Tubo com Acessório", categoria: "Conjunto", subcategoria: "Instalação de Acessórios", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Soldagem", categoria: "Conjunto", subcategoria: "União de Peças", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Proteção", categoria: "Conjunto", subcategoria: "Cablagem", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Bota", categoria: "Conjunto", subcategoria: "Cablagem", normasVinculadas: [] },
  { nome: "Conector", categoria: "Conjunto", subcategoria: "Cablagem", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Conjunto Estrutural", categoria: "Instalação", subcategoria: "Estrutura", normasVinculadas: ["FAR 25.571"] },
  { nome: "Válvula Hidromecânica", categoria: "Instalação", subcategoria: "Hidromecânicos", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Chicote Elétrico Principal", categoria: "Instalação", subcategoria: "Elétrica", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Selante", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Metalização", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: [] },
  { nome: "Rebite", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Parafuso", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Arruela", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: [] },
  { nome: "Inserto", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: [] },
  { nome: "Frenagem", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Shim", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: ["FAR 25.571"] },
  { nome: "Primer", categoria: "Instalação", subcategoria: "Geral", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Corpo de Prova de Vibração", categoria: "Instalação", subcategoria: "Teste", normasVinculadas: ["FAR 25.571"] },
  { nome: "Nota de Desenho Padrão", categoria: "Geral", subcategoria: "Basic Notes", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Plaqueta de Identificação", categoria: "Geral", subcategoria: "Identificação", normasVinculadas: ["ISO 9001:2015"] },
];

function ehPeca(valor: unknown): valor is Peca {
  if (!valor || typeof valor !== "object") return false;
  const peca = valor as Partial<Peca>;
  return (
    typeof peca.nome === "string" &&
    typeof peca.categoria === "string" &&
    typeof peca.subcategoria === "string" &&
    Array.isArray(peca.normasVinculadas) &&
    peca.normasVinculadas.every((normaId) => typeof normaId === "string")
  );
}

export function carregarPecas(): Peca[] {
  const pecasSalvas = localStorage.getItem(CHAVE_PECAS_STORAGE);
  if (!pecasSalvas) return PECAS_BASE;

  try {
    const parsed = JSON.parse(pecasSalvas);
    if (!Array.isArray(parsed) || !parsed.every(ehPeca)) return PECAS_BASE;
    return parsed;
  } catch {
    return PECAS_BASE;
  }
}

export function salvarPecas(pecas: Peca[]): void {
  localStorage.setItem(CHAVE_PECAS_STORAGE, JSON.stringify(pecas));
}

export function listarPecasRelacionadas(pecas: Peca[], normaId: string): Peca[] {
  return pecas
    .filter((peca) => peca.normasVinculadas.includes(normaId))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
