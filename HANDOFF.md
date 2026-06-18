# HANDOFF — estado do projeto (continuar no PC do trabalho)

> Resumo da sessão para retomar o trabalho. Branch de entrega = **`dev-2`** (a main do refactor).
> Ao abrir o Claude Code no trabalho, é só pedir: "leia o HANDOFF.md" para ter o contexto.

## Situação atual (o que JÁ está pronto)

A integração **já está completa na `dev-2`** (local sincronizado com `origin/dev-2`). Ela contém:
- **Backend real** (Express + Prisma + MySQL): CRUD de normas/usuários/solicitações/histórico.
- **Versionamento** de normas (tabela `versoes_norma` + snapshot a cada criação/edição + endpoint `GET /normas/:id/versoes` + seção "Histórico de Versões" no modal).
- **Favoritos** (tabela + API `/favoritos` + estrela no card + filtro "só favoritos").
- **Tags** (`palavrasChave`) — busca já filtra por elas.
- **Marca d'água** na visualização de PDF (overlay com nome do usuário + "Leitura Protegida").
- **IA / RAG** (FastAPI em Python 3.11): `Chatbot.tsx` no frontend chamando `POST /api/chat`.
- **docker-compose com 4 serviços**: `db` (MySQL 8.4) + `backend` + `rag` + `frontend`.

## ÚNICO passo pendente para rodar tudo

1. Editar o arquivo **`.env`** na raiz e colocar o **`HF_TOKEN`** real (token Hugging Face,
   tipo "Read") no lugar de `hf_SEU_TOKEN_AQUI`. É segredo; o `.env` é gitignored.

## Como rodar (depois de pôr o token)

```bash
docker compose down              # derruba containers antigos (dados do banco ficam no volume)
docker compose up --build -d     # sobe os 4 serviços (1º build do RAG é pesado: PyTorch etc., alguns minutos)
```
- Frontend: http://localhost:8080  ·  Backend: http://localhost:3001  ·  RAG: http://localhost:8000/api/health
- Login (mock): `admin` / `123` (ou `checker` / `123`, `usuario` / `123`)

Validar:
```bash
docker compose ps                                  # todos Up / db e rag healthy
curl http://localhost:3001/normas                  # backend com dados
curl http://localhost:8000/api/health              # {"status":"ok"}
```

> Para a IA responder de verdade, o índice Chroma precisa existir (ingestão dos PDFs em
> `RAG/documentos/`). Conferir se o build/entrypoint do RAG já roda `ingest.py`; se não,
> rodar a ingestão uma vez. (Verificar no trabalho.)

## Fatos / credenciais (dev)

- Banco: `root` / `password` / `janosys_db` (fixo no `docker-compose.yml`).
- MySQL 8.4 sobe com `--mysql-native-password=ON` (+ `database/init/00-auth.sql`) por causa do adapter MariaDB do Prisma.
- Backend: `seed.js` e `setup-triggers.js` precisam encerrar o processo (já corrigido) senão o entrypoint trava.
- Python do RAG fixado em `python:3.11-slim` (estável).
- Auditoria/histórico é via triggers no banco (`SET @usuario_atual` + `tr_normas_*`).

## Mapa das branches

- **`dev-2`** = MAIN integrada (backend + features + IA). ✅ usar esta.
- `dev-bd-2` = só backend + features (sem IA). Superada.
- `dev-RAG-2` = só IA, versão antiga. Superada.

## Regra de git (importante)

- **Não fazer push / não criar contribuição do assistente.** Qualquer commit/push é o
  Pedro quem faz. O assistente só prepara arquivos e dá os comandos exatos.
- Reference: a integração na `dev-2` foi feita pela equipe (Vini/Vinicius/Pedro), sem co-autoria do assistente — manter assim.
