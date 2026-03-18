-- Lista de domínios de mini-site que devem ter sitemap/rotas no formato
-- https://<dominio>/<slug> (ex: trustbank.xyz/usuario).
--
-- Formato recomendado: JSON array (string).
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  (
    'storefront_domains',
    '["trustbank.xyz","hashpo.com","mybik.com"]',
    'Domínios de mini-site (JSON array ou CSV)',
    'storefronts'
  )
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  category = EXCLUDED.category;

