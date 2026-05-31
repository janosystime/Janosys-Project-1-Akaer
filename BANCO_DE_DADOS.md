# Implementação do Banco de Dados Unificado

Este projeto agora conta com uma estrutura de Backend unificada para gerenciar todos os dados (Normas, Peças, Usuários e Solicitações), substituindo o uso fragmentado de `localStorage`.

## Tecnologias Utilizadas
- **Node.js** com **Express** (API REST)
- **Prisma ORM** (Modelagem e Acesso a Dados)
- **MySQL** (Banco de Dados Relacional)

## Estrutura do Backend
A pasta `backend/` contém:
- `prisma/schema.prisma`: Definição de todas as tabelas e relações.
- `src/controllers/`: Lógica de negócio para cada entidade.
- `src/routes/`: Definição dos endpoints da API.

## Como Iniciar o Banco de Dados

1. **Configuração de Ambiente:**
   - Vá para a pasta `backend/`.
   - Copie `.env.example` para `.env`.
   - Configure a URL de conexão com seu MySQL em `DATABASE_URL`.

2. **Instalação e Migração:**
   ```bash
   npm install
   npx prisma migrate dev --name init
   ```

3. **Execução:**
   ```bash
   npm run dev
   ```

## Próximos Passos (Frontend)
Os componentes em `frontend/src/pages/` (Normas.tsx, Usuarios.tsx, etc.) devem ser atualizados para utilizar o `fetch` ou `axios` chamando a URL `http://localhost:3001/normas`, por exemplo, em vez de ler do `localStorage`.
