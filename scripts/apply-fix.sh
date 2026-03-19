#!/bin/bash

# Script para renomear src/pages -> src/views
# Evita conflito com Next.js Pages Router

set -e

echo "Iniciando correção..."

# 1. Criar pasta src/views se não existir
mkdir -p src/views

# 2. Copiar arquivos de src/pages para src/views
echo "Copiando arquivos..."
cp -r src/pages/* src/views/

# 3. Remover _app.tsx (arquivo morto do Vite)
if [ -f "src/views/_app.tsx" ]; then
  rm src/views/_app.tsx
  echo "Removido src/views/_app.tsx"
fi

# 4. Deletar src/pages
rm -rf src/pages
echo "Removido src/pages/"

# 5. Atualizar imports em app/
echo "Atualizando imports..."
find app -name "*.tsx" -type f -exec sed -i '' 's|@/pages/|@/views/|g' {} \; 2>/dev/null || \
find app -name "*.tsx" -type f -exec sed -i 's|@/pages/|@/views/|g' {} \;

echo "Correção aplicada com sucesso!"
echo ""
echo "Agora execute:"
echo "  git add -A"
echo "  git commit -m 'fix: renomear src/pages -> src/views para evitar conflito com Next.js Pages Router'"
echo "  git push"
