import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/janosys_db';

// Parse DATABASE_URL: mysql://user:password@host:port/database
const regex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
const match = databaseUrl.match(regex);

let user = 'root';
let password = 'password';
let host = 'localhost';
let port = 3306;
let database = 'janosys_db';

if (match) {
  user = decodeURIComponent(match[1]!);
  password = decodeURIComponent(match[2]!);
  host = match[3]!;
  port = Number(match[4]!);
  database = match[5]!;
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 10,
}, {
  useTextProtocol: true
});

const prisma = new PrismaClient({ adapter });

export { prisma };
