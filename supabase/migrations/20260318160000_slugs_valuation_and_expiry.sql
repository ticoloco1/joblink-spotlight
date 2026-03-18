-- Tabela slugs: registro central para valorização, expiração e bulk
CREATE TABLE public.slugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  views integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  score numeric,
  suggested_price numeric,
  expires_at timestamptz,
  renewal_price numeric NOT NULL DEFAULT 5.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_slugs_owner ON public.slugs(owner_id);
CREATE INDEX idx_slugs_score ON public.slugs(score DESC NULLS LAST);
CREATE INDEX idx_slugs_expires ON public.slugs(expires_at) WHERE owner_id IS NOT NULL;
CREATE INDEX idx_slugs_suggested_price ON public.slugs(suggested_price DESC NULLS LAST);

ALTER TABLE public.slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read slugs"
  ON public.slugs FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage slugs"
  ON public.slugs FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Owners can update own slugs stats"
  ON public.slugs FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Função: calcular score (tráfego + tamanho + palavras premium)
CREATE OR REPLACE FUNCTION public.calculate_slug_score(
  p_views integer,
  p_clicks integer,
  p_slug text
) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  s numeric := 0;
  premium text[] := ARRAY['bank','crypto','ai','bet','job','pro','hub','link','vip','pay','money','cash','tech','dev','ceo'];
  w text;
BEGIN
  s := s + (p_views * 0.05);
  s := s + (p_clicks * 0.1);
  s := s + (greatest(0, 20 - length(p_slug)) * 5);
  FOREACH w IN ARRAY premium LOOP
    IF lower(p_slug) LIKE '%' || w || '%' THEN
      s := s + 100;
      EXIT;
    END IF;
  END LOOP;
  RETURN round(s::numeric, 2);
END;
$$;

-- Preço sugerido a partir do score
CREATE OR REPLACE FUNCTION public.slug_suggested_price(p_score numeric)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT greatest(10, round((p_score * 0.5)::numeric, 2));
$$;

-- Atualizar score e suggested_price de todos os slugs (cron diário)
CREATE OR REPLACE FUNCTION public.update_slug_valuation()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.slugs
  SET
    score = public.calculate_slug_score(views, clicks, slug),
    suggested_price = public.slug_suggested_price(public.calculate_slug_score(views, clicks, slug)),
    updated_at = now();
END;
$$;

-- Sincronizar slugs a partir de profiles (owner_id = dono do perfil)
INSERT INTO public.slugs (slug, owner_id, expires_at)
SELECT p.slug, p.user_id, now() + interval '1 year'
FROM public.profiles p
ON CONFLICT (slug) DO UPDATE SET owner_id = EXCLUDED.owner_id, updated_at = now();

-- Backfill: slugs com dono e sem expires_at recebem 1 ano
UPDATE public.slugs SET expires_at = now() + interval '1 year'
WHERE owner_id IS NOT NULL AND expires_at IS NULL;

CREATE TRIGGER handle_slugs_updated_at
  BEFORE UPDATE ON public.slugs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Taxa de renovação padrão em settings
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('slug_renewal_price', '500', 'Preço renovação slug/ano (centavos, ex: 500 = 5.00)', 'slugs')
ON CONFLICT (key) DO NOTHING;
