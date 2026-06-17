# database

Imagem do banco **MySQL 8.4** do projeto.

- O **schema é gerenciado pelo backend** (Prisma): ao subir, o serviço `backend`
  roda `prisma db push`, instala os triggers de auditoria (`setup-triggers.js`) e
  popula dados iniciais (`seed.js`). Por isso não há DDL aqui no `init/`.
- `init/00-auth.sql` — ajusta o root remoto para `mysql_native_password` (o MySQL
  8.4 desativa esse plugin por padrão; o serviço sobe com `--mysql-native-password=ON`).
- Os dados persistem no volume `db_data` (ver `docker-compose.yml`).
- `reference/01-schema.sql` — **modelagem normalizada de referência** (não é
  executada). Documenta o modelo-alvo discutido em `ANALISE-MODELAGEM.md`.

> Para reinicializar do zero (re-rodar `init/` e recriar tabelas): `docker compose down -v`.
