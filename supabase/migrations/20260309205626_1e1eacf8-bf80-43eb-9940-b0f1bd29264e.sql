
-- Posts/Feed table
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  image_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  pinned_until timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view non-expired posts" ON public.posts FOR SELECT TO public
  USING (expires_at > now() OR is_pinned = true);

CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all posts" ON public.posts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Broadcasts table
CREATE TABLE public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  sent_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read broadcasts" ON public.broadcasts FOR SELECT TO public
  USING (true);

CREATE POLICY "Admins can manage broadcasts" ON public.broadcasts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add avatar_frame to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_frame text;
