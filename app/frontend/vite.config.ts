import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    /** Se 5173 estiver ocupada, o Vite avisa em vez de abrir 5174 “no escuro”. */
    strictPort: true,
  },
})
