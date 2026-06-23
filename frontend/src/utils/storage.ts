// frontend/src/utils/storage.ts
import type { Norma } from "../components/Normas/NormasViewModel";
import { SUBCATEGORIAS } from "../components/Normas/NormasViewModel";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Perfil = "administrador" | "usuario" | "checker";

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  senha: string;
  perfil: Perfil;
  telefone?: string;
  departamento?: string;
  dataCriacao: string;
}

export interface Solicitacao {
  id: number;
  codigo: string;
  titulo: string;
  motivo?: string;
  solicitante: string;
  data: string;
  status: "Aguardando análise" | "Em análise" | "Aceita" | "Indeferida";
  motivoRecusa?: string;
  avaliador?: string;
}

export interface HistoricoEntry {
  id: number;
  normaId: string;
  codigoNorma?: string;
  tituloNorma: string;
  usuarioNome: string;
  tipoAlteracao: "CADASTRO" | "EDICAO" | "EXCLUSAO";
  detalhes: string;
  data: string;
}

export interface SubcategoriaStorage {
  id: number;
  nome: string;
  categoriaId: number;
}

// ─── Chaves ───────────────────────────────────────────────────────────────────

const KEYS = {
  normas:        "signa:normas",
  usuarios:      "signa:usuarios",
  solicitacoes:  "signa:solicitacoes",
  historico:     "signa:historico",
  favoritos:     "signa:favoritos",
  subcategorias: "signa:subcategorias",
  seeded:        "signa:seeded",
} as const;

// ─── Seeds ────────────────────────────────────────────────────────────────────

const NORMAS_SEED: Norma[] = [
  {
    id: "RBAC 25.1309", codigo: "25.1309", titulo: "Análise de Segurança de Sistemas",
    organizacao: "ANAC", categoria: "Instalação", subcategoria: "Geral", item: "Parafuso",
    tipo: "Pública", revisao: "Emenda 09", status: "Vigente",
    notas: ["Norma principal de safety."], referencias: ["SAE ARP4761"],
    palavrasChave: ["safety", "análise de risco"],
    nomePdf: "rbac-25-1309.pdf", urlPdf: "/pdf/rbac-25-1309.pdf",
    imagens: ["/imagem/rbac-25-1309.jpeg"],
  },
  {
    id: "FAR 25.571", codigo: "25.571", titulo: "Damage Tolerance and Fatigue Evaluation",
    organizacao: "FAA", categoria: "Conjunto", subcategoria: "União de Peças", item: "Soldagem",
    tipo: "Pública", revisao: "Amendment 27", status: "Vigente",
    notas: [], referencias: [], palavrasChave: ["fadiga", "tolerância", "dano"],
    nomePdf: "far-25-571.pdf", urlPdf: "/pdf/far-25-571.pdf",
    imagens: ["/imagem/far-25-571.jpeg"],
  },
  {
    id: "ISO 9001:2015", codigo: "9001", titulo: "Quality management systems — Requirements",
    organizacao: "ISO", categoria: "Peça", subcategoria: "Metálica", item: "Usinado",
    tipo: "Pública", revisao: "2015", status: "Vigente",
    notas: ["Requisitos gerais para o sistema de gestão da qualidade nas plantas de manufatura."],
    referencias: ["ISO 9000:2015"], palavrasChave: ["qualidade", "gestão", "requisitos"],
  },
  {
    id: "CS-25", codigo: "CS-25", titulo: "Certification Specifications for Large Aeroplanes",
    organizacao: "EASA", categoria: "Conjunto", subcategoria: "Cablagem", item: "Conector",
    tipo: "Privada", revisao: "Amendment 27", status: "Vigente",
    notas: ["Especificações essenciais para certificação EASA em aeronaves de grande porte."],
    referencias: ["FAR 25"], palavrasChave: ["certificação", "aeronave grande", "easa"],
  },
];

