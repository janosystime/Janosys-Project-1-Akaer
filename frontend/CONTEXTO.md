# Contexto do Projeto — SIGNA

## Stack
- React + TypeScript + Vite
- CSS puro (sem framework)
- Futuro: integração com backend Python + Prisma

## Estrutura
```` bash
Janosys-Project-1-Akaer/
├─ ...
├─ frontend/
   ├─ ...
   ├─ public/
   │  ├─ img
   │  ├─ favicon.svg
   │  └─ icons.svg
   └─ src/
       ├─ assets
       ├─ auth/
       │  └─ Login.tsx
       ├─ components/
       │  └─ Sidebar.tsx
       ├─ pages/
       │  ├─ Dashboard.tsx
       │  ├─ Normativas.tsx
       │  ├─ Notas.tsx
       │  └─ Usuarios.tsx
       ├─ styles/
       │  ├─ global.css
       │  ├─ login.css
       │  └─ sidebar.css
       ├─ App.tsx
       └─ main.tsx
````
## Paleta Akaer
- Vinho: #6C2139
- Cinza escuro: #77777B
- Cinza claro: #EBE7E9
- Branco: #FFFFFF

## Variáveis CSS (global.css)
--cor-vinho, --cor-cinza-escuro, --cor-cinza-claro etc.

## Pendente
- Comentários nos arquivos
- React Router
- Context API (usuário logado)
- Páginas: Dashboard, Normativas, Notas, Usuarios