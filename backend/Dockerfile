FROM node:22-slim

# openssl: requerido pelo Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
# valor dummy só para o generate carregar a config (generate não conecta no banco)
ENV DATABASE_URL="mysql://root:password@localhost:3306/janosys_db"
# gera o Prisma Client (não precisa de conexão com o banco)
RUN npx prisma generate

COPY . .

EXPOSE 3001
CMD ["sh", "docker-entrypoint.sh"]
