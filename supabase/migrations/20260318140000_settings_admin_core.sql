-- FASE 1 — ADMIN CORE: tabela global de configurações (cérebro do sistema)
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler (preços e features no site)
CREATE POLICY "Public can read settings"
  ON public.settings FOR SELECT TO public
  USING (true);

-- Apenas admins podem atualizar
CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Valores iniciais
INSERT INTO public.settings (key, value) VALUES
  ('pricing', '{
    "monthly": 29.90,
    "slug": 99.90,
    "ads": 10.00
  }'::jsonb),
  ('features', '{
    "auction_enabled": true,
    "ads_enabled": true
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER handle_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- FASE 4: coluna format em ads (banner | square)
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'banner';

COMMENT ON COLUMN public.ads.format IS 'banner (728x90) ou square (300x300)';