const USUARIOS_SEED: Usuario[] = [
  { id: 1, nome: "Administrador Janosys", login: "admin",   senha: "123", perfil: "administrador", telefone: "(12) 99999-0001", departamento: "TI",         dataCriacao: "2026-01-01T00:00:00.000Z" },
  { id: 2, nome: "Usuario Janosys",       login: "usuario", senha: "123", perfil: "usuario",       telefone: "(12) 99999-0002", departamento: "Engenharia", dataCriacao: "2026-01-01T00:00:00.000Z" },
  { id: 3, nome: "Checker Janosys",       login: "checker", senha: "123", perfil: "checker",       telefone: "(12) 99999-0003", departamento: "Operações",  dataCriacao: "2026-01-01T00:00:00.000Z" },
];

const SOLICITACOES_SEED: Solicitacao[] = [
  { id: 1,  codigo: "AS9100",       titulo: "Quality Management Systems - Requirements for Aviation",                        solicitante: "Ana Silva",      data: "2026-03-01", status: "Aceita",            avaliador: "Checker Janosys" },
  { id: 2,  codigo: "MIL-STD-810", titulo: "Environmental Engineering Considerations and Laboratory Tests",                 solicitante: "Carlos Mendes",  data: "2026-03-05", status: "Em análise",        avaliador: "Checker Janosys" },
  { id: 3,  codigo: "RTCA DO-160", titulo: "Environmental Conditions and Test Procedures for Airborne Equipment",           solicitante: "Fernanda Rocha", data: "2026-03-10", status: "Aguardando análise" },
  { id: 4,  codigo: "SAE ARP4754", titulo: "Guidelines for Development of Civil Aircraft and Systems",                     solicitante: "Marcos Oliveira",data: "2026-03-12", status: "Aguardando análise" },
  { id: 5,  codigo: "MIL-STD-1553",titulo: "Digital Time Division Command/Response Multiplex Data Bus",                    solicitante: "Julia Ferreira", data: "2026-03-15", status: "Em análise",        avaliador: "Checker Janosys" },
  { id: 6,  codigo: "ASTM B117",   titulo: "Standard Practice for Operating Salt Spray Apparatus",                         solicitante: "Ricardo Souza",  data: "2026-03-18", status: "Indeferida",        avaliador: "Checker Janosys", motivoRecusa: "Norma já contemplada pela ISO 9227, disponível na biblioteca." },
  { id: 7,  codigo: "",            titulo: "Norma de proteção contra corrosão em estruturas metálicas aeronáuticas",        solicitante: "Patrícia Lima",  data: "2026-03-20", status: "Aguardando análise" },
  { id: 8,  codigo: "ISO 10007",   titulo: "Quality Management - Guidelines for Configuration Management",                 solicitante: "Eduardo Costa",  data: "2026-03-22", status: "Aceita",            avaliador: "Checker Janosys" },
  { id: 9,  codigo: "RTCA DO-178C",titulo: "Software Considerations in Airborne Systems and Equipment Certification",      solicitante: "Beatriz Nunes",  data: "2026-04-01", status: "Aguardando análise" },
  { id: 10, codigo: "ARP5412",     titulo: "Aircraft Lightning Environment and Related Test Waveforms",                    solicitante: "Thiago Alves",   data: "2026-04-10", status: "Em análise",        avaliador: "Checker Janosys" },
];

// Subcategorias seed derivadas do ViewModel existente
let _subId = 1;
const SUBCATEGORIAS_SEED: SubcategoriaStorage[] = Object.entries(SUBCATEGORIAS).flatMap(
  ([_cat, subs], catIdx) =>
    subs.map((nome) => ({ id: _subId++, nome, categoriaId: catIdx + 1 }))
);

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initStorage() {
  if (localStorage.getItem(KEYS.seeded)) return;
  localStorage.setItem(KEYS.normas,        JSON.stringify(NORMAS_SEED));
  localStorage.setItem(KEYS.usuarios,      JSON.stringify(USUARIOS_SEED));
  localStorage.setItem(KEYS.solicitacoes,  JSON.stringify(SOLICITACOES_SEED));
  localStorage.setItem(KEYS.historico,     JSON.stringify([]));
  localStorage.setItem(KEYS.favoritos,     JSON.stringify({}));
  localStorage.setItem(KEYS.subcategorias, JSON.stringify(SUBCATEGORIAS_SEED));
  localStorage.setItem(KEYS.seeded, "1");
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function get<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); }
  catch { return []; }
}
function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}
function nextId<T extends { id: number }>(list: T[]): number {
  return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
}

