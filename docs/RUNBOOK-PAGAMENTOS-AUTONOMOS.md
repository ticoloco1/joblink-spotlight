# Sistema de pagamentos à prova de falha

Este documento descreve como os **payouts em USDC** funcionam de forma **autônoma**: os usuários (criadores que ganham com paywall e desbloqueio de CV) continuam sendo pagos **mesmo que o operador do site não esteja disponível** (incluindo falecimento). Ninguém precisa “dar um clique” para liberar o pagamento.

---

## O que o sistema faz

1. **Créditos internos**  
   Quando alguém paga por desbloqueio de contato/CV ou usa o paywall, o criador recebe **créditos** na conta (já implementado).

2. **Resgate automático em USDC (Polygon)**  
   Uma **Edge Function** (`payout-credits-to-usdc`) roda em **agendamento (cron)**. Ela:
   - Encontra perfis com saldo de créditos ≥ mínimo configurado e com **wallet Polygon** cadastrada.
   - Deduz os créditos e envia **USDC** da carteira da plataforma para a carteira do usuário.
   - Registra cada payout na tabela `usdc_payouts` (auditoria).
   - Se o envio on-chain falhar (rede, saldo, etc.), os créditos são **devolvidos** automaticamente.

3. **Nenhuma ação humana é necessária**  
   Enquanto o **cron** continuar chamando a função e a **carteira da plataforma** tiver USDC (e um pouco de MATIC para gas), os pagamentos seguem acontecendo.

---

## O que você precisa configurar

### 1. Variáveis no Supabase (Edge Functions)

No projeto Supabase → **Settings → Edge Functions → Secrets** (ou via CLI), configure:

| Variável | Descrição |
|----------|-----------|
| `CRON_SECRET` | Senha forte e única. Quem chama o cron usa no header `Authorization: Bearer <CRON_SECRET>`. |
| `PLATFORM_PRIVATE_KEY` | Chave privada da carteira **que envia USDC** (Polygon). Essa carteira deve ter USDC e MATIC para gas. |
| `POLYGON_RPC_URL` | RPC HTTP da Polygon (ex.: Alchemy, Infura, público). |
| `USDC_CONTRACT` | Endereço do contrato USDC na Polygon (ex.: `0x3c499c542cef5e3811e1192ce70d8cc03d5c3359`). |

A carteira cuja chave está em `PLATFORM_PRIVATE_KEY` pode ser a mesma que recebe depósitos (`PLATFORM_WALLET` / `POLYGON_RECEIVING_WALLET`): ela **recebe** USDC dos usuários (topup) e **envia** USDC nos payouts.

### 2. Configurações no Admin do site (platform_settings)

- **`payout_enabled`**: `true` para ativar payouts automáticos.
- **`payout_minimum_cents`**: Mínimo em centavos (ex.: `500` = US$ 5,00) para incluir um perfil no lote de payout.

### 3. Agendar o cron (obrigatório)

A função **só executa** quando alguém chama a URL com o segredo. Você precisa agendar essa chamada **todo dia** (ou no intervalo que quiser).

**URL:**  
`https://<PROJECT_REF>.supabase.co/functions/v1/payout-credits-to-usdc`

**Método:** `POST` (ou `GET`; a função só exige o header de autorização)

**Header:**  
`Authorization: Bearer <CRON_SECRET>`

Exemplos de onde agendar:

- **[cron-job.org](https://cron-job.org)** (grátis): criar um job diário que faz HTTP POST para essa URL com o header acima.
- **Vercel Cron**: se o app estiver na Vercel, pode criar um endpoint que chama essa URL (e proteger com o mesmo `CRON_SECRET` ou outro segredo).
- **Outro provedor** (EasyCron, GitHub Actions, etc.): desde que chame a URL com `Authorization: Bearer <CRON_SECRET>` no horário desejado.

Se **ninguém** chamar essa URL, os payouts **não** rodam (os créditos ficam na conta até o próximo run).

---

## Se algo acontecer com o operador do site

Para o sistema continuar pagando **sem depender de você**:

1. **Cron continua rodando**  
   O agendamento (cron-job.org, Vercel, etc.) não depende de você estar vivo ou acessar o painel. Desde que a conta do serviço de cron não seja desativada, as chamadas continuam.

2. **Carteira da plataforma com saldo**  
   A carteira cuja chave está em `PLATFORM_PRIVATE_KEY` precisa ter:
   - **USDC** suficiente para cobrir os payouts.
   - **MATIC** para pagar gas na Polygon.

   Se você usa a mesma carteira para **receber** depósitos e **pagar** criadores, o fluxo de entrada de USDC (depósitos dos usuários) pode continuar abastecendo a carteira, desde que o site e o Supabase continuem no ar.

3. **Sucessor / família**  
   Vale deixar em lugar seguro (cofre, advogado, sócio):
   - Este runbook (ou o link para ele).
   - Onde está o projeto (Supabase, Vercel, repositório).
   - Que **não é necessário** nenhum login no site para os payouts acontecerem; o que importa é o **cron** e a **carteira com USDC + MATIC**.
   - Se quiserem **parar** os payouts: desativar o cron ou colocar `payout_enabled` = `false` no Admin.

4. **Auditoria**  
   Toda saída em USDC fica registrada na tabela `usdc_payouts` (e no histórico de `credit_transactions`), então um contador ou sucessor pode conferir o que foi pago e quando.

---

## Resumo

- **Stripe não paga USDC sozinho.** Quem envia USDC na Polygon é a **plataforma**, via Edge Function, usando a carteira configurada em `PLATFORM_PRIVATE_KEY`.
- O sistema atual continua usando **créditos** na aplicação; no momento do **resgate**, a função paga em **USDC** para a **wallet** que o usuário cadastrou (Polygon).
- Para ficar **à prova de falha** (incluindo falecimento do operador): configure **cron**, **CRON_SECRET**, **PLATFORM_PRIVATE_KEY**, **USDC_CONTRACT** e **POLYGON_RPC_URL**, mantenha a carteira com USDC e MATIC, e deixe este runbook (e, se possível, um sucessor) ciente de onde tudo está.
