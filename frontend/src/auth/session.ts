/**
 * Sessão MOCK (falsa) — até o backend devolver login real.
 *
 * Guardamos um objeto { nome, perfil } no localStorage do navegador.
 * É parecido com “lembrar que o usuário entrou”, só que sem servidor ainda.
 */
const SESSION_KEY = 'signa_usuario'

export type Perfil = 'administrador' | 'usuario'

export interface UsuarioSessao {
  nome: string
  perfil: Perfil
}

export function salvarSessao(usuario: UsuarioSessao): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario))
}

export function obterSessao(): UsuarioSessao | null {
  const valor = localStorage.getItem(SESSION_KEY)
  if (!valor) return null
  try {
    return JSON.parse(valor) as UsuarioSessao
  } catch {
    return null
  }
}

export function limparSessao(): void {
  localStorage.removeItem(SESSION_KEY)
}

/** Só em `npm run dev`: mesmo “usuário fictício” usado no App quando não há sessão. */
export const USUARIO_DEV: UsuarioSessao = {
  nome: 'Dev local (sem sessão)',
  perfil: 'administrador',
}

/** Sessão real ou, em desenvolvimento sem login, o usuário dev acima. */
export function obterUsuarioAtual(): UsuarioSessao | null {
  return obterSessao() ?? (import.meta.env.DEV ? USUARIO_DEV : null)
}
