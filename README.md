# Akaer / Signa

Sistema interno para gestão e consulta de normas aeronáuticas, com frontend,
backend, banco MySQL e microserviço RAG para o chatbot de consulta inteligente.

## Arquitetura (alvo)

Quatro serviços, cada um com sua imagem:

| Serviço    | Pasta        | Imagem           | Estado            |
|------------|--------------|------------------|-------------------|
| `frontend` | `frontend/`  | React + Vite (nginx) | ✅ funcionando |
| `backend`  | `backend/`   | API Node/Express + Prisma | ✅ funcionando |
| `rag`      | `RAG/`       | FastAPI + Chroma | ✅ integrado |
| `db`       | `database/`  | MySQL 8.4        | ✅ pronto p/ schema |

```
/
├─ docker-compose.yml
├─ .env.example
├─ frontend/      # app que o cliente vê (UI)
├─ backend/       # API principal
├─ RAG/           # microserviço do chatbot IA
└─ database/      # MySQL + scripts de init
```

No Docker, o Nginx do frontend encaminha:

- `/api` para o backend principal.
- `/rag-api` para o microserviço RAG.

## Rodar o frontend em desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

Para o chatbot funcionar em desenvolvimento, rode o RAG em outro terminal:

```bash
cd RAG
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn server:app --reload --port 8000
```

## Subir com Docker Compose

```bash
cp .env.example .env   # ajuste as senhas
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3001
- RAG: http://localhost:8000/api/health
- MySQL: localhost:3306

O chatbot usa `/rag-api` pelo frontend, então não precisa chamar o RAG direto
do navegador no uso padrão com Docker.
