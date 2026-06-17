/**
 * URL base da API.
 *
 * - Em produção / Docker: o Nginx faz proxy reverso de /api → backend:3001,
 *   então usamos caminho relativo "/api".
 * - Em desenvolvimento local (Vite dev server): o proxy configurado em
 *   vite.config.ts redireciona /api → http://localhost:3001.
 *
 * Se precisar apontar para outro endereço, defina VITE_API_URL no .env:
 *   VITE_API_URL=http://localhost:3001
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
