export interface Norma {
  id: string;
  codigo: string;
  titulo: string;
  organizacao: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tipo: string;
  revisao: string;
  status: string;
  notas: string[];
  referencias: string[];
  palavrasChave: string[];
  nomePdf?: string;
  urlPdf?: string;
  imagens?: string[];
  criadoPor?: string;
}

export interface ToastMsg {
  id: number;
  tipo: "erro" | "sucesso";
  mensagem: string;
}

export interface ConfirmacaoState {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
}

export const ORGANIZACOES = [
  "ANAC",
  "FAA",
  "EASA",
  "ICAO",
  "DoD",
  "SAE",
  "ISO",
  "AKAER",
];
export const CATEGORIAS = ["Peça", "Conjunto", "Instalação", "Geral"];

export const SUBCATEGORIAS: Record<string, string[]> = {
  Peça: ["Metálica", "Não Metálica"],
  Conjunto: ["Instalação de Acessórios", "União de Peças", "Cablagem"],
  Instalação: ["Estrutura", "Hidromecânicos", "Elétrica", "Geral", "Teste"],
  Geral: ["Basic Notes", "Identificação"],
};

export const ITENS_POR_SUBCATEGORIA: Record<string, string[]> = {
  Metálica: [
    "Tubo",
    "Usinado",
    "Chapa",
    "Extrudado",
    "Fundido",
    "Tratamento Superficial",
    "Teste",
  ],
  "Instalação de Acessórios": ["Tubo com Acessório"],
  "União de Peças": ["Soldagem"],
  Cablagem: ["Proteção", "Bota", "Conector"],
  Geral: [
    "Selante",
    "Metalização",
    "Rebite",
    "Parafuso",
    "Arruela",
    "Inserto",
    "Frenagem",
    "Shim",
    "Primer",
  ],
};

export const STATUS_OPCOES = ["Vigente", "Revogada"];

export const ORG_ORIGENS: Record<string, string> = {
  ANAC: "🇧🇷",
  FAA: "🇺🇸",
  EASA: "🇪🇺",
  ICAO: "🌐",
  DoD: "🇺🇸",
  SAE: "🇺🇸",
  ISO: "🌐",
  AKAER: "🇧🇷",
};

export const CAT_ICONES: Record<string, string> = {
  Peça: "fa-gear",
  Conjunto: "fa-gears",
  Instalação: "fa-screwdriver-wrench",
  Geral: "fa-layer-group",
};

export const FORM_INICIAL: Partial<Norma> = {
  id: "",
  codigo: "",
  titulo: "",
  organizacao: ORGANIZACOES[0],
  categoria: CATEGORIAS[0],
  subcategoria: SUBCATEGORIAS[CATEGORIAS[0]][0],
  item: "",
  tipo: "Pública",
  revisao: "",
  status: "Vigente",
  notas: [""],
  referencias: [""],
  palavrasChave: [""],
};
