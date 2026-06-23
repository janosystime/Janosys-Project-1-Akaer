// frontend/src/hooks/useCategorias.ts
import { useState } from "react";
import { CATEGORIAS, SUBCATEGORIAS } from "../components/Normas/NormasViewModel";
import { subcategoriasDb } from "../utils/storage";

export interface SubcategoriaApi {
  id: number;
  nome: string;
}
export interface CategoriaApi {
  id: number;
  nome: string;
  icone: string;
  tema: string;
  subcategorias: SubcategoriaApi[];
}

const ICONES: Record<string, string> = {
  Peça: "fa-gear",
  Conjunto: "fa-gears",
  Instalação: "fa-screwdriver-wrench",
  Geral: "fa-layer-group",
};

const TEMAS: Record<string, string> = {
  Peça: "theme-peca",
  Conjunto: "theme-conjunto",
  Instalação: "theme-instalacao",
  Geral: "theme-geral",
};

export function useCategorias() {
  const [, forceUpdate] = useState(0);

  const categorias: CategoriaApi[] = CATEGORIAS.map((nome, idx) => {
    const subsStorage = subcategoriasDb.byCategoriaId(idx + 1);
    const subsBase = (SUBCATEGORIAS[nome] ?? []).map((s, i) => ({ id: i + 1, nome: s }));
    const todasSubs = subsStorage.length > 0
      ? subsStorage.map((s) => ({ id: s.id, nome: s.nome }))
      : subsBase;
    return {
      id: idx + 1,
      nome,
      icone: ICONES[nome] ?? "fa-folder",
      tema: TEMAS[nome] ?? "theme-all",
      subcategorias: todasSubs,
    };
  });

  const nomes = categorias.map((c) => c.nome);

  const subPorCategoria: Record<string, string[]> = {};
  categorias.forEach((c) => {
    subPorCategoria[c.nome] = c.subcategorias.map((s) => s.nome);
  });

  const adicionarSubcategoria = (categoriaNome: string, nomeNova: string) => {
    const idx = CATEGORIAS.indexOf(categoriaNome);
    if (idx === -1) return;
    subcategoriasDb.create(nomeNova, idx + 1);
    forceUpdate((n) => n + 1);
  };

  return { categorias, nomes, subPorCategoria, adicionarSubcategoria };
}