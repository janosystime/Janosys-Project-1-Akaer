import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Estilos globais do projeto — importados aqui para valer em todas as páginas
import './styles/global.css'
import './styles/sidebar.css'
import './styles/login.css'

import App from './App'

// "root" é a <div id="root"> do index.html — o React monta tudo dentro dela
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
