-- Evitar vazamento de profile_id via purchased_slugs: remove policy pública
DROP POLICY IF EXISTS "Public can check slug existence" ON public.purchased_slugs;

-- RPC público para checar status do slug sem expor dados (published / unpublished / not_found)
CREATE OR REPLACE FUNCTION public.get_slug_public_status(p_slug text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_published boolean;
BEGIN
  -- 1) slug principal do perfil
  SELECT is_published INTO v_published
  FROM public.profiles
  WHERE slug = p_slug
  LIMIT 1;

  IF FOUND THEN
    RETURN CASE WHEN v_published THEN 'published' ELSE 'unpublished' END;
  END IF;

  -- 2) slug comprado/apontando para um perfil
  SELECT profile_id INTO v_profile_id
  FROM public.purchased_slugs
  WHERE slug = p_slug AND is_active = true
  LIMIT 1;

  IF FOUND THEN
    SELECT is_published INTO v_published
    FROM public.profiles
    WHERE id = v_profile_id
    LIMIT 1;
    IF FOUND THEN
      RETURN CASE WHEN v_published THEN 'published' ELSE 'unpublished' END;
    END IF;
  END IF;

  RETURN 'not_found';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_slug_public_status(text) TO anon, authenticated;

