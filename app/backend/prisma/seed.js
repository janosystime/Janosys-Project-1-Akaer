const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcrypt');
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

async function main() {
  console.log('Seeding initial users...');

  const count = await prisma.usuario.count();
  if (count > 0) {
    console.log('Database already has users. Skipping seed.');
    return;
  }

  const hash123 = await bcrypt.hash('123', 10);

  await prisma.usuario.createMany({
    data: [
      {
        nome: 'Administrador Janosys',
        login: 'admin',
        senha: hash123,
        perfil: 'ADMINISTRADOR',
        telefone: '(12) 99999-0001',
        departamento: 'TI',
      },
      {
        nome: 'Usuario Janosys',
        login: 'usuario',
        senha: hash123,
        perfil: 'USUARIO',
        telefone: '(12) 99999-0002',
        departamento: 'Engenharia',
      },
      {
        nome: 'Checker Janosys',
        login: 'checker',
        senha: hash123,
        perfil: 'CHECKER',
        telefone: '(12) 99999-0003',
        departamento: 'Operações',
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  });
