#!/usr/bin/env node
/**
 * Instalador do JobinLink
 * Roda: npm run setup  ou  node scripts/install.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const envExamplePath = path.join(root, '.env.example');

function log(msg, type = 'info') {
  const icons = { info: '📦', ok: '✅', warn: '⚠️', err: '❌' };
  console.log(`${icons[type] || '•'} ${msg}`);
}

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { stdio: options.silent ? 'pipe' : 'inherit', cwd: root, ...options });
  } catch (e) {
    if (!options.allowFail) throw e;
    return null;
  }
}

// 1. Node
const nodeVersion = process.version.slice(1).split('.').map(Number);
if (nodeVersion[0] < 18) {
  log('Requer Node.js 18+. Instale em https://nodejs.org', 'err');
  process.exit(1);
}
log(`Node ${process.version}`, 'ok');

// 2. Dependências
log('Instalando dependências (npm install)...');
run('npm install');
log('Dependências instaladas.', 'ok');

// 3. .env
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    log('.env criado a partir de .env.example. Edite .env com suas chaves do Supabase.', 'warn');
  } else {
    fs.writeFileSync(envPath, [
      'VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co',
      'VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon',
      'VITE_SUPABASE_PROJECT_ID=SEU_PROJECT_ID',
    ].join('\n') + '\n');
    log('.env criado. Edite com suas chaves do Supabase (Dashboard > Settings > API).', 'warn');
  }
} else {
  log('.env já existe.', 'ok');
}

console.log('');
log('Pronto! Próximos passos:', 'info');
console.log('  1. Edite o arquivo .env com a URL e a chave do seu projeto Supabase.');
console.log('  2. Suba as migrations no Supabase (SQL Editor ou Supabase CLI).');
console.log('  3. Inicie o app:  npm run dev');
console.log('');
log('Para iniciar agora:  npm run dev', 'ok');
