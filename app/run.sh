#!/bin/bash

# Função para fechar todos os processos filhos quando você der Ctrl+C
cleanup() {
    echo -e "\n🛑 Desligando os servidores..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Garante que a função cleanup seja chamada ao interromper o script
trap cleanup SIGINT SIGTERM

echo "🚀 Iniciando os servidores em paralelo..."

# Inicia o backend em segundo plano e joga um prefixo [BACK] nos logs
(cd backend && npm run dev) 2>&1 | sed 's/^/[BACK] /' &

# Inicia o frontend em segundo plano e joga um prefixo [FRONT] nos logs
(cd frontend && npm run dev) 2>&1 | sed 's/^/[FRONT] /' &

# Mantém o script vivo esperando os processos terminarem
wait