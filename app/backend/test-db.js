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
  connectionLimit: 1,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing query...');
  try {
    const solicitacoes = await prisma.solicitacao.findMany();
    console.log('Solicitacoes in DB:', solicitacoes.map(s => ({ id: s.id, status: s.status, avaliador: s.avaliador })));
  } catch (error) {
    console.error('Solicitacoes query error:', error);
  }
}

main();
