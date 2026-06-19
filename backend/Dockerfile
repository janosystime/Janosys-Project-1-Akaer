FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL="mysql://root:password@localhost:3306/janosys_db"
RUN npx prisma generate

COPY . .

EXPOSE 3001
CMD ["sh", "docker-entrypoint.sh"]
