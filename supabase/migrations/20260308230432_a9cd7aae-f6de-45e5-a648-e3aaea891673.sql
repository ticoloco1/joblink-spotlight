
-- Ads table
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_user_id uuid NOT NULL,
  title text NOT NULL,
  placement text NOT NULL DEFAULT 'header',
  banner_url text,
  target_url text,
  pricing_type text NOT NULL DEFAULT 'daily',
  status text NOT NULL DEFAULT 'pending',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  stripe_subscription_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Advertisers can insert own ads" ON public.ads FOR INSERT TO authenticated WITH CHECK (advertiser_user_id = auth.uid());
CREATE POLICY "Advertisers can view own ads" ON public.ads FOR SELECT TO authenticated USING (advertiser_user_id = auth.uid());
CREATE POLICY "Advertisers can update own ads" ON public.ads FOR UPDATE TO authenticated USING (advertiser_user_id = auth.uid()) WITH CHECK (advertiser_user_id = auth.uid());
CREATE POLICY "Public can view approved active ads" ON public.ads FOR SELECT USING (status = 'approved');

-- Trigger for updated_at
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage bucket for ad banners
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-banners', 'ad-banners', true);

-- Storage RLS for ad-banners
CREATE POLICY "Authenticated users can upload ad banners" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ad-banners');
CREATE POLICY "Anyone can view ad banners" ON storage.objects FOR SELECT USING (bucket_id = 'ad-banners');
CREATE POLICY "Users can update own ad banners" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'ad-banners' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own ad banners" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ad-banners' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admin config table for storing admin emails
CREATE TABLE public.admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin_emails (using a security definer function)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails ae
    JOIN auth.users u ON u.email = ae.email
    WHERE u.id = _user_id
  )
$$;

CREATE POLICY "Admins can view admin emails" ON public.admin_emails FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Admin policies for ads table
CREATE POLICY "Admins can view all ads" ON public.ads FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update any ad" ON public.ads FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete any ad" ON public.ads FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Admin policies for profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- Enable realtime for ads
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;
