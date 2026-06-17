# database

Imagem do banco **MySQL 8.4**.

- `init/*.sql` — scripts executados na primeira inicialização (volume vazio), em
  ordem alfabética. Coloque aqui o schema e seeds.
- Credenciais e nome do banco vêm das variáveis `MYSQL_*` definidas no
  `docker-compose.yml` / `.env` (ver `.env.example`).
- Os dados persistem no volume `db_data` declarado no `docker-compose.yml`.

> Para reexecutar os scripts de `init/`, é preciso remover o volume:
> `docker compose down -v`.
