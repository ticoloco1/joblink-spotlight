-- Garantir que visitantes não logados (role anon) vejam o diretório:
-- permitir SELECT em profiles onde is_published = true.
-- (A política "Public can view published profiles" pode não aplicar ao anon em alguns setups.)

DROP POLICY IF EXISTS "Public can view published profiles" ON public.profiles;

CREATE POLICY "Public can view published profiles"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

COMMENT ON POLICY "Public can view published profiles" ON public.profiles IS 'Anon e authenticated podem listar perfis publicados (ex.: diretório).';
