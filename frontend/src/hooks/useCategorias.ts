import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

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

export function useCategorias() {
  const [categorias, setCategorias] = useState<CategoriaApi[]>([]);

  useEffect(() => {
    let ativo = true;
    fetch(`${API_BASE_URL}/categorias`)
      .then((r) => (r.ok ? r.json() : []))
      .then((dados: CategoriaApi[]) => { if (ativo) setCategorias(dados); })
      .catch(() => {  });
    return () => { ativo = false; };
  }, []);

  const nomes = categorias.map((c) => c.nome);
  const subPorCategoria: Record<string, string[]> = {};
  categorias.forEach((c) => {
    subPorCategoria[c.nome] = c.subcategorias.map((s) => s.nome);
  });

  return { categorias, nomes, subPorCategoria };
}
