
-- Add credits to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits_cents integer NOT NULL DEFAULT 0;

-- Credit transactions log
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'purchase', 'boost', 'video_view', 'refund'
  amount_cents integer NOT NULL, -- positive = credit, negative = debit
  balance_after_cents integer NOT NULL DEFAULT 0,
  description text,
  related_profile_id uuid REFERENCES public.profiles(id),
  stripe_payment_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view own transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- System inserts via service role, users can't insert directly
CREATE POLICY "Admins can manage transactions" ON public.credit_transactions
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));
