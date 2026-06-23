import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Network, 
  Users,
  LogOut, 
  Pin, 
  PinOff,
  BookOpen,
  Menu, 
  X,    
  ClipboardList,
  GitBranch,
  MessageCircle
} from 'lucide-react'
import type { UsuarioSessao } from '../auth/session'

type PropsSidebar = {
  usuario: UsuarioSessao
  onLogout: () => void
}

export default function Sidebar(props: PropsSidebar) {
  const { usuario, onLogout } = props

  const [fixada, setFixada] = useState(true)
  const [hover, setHover] = useState(false)

  const [mobileAberto, setMobileAberto] = useState(false)

  function fecharMenuMobile() {
    setMobileAberto(false)
  }

  function alternarSidebar() {
    setFixada(!fixada)
  }

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
  const sigla = usuario.perfil === 'administrador' ? 'ADM' : usuario.perfil === 'checker' ? 'CHK' : 'USR'

  return (
    <>
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileAberto(true)}
        title="Abrir menu"
      >
        <Menu size={24} />
      </button>

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
        <div className="sidebar-nav">
          <div className="sidebar-toggle">
            <button 
              type="button" 
              onClick={alternarSidebar} 
              title={fixada ? "Desafixar menu" : "Fixar menu"}
              className="toggle-btn-desktop text-white"
            >
              {fixada ? <Pin size={20} color="white"/> : <PinOff size={20} color="white" />}
            </button>

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

          <NavLink to="/home" className="nav-item" onClick={fecharMenuMobile}>
            <Network size={20} />
            <span className="nav-label">Home</span>
          </NavLink>

          <NavLink to="/normas" className="nav-item" onClick={fecharMenuMobile}>
            <BookOpen size={20} />
            <span className="nav-label">Normas</span>
          </NavLink>

          <NavLink to="/solicitacoes" className="nav-item" onClick={fecharMenuMobile}>
            <ClipboardList size={20} />
            <span className="nav-label">Solicitações</span>
          </NavLink>

          <NavLink to="/chatbot" className="nav-item" onClick={fecharMenuMobile}>
            <MessageCircle size={20} />
            <span className="nav-label">Chatbot IA</span>
          </NavLink>

          {isAdmin && (
            <>
              <hr className="nav-divisor" />
              <p className="nav-secao-label">Administrador</p>
              <NavLink to="/usuarios" className="nav-item" onClick={fecharMenuMobile}>
                <Users size={20} />
                <span className="nav-label">Usuários</span>
              </NavLink>
              <NavLink to="/versionamento" className="nav-item" onClick={fecharMenuMobile}>
                <GitBranch size={20} />
                <span className="nav-label">Versionamento</span>
              </NavLink>
            </>
          )}
        </div>

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