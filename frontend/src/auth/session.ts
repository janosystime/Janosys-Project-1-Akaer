const SESSION_KEY = 'signa_usuario'

export type Perfil = 'administrador' | 'usuario' | 'checker'

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

export const USUARIO_DEV: UsuarioSessao = {
  nome: 'Dev local (sem sessão)',
  perfil: 'administrador',
}

export function obterUsuarioAtual(): UsuarioSessao | null {
  return obterSessao();
}
