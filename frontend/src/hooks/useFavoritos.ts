import { useCallback, useEffect, useState } from "react";
import { obterUsuarioAtual } from "../auth/session";

const API = "http://localhost:3001";

/**
 * Favoritos por usuário, persistidos no backend.
 *
 * Como o login ainda é mock (a sessão guarda só { nome, perfil }, sem id),
 * resolvemos o id do usuário casando o nome da sessão com a lista de /usuarios.
 */
export default function useFavoritos() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [soFavoritos, setSoFavoritos] = useState(false);

  // resolve o id do usuário logado
  useEffect(() => {
    const sessao = obterUsuarioAtual();
    if (!sessao) return;
    (async () => {
      try {
        const resp = await fetch(`${API}/usuarios`);
        if (!resp.ok) return;
        const usuarios = await resp.json();
        const encontrado = usuarios.find((u: { id: number; nome: string }) => u.nome === sessao.nome);
        if (encontrado) setUsuarioId(encontrado.id);
      } catch (err) {
        console.error("Erro ao resolver usuário para favoritos:", err);
      }
    })();
  }, []);

  // carrega os favoritos quando souber o usuário
  useEffect(() => {
    if (usuarioId == null) return;
    (async () => {
      try {
        const resp = await fetch(`${API}/favoritos?usuarioId=${usuarioId}`);
        if (!resp.ok) return;
        const lista: string[] = await resp.json();
        setFavoritos(new Set(lista));
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    })();
  }, [usuarioId]);

  const ehFavorito = useCallback((normaId: string) => favoritos.has(normaId), [favoritos]);

  // alterna com atualização otimista (reverte se a API falhar)
  const alternarFavorito = useCallback(
    async (normaId: string) => {
      if (usuarioId == null) return;
      const jaEra = favoritos.has(normaId);

      setFavoritos((prev) => {
        const novo = new Set(prev);
        if (jaEra) novo.delete(normaId);
        else novo.add(normaId);
        return novo;
      });

      try {
        if (jaEra) {
          await fetch(`${API}/favoritos/${usuarioId}/${encodeURIComponent(normaId)}`, { method: "DELETE" });
        } else {
          await fetch(`${API}/favoritos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId, normaId }),
          });
        }
      } catch (err) {
        console.error("Erro ao alternar favorito:", err);
        setFavoritos((prev) => {
          const novo = new Set(prev);
          if (jaEra) novo.add(normaId);
          else novo.delete(normaId);
          return novo;
        });
      }
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
