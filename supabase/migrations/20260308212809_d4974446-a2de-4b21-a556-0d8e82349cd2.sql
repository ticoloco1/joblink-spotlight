
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_slug TEXT;
BEGIN
  user_slug := lower(replace(coalesce(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), ' ', '-'));
  -- Ensure unique slug
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = user_slug) LOOP
    user_slug := user_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  END LOOP;
  
  INSERT INTO public.profiles (user_id, slug, name, user_type)
  VALUES (
    NEW.id,
    user_slug,
    coalesce(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    coalesce(NEW.raw_user_meta_data->>'user_type', 'seeker')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
