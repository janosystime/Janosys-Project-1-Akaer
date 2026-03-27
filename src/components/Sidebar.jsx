// Importa o useState — hook do React para controlar estado
import { useState } from 'react'

function Sidebar({ usuario }) {

  // Estado que controla se a sidebar está fixada ou recolhida
  const [fixada, setFixada] = useState(true)
  const [hover, setHover] = useState(false)

  // Define a classe da sidebar conforme o estado
  const classeAtiva = fixada ? 'sidebar' : hover ? 'sidebar recolhida expandida-hover' : 'sidebar recolhida'

  // Alterna entre fixada e recolhida
  const alternarSidebar = () => {
    setFixada(!fixada)
  }

  // Define a sigla conforme o perfil
  const sigla = usuario?.perfil === 'administrador' ? 'AD' : 'US'

  return (
    <aside
      className={classeAtiva}
      id="sidebar"
      onMouseEnter={() => !fixada && setHover(true)}
      onMouseLeave={() => !fixada && setHover(false)}
    >

      {/* Botão toggle */}
      <div className="sidebar-toggle">
        <button onClick={alternarSidebar} title="Fixar menu">
          <div className={`switch-trilho ${fixada ? 'switch-ativo' : ''}`}>
            <div className="switch-bolinha"></div>
          </div>
        </button>
      </div>

      {/* Seção Usuário */}
      <hr className="nav-divisor" />
      <p className="nav-secao-label">Usuário</p>

      <a href="#" className="nav-item">
        <span className="nav-label">Dashboard</span>
      </a>
      <a href="#" className="nav-item">
        <span className="nav-label">Normativas</span>
      </a>
      <a href="#" className="nav-item">
        <span className="nav-label">Notas</span>
      </a>

      {/* Seção Administrador */}
      <hr className="nav-divisor" />
      <p className="nav-secao-label">Administrador</p>

      <a href="#" className="nav-item">
        <span className="nav-label">Usuários</span>
      </a>
      <a href="#" className="nav-item">
        <span className="nav-label">Normativas</span>
      </a>
      <a href="#" className="nav-item">
        <span className="nav-label">Notas</span>
      </a>

      {/* Rodapé */}
      <div className="sidebar-rodape">
        <div className="sidebar-usuario">
          <div className="sidebar-avatar">{sigla}</div>
          <span className="sidebar-usuario-nome">{usuario?.nome}</span>
        </div>
        <a href="#" className="nav-item sair">
          <span className="nav-label">Sair da conta</span>
        </a>
      </div>
    </aside>
  )
}

export default Sidebar