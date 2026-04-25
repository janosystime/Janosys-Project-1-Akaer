/**
 * App.tsx — define quais páginas existem e quem pode acessar cada uma.
 *
 * Conceitos:
 *  - Componente: função que retorna JSX
 *  - Props: dados que um componente pai passa para o filho
 *  - React Router: troca de "página" sem recarregar o navegador
 *
 * Mudança importante:
 *  - O <Layout> envolve todas as rotas internas como rota pai.
 *    Assim ele monta uma única vez e o estado persiste entre todas as navegações.
 */

import { Routes, Route, Navigate } from 'react-router-dom'

import { obterUsuarioAtual } from './auth/session'

import Login      from './auth/Login'
import Home       from './pages/Home'
import Normas     from './pages/Normas'
import Solicitacoes     from './pages/Solicitacoes'
import Usuarios   from './pages/Usuarios'
import Layout     from './components/Layout'

// ------------------------------------------------------------
// Componente: RotaProtegida
// Só deixa entrar se houver um usuário salvo na sessão.
// Se não houver, manda para /login.
// Props recebidas:
//   - children: qualquer conteúdo JSX passado entre as tags
// ------------------------------------------------------------
function RotaProtegida({ children }: { children: React.ReactNode }) {
  const usuario = obterUsuarioAtual()

  // Se não está logado, redireciona para login
  if (!usuario) {
    return <Navigate to="/login" />
  }

  // Se está logado, mostra o que foi pedido
  return <>{children}</>
}

// ------------------------------------------------------------
// Componente: RotaAdmin
// Só deixa entrar se o usuário for administrador.
// Se não for, manda para /home.
// ------------------------------------------------------------
function RotaAdmin({ children }: { children: React.ReactNode }) {
  const usuario = obterUsuarioAtual()

  if (!usuario || usuario.perfil !== 'administrador') {
    return <Navigate to="/home" />
  }

  return <>{children}</>
}

// ------------------------------------------------------------
// Componente principal: App
// Define todas as rotas do sistema.
//
// Estrutura de rotas:
//   - /login              → fora do Layout, sem sidebar
//   - rota pai (sem path) → Layout único compartilhado por todas as rotas internas.
//                           O <Outlet /> dentro do Layout renderiza a rota filha ativa.
//     - /home            → protegida por RotaProtegida
//     - /normas       → protegida por RotaProtegida
//     - /usuarios         → protegida por RotaAdmin (só administrador)
// ------------------------------------------------------------
export default function App() {
  return (
    <Routes>

      {/* Página de login — fora do layout, não tem sidebar */}
      <Route path="/login" element={<Login />} />

      {/* Rota pai: Layout único compartilhado por todas as páginas internas.
          RotaProtegida garante que qualquer acesso exige login.
          O Layout monta uma única vez — o estado da Sidebar persiste entre rotas. */}
      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route path="/home"  element={<Home />} />
        <Route path="/normas" element={<Normas />} />
        <Route path="/solicitacoes"  element={<Solicitacoes />} />

        {/* Rota de usuários: RotaAdmin protege o conteúdo interno.
            O Layout já está montado — só o <Outlet /> troca. */}
        <Route
          path="/usuarios"
          element={
            <RotaAdmin>
              <Usuarios />
            </RotaAdmin>
          }
        />
      </Route>

      {/* Qualquer URL desconhecida vai para /home */}
      <Route path="*" element={<Navigate to="/home" />} />

    </Routes>
  )
}