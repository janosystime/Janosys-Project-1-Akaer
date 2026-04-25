/**
 * Layout.tsx — moldura visual de todas as páginas internas.
 *
 * Monta: header (topo) + sidebar (menu lateral) + conteúdo + footer (rodapé).
 * O "conteúdo" é renderizado pelo <Outlet /> do React Router, que injeta
 * automaticamente a página correspondente à rota ativa.
 *
 * Conceitos usados:
 *  - Outlet: componente do React Router que substitui o antigo `children`.
 *            Como o Layout agora é compartilhado por todas as rotas internas,
 *            ele monta uma única vez — o estado da Sidebar (fixada/recolhida)
 *            persiste entre navegações.
 */

import { useNavigate, Outlet } from 'react-router-dom'
import { obterUsuarioAtual, limparSessao } from '../auth/session'
import Sidebar from './Sidebar'
import logoJano from '../assets/JanoSys.signa.png';

// Layout não recebe mais `children` via props.
// O conteúdo da página ativa é injetado pelo <Outlet /> abaixo.
export default function Layout() {
  const usuario = obterUsuarioAtual()!  // "!" diz ao TypeScript: pode confiar, não é null aqui
  const navegar  = useNavigate()         // hook do React Router para trocar de página via código

  // Chamada quando o usuário clica em "Sair"
  function sair() {
    limparSessao()       // apaga o usuário do localStorage
    navegar('/login')    // manda para a tela de login
  }

  return (
    // Div raiz que ocupa a tela inteira (height: 100vh via CSS)
    <div className="layout">

      {/* ── TOPO ─────────────────────────────────────── */}
      <header className="topo">
        <div className="topo-logo">
          <img src={logoJano} alt="Logo Jano" className="logo-header" />
        </div>
        <p className="topo-titulo">
          Sistema Integrado de Gestão de Normativas Aeronáuticas
        </p>
        {/* div vazia empurra o título para o centro via flex */}
        <div style={{ flex: 1 }}></div>
      </header>

      {/* ── CORPO (sidebar + página) ──────────────────── */}
      <div className="layout-corpo">

        {/* Sidebar recebe o usuário (para mostrar o nome) e a função de sair */}
        <Sidebar usuario={usuario} onLogout={sair} />

        {/* Área principal: o <Outlet /> renderiza a página da rota ativa.
            Substitui o antigo {children} — funciona igual, mas vem do React Router. */}
        <div className="area-principal">

          <main className="conteudo-principal">
            <Outlet />
          </main>

          <footer className="rodape">
            Desenvolvido por: <strong>JanoSys Technologies</strong>
          </footer>
        </div>
      </div>
    </div>
  )
}