// ─── Normas ───────────────────────────────────────────────────────────────────

export const normasDb = {
  list: ()                  => get<Norma>(KEYS.normas),
  create: (n: Norma)        => { const l = get<Norma>(KEYS.normas); l.unshift(n); set(KEYS.normas, l); },
  update: (n: Norma)        => { set(KEYS.normas, get<Norma>(KEYS.normas).map((x) => x.id === n.id ? n : x)); },
  remove: (id: string)      => { set(KEYS.normas, get<Norma>(KEYS.normas).filter((x) => x.id !== id)); },
};

// ─── Usuários ─────────────────────────────────────────────────────────────────

export const usuariosDb = {
  list: ()                   => get<Usuario>(KEYS.usuarios),
  create: (u: Omit<Usuario, "id" | "dataCriacao">) => {
    const l = get<Usuario>(KEYS.usuarios);
    const novo = { ...u, id: nextId(l), dataCriacao: new Date().toISOString() };
    l.push(novo); set(KEYS.usuarios, l); return novo;
  },
  update: (u: Usuario)       => { set(KEYS.usuarios, get<Usuario>(KEYS.usuarios).map((x) => x.id === u.id ? u : x)); },
  remove: (id: number)       => { set(KEYS.usuarios, get<Usuario>(KEYS.usuarios).filter((x) => x.id !== id)); },
  findByLogin: (login: string) => get<Usuario>(KEYS.usuarios).find((u) => u.login === login),
};

// ─── Solicitações ─────────────────────────────────────────────────────────────

export const solicitacoesDb = {
  list: ()                      => get<Solicitacao>(KEYS.solicitacoes),
  create: (s: Omit<Solicitacao, "id">) => {
    const l = get<Solicitacao>(KEYS.solicitacoes);
    const nova = { ...s, id: nextId(l) };
    l.unshift(nova); set(KEYS.solicitacoes, l); return nova;
  },
  update: (s: Solicitacao)      => { set(KEYS.solicitacoes, get<Solicitacao>(KEYS.solicitacoes).map((x) => x.id === s.id ? s : x)); return s; },
};

// ─── Histórico ────────────────────────────────────────────────────────────────

export const historicoDb = {
  list: () => get<HistoricoEntry>(KEYS.historico),
  add: (entry: Omit<HistoricoEntry, "id">) => {
    const l = get<HistoricoEntry>(KEYS.historico);
    l.unshift({ ...entry, id: nextId(l) });
    set(KEYS.historico, l);
  },
};

// ─── Favoritos ────────────────────────────────────────────────────────────────
// Estrutura: { [usuarioId]: string[] }

export const favoritosDb = {
  list: (usuarioId: number): string[] => {
    const map = JSON.parse(localStorage.getItem(KEYS.favoritos) ?? "{}");
    return map[usuarioId] ?? [];
  },
  add: (usuarioId: number, normaId: string) => {
    const map = JSON.parse(localStorage.getItem(KEYS.favoritos) ?? "{}");
    const set_ = new Set<string>(map[usuarioId] ?? []);
    set_.add(normaId);
    map[usuarioId] = [...set_];
    localStorage.setItem(KEYS.favoritos, JSON.stringify(map));
  },
  remove: (usuarioId: number, normaId: string) => {
    const map = JSON.parse(localStorage.getItem(KEYS.favoritos) ?? "{}");
    map[usuarioId] = (map[usuarioId] ?? []).filter((id: string) => id !== normaId);
    localStorage.setItem(KEYS.favoritos, JSON.stringify(map));
  },
};

// ─── Subcategorias ────────────────────────────────────────────────────────────

export const subcategoriasDb = {
  list: ()                              => get<SubcategoriaStorage>(KEYS.subcategorias),
  byCategoriaId: (catId: number)        => get<SubcategoriaStorage>(KEYS.subcategorias).filter((s) => s.categoriaId === catId),
  create: (nome: string, categoriaId: number) => {
    const l = get<SubcategoriaStorage>(KEYS.subcategorias);
    const nova = { id: nextId(l), nome, categoriaId };
    l.push(nova); set(KEYS.subcategorias, l); return nova;
  },
};