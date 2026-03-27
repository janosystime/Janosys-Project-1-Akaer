// Importa o CSS global
import './styles/global.css'
import './styles/sidebar.css'

// Importa o componente Sidebar
import Sidebar from './components/Sidebar'

// Usuário simulado — futuramente virá do Context/API
const usuarioLogado = {
  nome: 'Nome exemplo',
  perfil: 'administrador'
}

function App() {
  return (
    <div className="layout">

      {/* Topo */}
      <header className="topo">
        <div className="topo-logo">
          <img src="/img/AKAER.signa.png" alt="Logo Akaer" className="logo-img" />
        </div>
        <p className="topo-titulo">
          Sistema Integrado de Gestão de Normativas Aeronáuticas
        </p>
        <div style={{ flex: 1 }}></div>
      </header>

      {/* Corpo */}
      <div className="layout-corpo">

        {/* Passa o usuário logado para a Sidebar */}
        <Sidebar usuario={usuarioLogado} />

        {/* Conteúdo principal — por enquanto vazio */}
        <main className="conteudo-principal">
          <h1>Bem-vindo ao SIGNA</h1>
        </main>
      </div>

      {/* Rodapé */}
      <footer className="rodape">
        Desenvolvido por: <strong>JanoSys Technologies</strong>
      </footer>

    </div>
  )
}

export default App