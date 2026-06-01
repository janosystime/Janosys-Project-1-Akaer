#!/bin/bash
set -e

# --- VERIFICAÇÃO DO .ENV ---
echo "🔍 Verificando arquivos de configuração..."

# Verifica se o arquivo .env NÃO existe dentro da pasta backend
if [ ! -f "backend/.env" ]; then
    echo "❌ ERRO: O arquivo .env não foi encontrado na pasta /backend!"
    echo "💡 Por favor, crie e configure o seu backend/.env antes de rodar o setup."
    echo "Saindo..."
    exit 1
fi

echo "✅ Arquivo .env encontrado!"
echo "--------------------------------------------------"
# Pergunta no terminal e espera o Enter (-s esconde o que o usuário digita, -r evita problemas com barras)
read -rs -p "❓ O seu .env está configurado com as credenciais corretas? Se sim, aperte [ENTER] para iniciar a instalação..."
echo -e "\n--------------------------------------------------"

# --- INÍCIO DA INSTALAÇÃO ---
echo "🚀 Iniciando a configuração do Backend..."
cd backend
npm install
npx prisma generate
npx prisma db push

echo "⚡ Executando Triggers..."
node setup-triggers.js & 
sleep 5 

echo "🌱 Executando Seed do Banco de Dados..."
node prisma/seed.js &
sleep 8 

echo "✨ Backend pronto! Configurando o Frontend..."
cd ../frontend
npm install

echo "🎉 Tudo pronto e configurado com sucesso!"
