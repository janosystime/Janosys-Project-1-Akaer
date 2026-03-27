import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  server: {
    port: 5173,
    /** Se 5173 estiver ocupada, o Vite avisa em vez de abrir 5174 “no escuro”. */
    strictPort: true,
  },
=======
>>>>>>> 26a1da27b137ef47c5bedbf21e6d3ff5293e3659
})
