// frontend/src/hooks/useFavoritos.ts
import { useCallback, useState } from "react";
import { obterUsuarioAtual } from "../auth/session";
import { favoritosDb, usuariosDb } from "../utils/storage";

export default function useFavoritos() {
  const sessao = obterUsuarioAtual();
  const encontrado = sessao ? usuariosDb.findByLogin(sessao.nome) : null;

  const [usuarioId] = useState<number | null>(encontrado?.id ?? null);
  const [favoritos, setFavoritos] = useState<Set<string>>(
    () => new Set(encontrado ? favoritosDb.list(encontrado.id) : [])
  );
  const [soFavoritos, setSoFavoritos] = useState(false);

  const ehFavorito = useCallback((normaId: string) => favoritos.has(normaId), [favoritos]);

  const alternarFavorito = useCallback(
    (normaId: string) => {
      if (usuarioId == null) return;
      const jaEra = favoritos.has(normaId);
      if (jaEra) {
        favoritosDb.remove(usuarioId, normaId);
      } else {
        favoritosDb.add(usuarioId, normaId);
      }
      setFavoritos(new Set(favoritosDb.list(usuarioId)));
    },
    [usuarioId, favoritos],
  );

  function aplicarFiltroFavoritos<T extends { id: string }>(lista: T[]): T[] {
    return soFavoritos ? lista.filter((item) => favoritos.has(item.id)) : lista;
  }

  return {
    favoritosDisponiveis: usuarioId != null,
    favoritos,
    ehFavorito,
    alternarFavorito,
    soFavoritos,
    setSoFavoritos,
    aplicarFiltroFavoritos,
  };
}