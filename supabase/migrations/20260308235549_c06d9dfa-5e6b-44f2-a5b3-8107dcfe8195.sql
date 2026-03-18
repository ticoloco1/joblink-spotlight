-- Video unlock purchases with 1:1 credits and 60/40 split
CREATE TABLE IF NOT EXISTS public.video_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_user_id uuid NOT NULL,
  amount integer NOT NULL,
  profile_share integer NOT NULL,
  platform_share integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (profile_id, buyer_user_id)
);

ALTER TABLE public.video_unlocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'video_unlocks' AND policyname = 'Buyers can view own video unlocks'
  ) THEN
    CREATE POLICY "Buyers can view own video unlocks"
    ON public.video_unlocks
    FOR SELECT
    TO authenticated
    USING (buyer_user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'video_unlocks' AND policyname = 'Profile owners can view video unlocks'
  ) THEN
    CREATE POLICY "Profile owners can view video unlocks"
    ON public.video_unlocks
    FOR SELECT
    TO authenticated
    USING (
      profile_id IN (
        SELECT p.id
        FROM public.profiles p
        WHERE p.user_id = auth.uid()
      )
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.process_video_unlock(
  _buyer_user_id uuid,
  _profile_id uuid,
  _price integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  buyer_profile_id uuid;
  buyer_credits integer;
  seller_profile_id uuid;
  seller_user_id uuid;
  seller_credits integer;
  seller_share integer;
  platform_share integer;
  existing_unlock_id uuid;
BEGIN
  IF _price <= 0 THEN
    RAISE EXCEPTION 'Invalid price';
  END IF;

  SELECT id, credits
  INTO buyer_profile_id, buyer_credits
  FROM public.profiles
  WHERE user_id = _buyer_user_id
  LIMIT 1;

  IF buyer_profile_id IS NULL THEN
    RAISE EXCEPTION 'Buyer profile not found';
  END IF;

  SELECT id, user_id, credits
  INTO seller_profile_id, seller_user_id, seller_credits
  FROM public.profiles
  WHERE id = _profile_id
  LIMIT 1;

  IF seller_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF seller_user_id = _buyer_user_id THEN
    RETURN jsonb_build_object('already_unlocked', true, 'self_profile', true);
  END IF;

  SELECT id
  INTO existing_unlock_id
  FROM public.video_unlocks
  WHERE profile_id = _profile_id
    AND buyer_user_id = _buyer_user_id
  LIMIT 1;

  IF existing_unlock_id IS NOT NULL THEN
    RETURN jsonb_build_object('already_unlocked', true);
  END IF;

  IF buyer_credits < _price THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error_code', 'INSUFFICIENT_CREDITS',
      'required', _price,
      'available', buyer_credits
    );
  END IF;

  seller_share := FLOOR(_price * 0.60);
  platform_share := _price - seller_share;

  UPDATE public.profiles
  SET credits = credits - _price,
      updated_at = now()
  WHERE user_id = _buyer_user_id;

  UPDATE public.profiles
  SET credits = credits + seller_share,
      updated_at = now()
  WHERE id = seller_profile_id;

  INSERT INTO public.video_unlocks (
    profile_id,
    buyer_user_id,
    amount,
    profile_share,
    platform_share
  ) VALUES (
    _profile_id,
    _buyer_user_id,
    _price,
    seller_share,
    platform_share
  );

  INSERT INTO public.credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    amount_cents,
    balance_after_cents,
    description,
    related_profile_id
  )
  VALUES
  (
    _buyer_user_id,
    'video_unlock_purchase',
    -_price,
    buyer_credits - _price,
    -_price,
    buyer_credits - _price,
    'Unlock de vídeo',
    _profile_id
  ),
  (
    seller_user_id,
    'video_unlock_sale',
    seller_share,
    seller_credits + seller_share,
    seller_share,
    seller_credits + seller_share,
    'Receita de desbloqueio de vídeo (60%)',
    _profile_id
  );

  RETURN jsonb_build_object(
    'ok', true,
    'already_unlocked', false,
    'amount', _price,
    'profile_share', seller_share,
    'platform_share', platform_share,
    'buyer_balance_after', buyer_credits - _price,
    'seller_balance_after', seller_credits + seller_share
  );
END;
$$;