
-- Platform settings (key-value store for all configurable prices/settings)
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  label text,
  category text NOT NULL DEFAULT 'general',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for pricing display)
CREATE POLICY "Public can read settings"
  ON public.platform_settings FOR SELECT
  TO public
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Premium/reserved slugs
CREATE TABLE public.premium_slugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  is_reserved boolean NOT NULL DEFAULT true,
  category text DEFAULT 'keyword',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read premium slugs"
  ON public.premium_slugs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage premium slugs"
  ON public.premium_slugs FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('slug_price_1_char', '50000', 'Preço slug 1 caractere (centavos)', 'slugs'),
  ('slug_price_2_chars', '20000', 'Preço slug 2 caracteres (centavos)', 'slugs'),
  ('slug_price_3_chars', '5000', 'Preço slug 3 caracteres (centavos)', 'slugs'),
  ('slug_price_default', '0', 'Preço slug padrão (centavos)', 'slugs'),
  ('video_paywall_price', '599', 'Preço paywall vídeo anual (centavos)', 'videos'),
  ('video_unlock_price', '500', 'Preço desbloqueio vídeo (créditos)', 'videos'),
  ('video_seller_commission', '60', 'Comissão vendedor vídeo (%)', 'videos'),
  ('ad_price_header_daily', '500', 'Preço anúncio header diário (centavos)', 'ads'),
  ('ad_price_sidebar_daily', '300', 'Preço anúncio sidebar diário (centavos)', 'ads'),
  ('boost_price', '150', 'Preço boost (créditos)', 'boosts'),
  ('contact_unlock_price', '500', 'Preço desbloqueio contato (centavos)', 'contacts'),
  ('platform_commission', '40', 'Comissão plataforma (%)', 'general'),
  ('site_name', 'JobinLink', 'Nome do site', 'general'),
  ('site_description', 'Plataforma de mini-sites profissionais', 'Descrição do site', 'general');

-- Trigger for updated_at
CREATE TRIGGER handle_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_premium_slugs_updated_at
  BEFORE UPDATE ON public.premium_slugs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
