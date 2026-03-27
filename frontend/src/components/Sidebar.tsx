/**
 * Sidebar.tsx — menu lateral do sistema.
 *
 * Recebe via props:
 *   - usuario: objeto com nome e perfil de quem está logado
 *   - onLogout: função para executar ao clicar em "Sair"
 *
 * Conceitos usados:
 *   - Props: dados vindos do componente pai (Layout.tsx)
 *   - useState: igual ao contador do professor — guarda um valor que pode mudar
 *   - Renderização condicional: {isAdmin && <bloco>} → só aparece se isAdmin for true
 *   - NavLink: link do React Router que marca "active" na rota atual
 */

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Network, 
  FileText, 
  Users,
  LogOut, 
  Pin, 
  PinOff,
  BookOpen
} from 'lucide-react'
import type { UsuarioSessao } from '../auth/session'

type PropsSidebar = {
  usuario: UsuarioSessao
  onLogout: () => void
}

export default function Sidebar(props: PropsSidebar) {
  const { usuario, onLogout } = props

  // ── ESTADO 1: sidebar fixada (aberta) ou recolhida
  // Igual ao contador do professor: useState guarda o valor atual.
  // true  → sidebar está fixada/aberta
  // false → sidebar está recolhida (só ícones)
  const [fixada, setFixada] = useState(true)

  // ── ESTADO 2: mouse está sobre a sidebar?
  // Quando recolhida, passar o mouse expande temporariamente.
  // true  → mouse em cima → expande
  // false → mouse saiu   → recolhe de novo
  const [hover, setHover] = useState(false)

  // Alterna entre fixada e recolhida ao clicar no botão
  function alternarSidebar() {
    setFixada(!fixada)   // !fixada inverte: true vira false, false vira true
  }

  // Monta a classe CSS conforme o estado atual:
  //   fixada                        → 'sidebar'
  //   recolhida + mouse em cima     → 'sidebar recolhida expandida-hover'
  //   recolhida + mouse fora        → 'sidebar recolhida'
  // O CSS em sidebar.css usa essas classes para controlar a largura e animação.
  let classeSidebar = 'sidebar'
  if (!fixada && hover) {
    classeSidebar = 'sidebar recolhida expandida-hover'
  } else if (!fixada) {
    classeSidebar = 'sidebar recolhida'
  }

  const isAdmin = usuario.perfil === 'administrador'
  const sigla   = isAdmin ? 'AD' : 'US'

  return (
    <aside
      className={classeSidebar}
      // onMouseEnter / onMouseLeave: só ativam o hover quando a sidebar está recolhida
      onMouseEnter={() => { if (!fixada) setHover(true)  }}
      onMouseLeave={() => { if (!fixada) setHover(false) }}
    >

      {/* ── BOTÃO DE FIXAR/RECOLHER ──────────────────────
          Ao clicar, chama alternarSidebar() que inverte o estado `fixada`.
          O CSS anima a mudança de largura via transition. */}
      <div className="sidebar-toggle">
        <button 
          type="button" 
          onClick={alternarSidebar} 
          title={fixada ? "Desafixar menu" : "Fixar menu"}
          className="toggle-btn text-white"
        >
          {fixada ? <Pin size={20} color="white"/> : <PinOff size={20} color="white" />}
        </button>
      </div>

      {/* ── LINKS DE NAVEGAÇÃO ───────────────────────────
          NavLink adiciona a classe "active" automaticamente
          quando a URL bate com o valor de "to". */}
      <hr className="nav-divisor" />
      <p className="nav-secao-label">Menu</p>

      <NavLink to="/mindmap"  className="nav-item">
        <Network size={20} />
        <span className="nav-label">Mind Map</span>
      </NavLink>

      <NavLink to="/normativas" className="nav-item">
        <BookOpen size={20} />
        <span className="nav-label">Normativas</span>
      </NavLink>

      <NavLink to="/notas"      className="nav-item">
        <FileText size={20} />
        <span className="nav-label">Notas</span>
      </NavLink>

      {/* Bloco admin: só aparece se isAdmin for true */}
      {isAdmin && (
        <>
          <hr className="nav-divisor" />
          <p className="nav-secao-label">Administrador</p>
          <NavLink to="/usuarios" className="nav-item">
            <Users size={20} />
            <span className="nav-label">Usuários</span>
          </NavLink>
        </>
      )}

      {/* ── RODAPÉ DA SIDEBAR ────────────────────────────
          Avatar com sigla + nome do usuário + botão sair. */}
      <div className="sidebar-rodape">
        <div className="sidebar-usuario">
          <div className="sidebar-avatar">{sigla}</div>
          <span className="sidebar-usuario-nome">{usuario.nome}</span>
        </div>

        <button type="button" onClick={onLogout} className="nav-item sair">
          <LogOut size={20} />
          <span className="nav-label">Sair da conta</span>
        </button>
      </div>

    </aside>
  )
}