
-- Add boost columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS boost_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS homepage_until timestamp with time zone DEFAULT NULL;

-- Create boosts table to track boost purchases
CREATE TABLE public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booster_user_id uuid NOT NULL,
  amount_cents integer NOT NULL DEFAULT 150,
  platform_share_cents integer NOT NULL DEFAULT 60,
  profile_share_cents integer NOT NULL DEFAULT 90,
  stripe_payment_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;

-- Anyone can view boosts (public stats)
CREATE POLICY "Public can view boosts" ON public.boosts
  FOR SELECT USING (true);

-- Authenticated users can insert boosts
CREATE POLICY "Authenticated users can boost" ON public.boosts
  FOR INSERT TO authenticated
  WITH CHECK (booster_user_id = auth.uid());

-- Admins can manage boosts
CREATE POLICY "Admins can manage boosts" ON public.boosts
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));
