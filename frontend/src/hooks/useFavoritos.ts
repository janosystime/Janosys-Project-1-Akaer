import { useCallback, useEffect, useState } from "react";
import { obterUsuarioAtual } from "../auth/session";

function getKey() {
  const sessao = obterUsuarioAtual();
  return sessao ? `favoritos:${sessao.nome}` : null;
}

export default function useFavoritos() {
  const [favoritos, setFavoritos] = useState<Set<string>>(() => {
    const key = getKey();
    if (!key) return new Set();
    try {
      const raw = localStorage.getItem(key);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const [soFavoritos, setSoFavoritos] = useState(false);

  useEffect(() => {
    const key = getKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify([...favoritos]));
  }, [favoritos]);

  const ehFavorito = useCallback((normaId: string) => favoritos.has(normaId), [favoritos]);

  const alternarFavorito = useCallback((normaId: string) => {
    setFavoritos((prev) => {
      const novo = new Set(prev);
      if (novo.has(normaId)) novo.delete(normaId);
      else novo.add(normaId);
      return novo;
    });
  }, []);

  function aplicarFiltroFavoritos<T extends { id: string }>(lista: T[]): T[] {
    return soFavoritos ? lista.filter((item) => favoritos.has(item.id)) : lista;
  }

  return {
    favoritosDisponiveis: true, // sempre disponível no localStorage
    favoritos,
    ehFavorito,
    alternarFavorito,
    soFavoritos,
    setSoFavoritos,
    aplicarFiltroFavoritos,
  };
}