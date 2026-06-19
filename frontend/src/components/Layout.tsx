
import { useNavigate, Outlet } from 'react-router-dom'
import { obterUsuarioAtual, limparSessao } from '../auth/session'
import Sidebar from './Sidebar'
import logoJano from '../assets/Logo.signa.png';

export default function Layout() {
  const navegar  = useNavigate()         
  const usuario = obterUsuarioAtual()
  if (!usuario) {
    navegar('/login')
    return null
  }  

  function sair() {
    limparSessao()       
    navegar('/login')    
  }

  return (
    <div className="layout">

      <header className="topo">
        <div className="topo-logo">
          <img src={logoJano} alt="Logo Jano" className="logo-header" />
        </div>
        <p className="topo-titulo">
          Sistema Integrado de Gestão de Normas Aeronáuticas
        </p>
        <div style={{ flex: 1 }}></div>
      </header>

      <div className="layout-corpo">

        <Sidebar usuario={usuario} onLogout={sair} />

        <div className="area-principal">

          <main className="conteudo-principal">
            <Outlet />
          </main>

          <footer className="rodape">
            Desenvolvido por:{" "}
            <strong>
              <a
                href="https://github.com/janosystime"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
              >
                JanoSys Technologies
              </a>
            </strong>
          </footer>
        </div>
      </div>
    </div>
  )
}