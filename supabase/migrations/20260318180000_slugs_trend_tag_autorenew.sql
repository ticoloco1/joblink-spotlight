-- Gatilhos mentais: trend_score, tag e auto_renew
ALTER TABLE public.slugs ADD COLUMN IF NOT EXISTS trend_score numeric;
ALTER TABLE public.slugs ADD COLUMN IF NOT EXISTS tag text;
ALTER TABLE public.slugs ADD COLUMN IF NOT EXISTS auto_renew boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.slugs.tag IS '🔥 Trending, 💎 Raro, 🚀 Potencial alto, etc.';
COMMENT ON COLUMN public.slugs.auto_renew IS 'Renovar automaticamente (R$ 5/ano)';

-- Atualizar tag na função de valuation (opcional: pode ser no app)
CREATE OR REPLACE FUNCTION public.slug_tag_from_stats(
  p_views integer,
  p_slug text,
  p_score numeric
) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF p_views > 1000 THEN RETURN '🔥 Tendência'; END IF;
  IF length(p_slug) <= 4 THEN RETURN '💎 Raro'; END IF;
  IF p_score > 200 THEN RETURN '🚀 Potencial alto'; END IF;
  IF p_score > 100 THEN RETURN '🧠 Inteligente'; END IF;
  IF p_score > 50 AND p_score <= 100 THEN RETURN '💰 Subvalorizado'; END IF;
  RETURN NULL;
END;
$$;

-- Incluir tag e trend_score no update_slug_valuation
CREATE OR REPLACE FUNCTION public.update_slug_valuation()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.slugs
  SET
    score = public.calculate_slug_score(views, clicks, slug),
    updated_at = now();
  UPDATE public.slugs
  SET
    suggested_price = public.slug_suggested_price(score),
    tag = public.slug_tag_from_stats(views, slug, score),
    trend_score = round((score * 0.15)::numeric, 2)
  WHERE score IS NOT NULL;
END;
$$;
