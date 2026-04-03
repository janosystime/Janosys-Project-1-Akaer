import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Network, 
  Users,
  LogOut, 
  Pin, 
  PinOff,
  BookOpen,
  Menu, // Ícone para abrir no mobile
  X     // Ícone para fechar no mobile
} from 'lucide-react'
import type { UsuarioSessao } from '../auth/session'

type PropsSidebar = {
  usuario: UsuarioSessao
  onLogout: () => void
}

export default function Sidebar(props: PropsSidebar) {
  const { usuario, onLogout } = props

  // Estados do Desktop
  const [fixada, setFixada] = useState(true)
  const [hover, setHover] = useState(false)

  // Estado do Mobile
  const [mobileAberto, setMobileAberto] = useState(false)

  // Função para fechar o menu no mobile ao clicar em um link
  function fecharMenuMobile() {
    setMobileAberto(false)
  }

  function alternarSidebar() {
    setFixada(!fixada)
  }

  // Monta as classes CSS
  let classeSidebar = 'sidebar'
  if (!fixada && hover) {
    classeSidebar = 'sidebar recolhida expandida-hover'
  } else if (!fixada) {
    classeSidebar = 'sidebar recolhida'
  }
  if (mobileAberto) {
    classeSidebar += ' mobile-aberto'
  }

  const isAdmin = usuario.perfil === 'administrador'
  const sigla   = isAdmin ? 'AD' : 'US'

  return (
    <>
      {/* Botão flutuante para abrir a sidebar no mobile */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileAberto(true)}
        title="Abrir menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay escuro que fica atrás da sidebar no mobile */}
      {mobileAberto && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileAberto(false)} 
        />
      )}

      <aside
        className={classeSidebar}
        onMouseEnter={() => { if (!fixada) setHover(true)  }}
        onMouseLeave={() => { if (!fixada) setHover(false) }}
      >
        <div className="sidebar-toggle">
          {/* Botão de Fixar/Desafixar - Aparece apenas no Desktop */}
          <button 
            type="button" 
            onClick={alternarSidebar} 
            title={fixada ? "Desafixar menu" : "Fixar menu"}
            className="toggle-btn-desktop text-white"
          >
            {fixada ? <Pin size={20} color="white"/> : <PinOff size={20} color="white" />}
          </button>

          {/* Botão de Fechar - Aparece apenas no Mobile */}
          <button 
            type="button" 
            onClick={() => setMobileAberto(false)} 
            className="toggle-btn-mobile text-white"
          >
            <X size={24} color="white" />
          </button>
        </div>

        <hr className="nav-divisor" />
        <p className="nav-secao-label">Menu</p>

        <NavLink to="/Home" className="nav-item" onClick={fecharMenuMobile}>
          <Network size={20} />
          <span className="nav-label">Home</span>
        </NavLink>

        <NavLink to="/normas" className="nav-item" onClick={fecharMenuMobile}>
          <BookOpen size={20} />
          <span className="nav-label">Normas</span>
        </NavLink>

        {isAdmin && (
          <>
            <hr className="nav-divisor" />
            <p className="nav-secao-label">Administrador</p>
            <NavLink to="/usuarios" className="nav-item" onClick={fecharMenuMobile}>
              <Users size={20} />
              <span className="nav-label">Usuários</span>
            </NavLink>
          </>
        )}

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
    </>
  )
}