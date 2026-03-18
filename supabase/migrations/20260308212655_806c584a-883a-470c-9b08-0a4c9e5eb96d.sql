
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  title TEXT,
  location TEXT,
  photo_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  contact_email TEXT,
  contact_phone TEXT,
  contact_linkedin TEXT,
  user_type TEXT NOT NULL DEFAULT 'seeker' CHECK (user_type IN ('seeker', 'company')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published profiles
CREATE POLICY "Public can view published profiles"
  ON public.profiles FOR SELECT
  USING (is_published = true);

-- Users can manage their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('seeker', 'company')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Contact unlocks table (when company pays to see contact)
CREATE TABLE public.contact_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_cents INTEGER NOT NULL,
  platform_share_cents INTEGER NOT NULL,
  profile_share_cents INTEGER NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_user_id, profile_id)
);

ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view own unlocks"
  ON public.contact_unlocks FOR SELECT
  TO authenticated
  USING (company_user_id = auth.uid());

CREATE POLICY "Companies can insert unlocks"
  ON public.contact_unlocks FOR INSERT
  TO authenticated
  WITH CHECK (company_user_id = auth.uid());

-- Profile owners can see who unlocked their contact
CREATE POLICY "Profile owners can see unlocks"
  ON public.contact_unlocks FOR SELECT
  TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
