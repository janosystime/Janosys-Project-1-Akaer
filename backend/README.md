# backend

Stub. A API será reconstruída nesta etapa do refactor (a modelagem do banco vai mudar).

Responsabilidade prevista: expor a API HTTP consumida pelo `frontend/` e falar com o
serviço `database` (MySQL). O frontend hoje aponta para `http://localhost:3001`.

Enquanto não houver código aqui, o serviço `backend` fica comentado no
`docker-compose.yml`. Ao implementar:

1. Adicionar o código da API e um `package.json`.
2. Descomentar o serviço `backend` no `docker-compose.yml`.
3. Conferir as variáveis de conexão no `.env` (ver `.env.example`).
