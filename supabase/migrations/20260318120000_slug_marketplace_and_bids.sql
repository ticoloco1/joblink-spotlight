-- Slug Marketplace: usuários podem vender seus slugs (preço fixo ou leilão)
CREATE TABLE public.slug_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  price_cents integer NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'fixed' CHECK (type IN ('fixed', 'auction')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Apenas uma listagem ativa por slug
CREATE UNIQUE INDEX idx_slug_marketplace_slug_active ON public.slug_marketplace(slug) WHERE status = 'active';

ALTER TABLE public.slug_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active slug marketplace listings"
  ON public.slug_marketplace FOR SELECT TO public
  USING (status = 'active');

CREATE POLICY "Owners can manage their listings"
  ON public.slug_marketplace FOR ALL TO authenticated
  USING (auth.uid() = owner_id);

-- Bids para leilões de slugs
CREATE TABLE public.slug_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_marketplace_id uuid NOT NULL REFERENCES public.slug_marketplace(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bid_amount_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_slug_bids_marketplace ON public.slug_bids(slug_marketplace_id);
CREATE INDEX idx_slug_marketplace_status ON public.slug_marketplace(status);
CREATE INDEX idx_slug_marketplace_slug ON public.slug_marketplace(slug);

ALTER TABLE public.slug_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read bids for active listings"
  ON public.slug_bids FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.slug_marketplace m
      WHERE m.id = slug_marketplace_id AND m.status = 'active'
    )
  );

CREATE POLICY "Authenticated can place bids"
  ON public.slug_bids FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Comissão da plataforma na venda de slugs (ex: 10-30% tipo OpenSea)
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('slug_sale_commission_percent', '15', 'Comissão da plataforma na venda de slugs (%)', 'slugs')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER handle_slug_marketplace_updated_at
  BEFORE UPDATE ON public.slug_marketplace
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
