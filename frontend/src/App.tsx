import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { obterUsuarioAtual } from './auth/session'
import Login from './auth/Login'
import Home from './pages/Home'
import Normas from './pages/Normas'
import Solicitacoes from './pages/Solicitacoes'
import Chatbot from './pages/Chatbot'
import Usuarios from './pages/Usuarios'
import Versionamento from './pages/Versionamento'
import Layout from './components/Layout'

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const usuario = obterUsuarioAtual()
  if (!usuario) return <Navigate to="/login" />
  return <>{children}</>
}

function RotaAdmin({ children }: { children: React.ReactNode }) {
  const usuario = obterUsuarioAtual()
  if (!usuario || usuario.perfil !== 'administrador') return <Navigate to="/home" />
  return <>{children}</>
}

function RotaUsuario({ children }: { children: React.ReactNode }) {
  const usuario = obterUsuarioAtual()
  if (!usuario) return <Navigate to="/login" />
  return <>{children}</>
}

function AppRoutes() {
  const location = useLocation()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RotaProtegida><Layout /></RotaProtegida>}>
        <Route path="/home" element={<Home key={location.key} />} />
        <Route path="/normas" element={<Normas />} />
        <Route path="/solicitacoes" element={<RotaUsuario><Solicitacoes /></RotaUsuario>} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/usuarios" element={<RotaAdmin><Usuarios /></RotaAdmin>} />
        <Route path="/versionamento" element={<RotaAdmin><Versionamento /></RotaAdmin>} />
      </Route>
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}