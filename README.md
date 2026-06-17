# Akaer / Signa

Refactor do projeto. Nesta etapa mantemos apenas o **frontend** (o que o cliente
aprovou) e preparamos a estrutura para entrega via Docker Compose.

## Arquitetura (alvo)

Três serviços, cada um com sua imagem:

| Serviço    | Pasta        | Imagem           | Estado            |
|------------|--------------|------------------|-------------------|
| `frontend` | `frontend/`  | React + Vite (nginx) | ✅ funcionando |
| `backend`  | `backend/`   | API (a definir)  | 🚧 stub (a refazer) |
| `db`       | `database/`  | MySQL 8.4        | ✅ pronto p/ schema |

```
/
├─ docker-compose.yml
├─ .env.example
├─ frontend/      # app que o cliente vê (UI)
├─ backend/       # API — stub, será reconstruída
└─ database/      # MySQL + scripts de init
```

> O frontend ainda aponta para `http://localhost:3001` (a API). Essas telas
> ficarão sem dados até o backend ser reconstruído.

## Rodar o frontend em desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

## Subir com Docker Compose

```bash
cp .env.example .env   # ajuste as senhas
docker compose up --build
```

- Frontend: http://localhost:8080
- MySQL: localhost:3306

O serviço `backend` está comentado no `docker-compose.yml` até a API ser
implementada (ver `backend/README.md`).
