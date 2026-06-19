#!/bin/sh
set -e

echo "[entrypoint] aguardando o banco e sincronizando o schema..."
until npx prisma db push; do
  echo "[entrypoint] banco indisponível, tentando de novo em 3s..."
  sleep 3
done

echo "[entrypoint] instalando triggers de auditoria..."
node setup-triggers.js

echo "[entrypoint] populando dados iniciais (idempotente)..."
node prisma/seed.js || echo "[entrypoint] seed pulado/falhou (seguindo)"

echo "[entrypoint] iniciando API..."
exec npx ts-node src/server.ts
