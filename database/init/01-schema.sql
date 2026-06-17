-- Schema inicial do banco (MySQL).
-- A modelagem definitiva será definida nesta etapa do refactor.
-- Os arquivos .sql desta pasta rodam, em ordem alfabética, apenas na
-- PRIMEIRA subida do container (volume de dados vazio).

-- O banco/usuário são criados pelas variáveis MYSQL_* do docker-compose.
-- Use este arquivo para criar as tabelas. Exemplo (placeholder):

-- CREATE TABLE IF NOT EXISTS exemplo (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

SELECT 'init/01-schema.sql executado' AS status;
