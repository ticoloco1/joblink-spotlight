#!/usr/bin/env bash
# Instalador JobinLink (macOS / Linux)
# Uso: ./install.sh   ou   bash install.sh

set -e
cd "$(dirname "$0")"

echo "📦 Instalador JobinLink"
echo ""

if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado. Instale em https://nodejs.org (v18+)"
  exit 1
fi

npm run setup

echo ""
echo "Para iniciar o app: npm run dev"
