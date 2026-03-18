-- Paywall opcional por mini-site (OnlyFans style) + regras de publicação por assinatura

-- Campos no perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paywall_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paywall_mode text NOT NULL DEFAULT 'none' CHECK (paywall_mode IN ('none','videos','full'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paywall_interval text NOT NULL DEFAULT 'monthly' CHECK (paywall_interval IN ('monthly','daily'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paywall_price_cents integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.paywall_enabled IS 'Liga/desliga paywall do mini-site';
COMMENT ON COLUMN public.profiles.paywall_mode IS 'none | videos | full (OnlyFans style)';
COMMENT ON COLUMN public.profiles.paywall_interval IS 'monthly | daily';
COMMENT ON COLUMN public.profiles.paywall_price_cents IS 'Preço do paywall em centavos (USD)';

-- Acessos ao paywall por perfil (assinatura/pagamento do visitante)
CREATE TABLE IF NOT EXISTS public.profile_paywall_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interval text NOT NULL CHECK (interval IN ('monthly','daily')),
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  expires_at timestamptz NOT NULL,
  stripe_checkout_session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, subscriber_id, interval, expires_at)
);

CREATE INDEX IF NOT EXISTS idx_profile_paywall_access_subscriber ON public.profile_paywall_access(subscriber_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_paywall_access_profile ON public.profile_paywall_access(profile_id, expires_at DESC);

ALTER TABLE public.profile_paywall_access ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver seus próprios acessos ativos/expirados
CREATE POLICY IF NOT EXISTS "Subscribers can view own paywall access"
  ON public.profile_paywall_access FOR SELECT TO authenticated
  USING (subscriber_id = auth.uid());

-- Dono do perfil pode ver quem assinou/pagou
CREATE POLICY IF NOT EXISTS "Profile owners can view paywall access"
  ON public.profile_paywall_access FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Admins podem gerenciar
CREATE POLICY IF NOT EXISTS "Admins can manage paywall access"
  ON public.profile_paywall_access FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Settings para billing/paywall (editáveis no Admin)
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('minisite_monthly_price_id', '', 'Stripe price_id do mini-site mensal (obrigatório para publicar)', 'minisite'),
  ('minisite_annual_price_id', '', 'Stripe price_id do mini-site anual (desconto)', 'minisite'),
  ('paywall_platform_fee_percent', '20', 'Comissão da plataforma no paywall (%)', 'paywall'),
  ('paywall_default_monthly_cents', '999', 'Preço padrão paywall mensal (centavos)', 'paywall'),
  ('paywall_default_daily_cents', '199', 'Preço padrão paywall diário (centavos)', 'paywall')
ON CONFLICT (key) DO NOTHING;

