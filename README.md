# JobinLink

## Instalação rápida (instalador)

Requer **Node.js 18+**. Depois de clonar o repositório:

**Opção 1 – Um comando (recomendado)**

```sh
npm run setup
```

**Opção 2 – Scripts por sistema**

- **macOS / Linux:** `./install.sh` ou `bash install.sh`
- **Windows:** execute `install.bat` (duplo clique ou `install.bat` no terminal)

O instalador vai:

1. Verificar a versão do Node
2. Instalar dependências (`npm install`)
3. Criar o arquivo `.env` a partir de `.env.example` (se ainda não existir)

Depois, edite o `.env` com a **URL** e a **chave anon** do seu projeto Supabase (Dashboard → Settings → API) e inicie o app:

```sh
npm run dev
```

---

## Blockchain (USDC → créditos)

O projeto suporta **on-ramp via Polygon USDC** para virar créditos internos.

- **Conversão padrão**: `1 USDC = 100 créditos` (1 crédito = 1 centavo). Ajustável no Admin → **Créditos** (`credits_per_usdc`).
- **Como creditar**: no Dashboard, cole o **Tx Hash** de uma transferência USDC para a **carteira da plataforma**.

### Variáveis de ambiente (Supabase Functions)

Configure no Supabase (Edge Functions → Secrets):

- `POLYGON_RPC_URL`: RPC HTTP da Polygon
- `USDC_CONTRACT`: contrato do token (ERC-20) na Polygon  
  Ex.: `0x578ac1c44E41f3ecfBaf3bEb86363FD3dd857011`
- `PLATFORM_WALLET`: carteira da plataforma que recebe os depósitos  
  Ex.: `0xf841d9F5ba7eac3802e9A476a85775e23d084BBe`

> Importante: confirme que `USDC_CONTRACT` é realmente o contrato do token que você quer aceitar (USDC). O crédito só é gerado quando a function detecta `Transfer` para `PLATFORM_WALLET`.

---

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
