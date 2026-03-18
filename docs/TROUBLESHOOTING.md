# Troubleshooting

## Perfil abre em um navegador e no outro mostra "não encontrado"

Isso é esperado por causa das **regras de segurança (RLS)** no Supabase:

- **Anônimos** (quem não está logado) só conseguem ver perfis com **`is_published = true`**.
- **Dono do perfil** (logado com a conta dona do mini-site) sempre vê o próprio perfil.

Se em um navegador você está **logado como dono** do perfil e no outro **não está** (ou está em outra conta), no primeiro o perfil aparece e no segundo pode aparecer "não encontrado" ou "mini-site ainda não foi publicado".

**O que fazer:** para o perfil ser **público** para todos, é preciso que ele esteja **publicado**:

1. Entrar no **Dashboard** com a conta dona do perfil.
2. Garantir que o mini-site está **publicado** (e que a mensalidade/anuidade está paga, se for o caso).
3. No banco, o perfil deve ter **`is_published = true`** (isso é controlado pela sua lógica de publicação no dashboard).

Assim, qualquer navegador (logado ou não) verá o perfil.

---

## Ao sair de algumas páginas, o site “para” e não volta

Isso costumava ocorrer quando **faltavam rotas no App Router do Next.js**. Links do menu (Marketplace, Jobs, Admin, etc.) levavam a URLs sem página (404).

Com as rotas adicionadas em `app/` (marketplace, jobs, templates, how-it-works, videos, admin, advertise, slugs, marketplace/slug/[slug]) e o uso de `next/navigation` em vez de `react-router` nesses fluxos, a navegação entre essas páginas deve funcionar.

Se ainda acontecer:

- Abra o **Console** do navegador (F12) e veja se há erros em vermelho.
- Confirme que o **deploy** inclui as novas páginas em `app/`.
