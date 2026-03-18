
-- Table to track purchased slugs (additional slugs beyond the default profile slug)
CREATE TABLE public.purchased_slugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug text NOT NULL UNIQUE,
  price_cents integer NOT NULL DEFAULT 0,
  stripe_payment_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.purchased_slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchased slugs" ON public.purchased_slugs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own purchased slugs" ON public.purchased_slugs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all purchased slugs" ON public.purchased_slugs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can check slug existence" ON public.purchased_slugs
  FOR SELECT TO anon USING (true);
