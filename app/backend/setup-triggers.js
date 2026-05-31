const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/janosys_db';

const regex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
const match = databaseUrl.match(regex);

let user = 'root';
let password = 'password';
let host = 'localhost';
let port = 3306;
let database = 'janosys_db';

if (match) {
  user = decodeURIComponent(match[1]);
  password = decodeURIComponent(match[2]);
  host = match[3];
  port = Number(match[4]);
  database = match[5];
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const statements = [
  // 1. Drop old triggers if exist
  "DROP TRIGGER IF EXISTS tr_normas_insert",
  "DROP TRIGGER IF EXISTS tr_normas_update",
  "DROP TRIGGER IF EXISTS tr_normas_delete",

  // 2. Create tr_normas_insert
  `CREATE TRIGGER tr_normas_insert
   AFTER INSERT ON normas
   FOR EACH ROW
   BEGIN
       INSERT INTO historico_alteracoes (normaId, codigoNorma, tituloNorma, usuarioNome, tipoAlteracao, detalhes, data)
       VALUES (
           NEW.id,
           NEW.codigo,
           NEW.titulo,
           COALESCE(@usuario_atual, 'Sistema/Root'),
           'CADASTRO',
           CONCAT('Norma "', NEW.id, '" cadastrada com sucesso.'),
           NOW()
       );
   END`,

  // 3. Create tr_normas_update
  `CREATE TRIGGER tr_normas_update
   AFTER UPDATE ON normas
   FOR EACH ROW
   BEGIN
       DECLARE alteracoes_detalhes TEXT DEFAULT '';
       
       IF NOT (OLD.codigo <=> NEW.codigo) THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Código: de "', COALESCE(OLD.codigo, 'vazio'), '" para "', COALESCE(NEW.codigo, 'vazio'), '"; ');
       END IF;
       IF OLD.titulo <> NEW.titulo THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Título: de "', OLD.titulo, '" para "', NEW.titulo, '"; ');
       END IF;
       IF OLD.organizacao <> NEW.organizacao THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Organização: de "', OLD.organizacao, '" para "', NEW.organizacao, '"; ');
       END IF;
       IF OLD.categoria <> NEW.categoria THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Categoria: de "', OLD.categoria, '" para "', NEW.categoria, '"; ');
       END IF;
       IF NOT (OLD.subcategoria <=> NEW.subcategoria) THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Subcategoria: de "', COALESCE(OLD.subcategoria, 'vazio'), '" para "', COALESCE(NEW.subcategoria, 'vazio'), '"; ');
       END IF;
       IF NOT (OLD.item <=> NEW.item) THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Item: de "', COALESCE(OLD.item, 'vazio'), '" para "', COALESCE(NEW.item, 'vazio'), '"; ');
       END IF;
       IF OLD.tipo <> NEW.tipo THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Tipo: de "', OLD.tipo, '" para "', NEW.tipo, '"; ');
       END IF;
       IF NOT (OLD.revisao <=> NEW.revisao) THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Revisão: de "', COALESCE(OLD.revisao, 'vazio'), '" para "', COALESCE(NEW.revisao, 'vazio'), '"; ');
       END IF;
       IF OLD.status <> NEW.status THEN
           SET alteracoes_detalhes = CONCAT(alteracoes_detalhes, 'Status: de "', OLD.status, '" para "', NEW.status, '"; ');
       END IF;
       
       IF CHAR_LENGTH(alteracoes_detalhes) > 0 THEN
           SET alteracoes_detalhes = LEFT(alteracoes_detalhes, CHAR_LENGTH(alteracoes_detalhes) - 2);
           
           INSERT INTO historico_alteracoes (normaId, codigoNorma, tituloNorma, usuarioNome, tipoAlteracao, detalhes, data)
           VALUES (
               NEW.id,
               NEW.codigo,
               NEW.titulo,
               COALESCE(@usuario_atual, 'Sistema/Root'),
               'EDICAO',
               CONCAT('Norma "', NEW.id, '" editada. Alterações: ', alteracoes_detalhes, '.'),
               NOW()
           );
       END IF;
   END`,

  // 4. Create tr_normas_delete
  `CREATE TRIGGER tr_normas_delete
   BEFORE DELETE ON normas
   FOR EACH ROW
   BEGIN
       INSERT INTO historico_alteracoes (normaId, codigoNorma, tituloNorma, usuarioNome, tipoAlteracao, detalhes, data)
       VALUES (
           OLD.id,
           OLD.codigo,
           OLD.titulo,
           COALESCE(@usuario_atual, 'Sistema/Root'),
           'EXCLUSAO',
           CONCAT('Norma "', OLD.id, '" excluída do banco de dados.'),
           NOW()
       );
   END`
];

async function main() {
  console.log('Installing native database audit triggers...');
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      console.error('Error executing query:', sql);
      console.error(err);
      process.exit(1);
    }
  }
  console.log('Database triggers installed successfully!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
