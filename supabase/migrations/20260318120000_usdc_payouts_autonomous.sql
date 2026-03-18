-- Payouts USDC autônomos: sistema continua pagando mesmo sem operador humano.
-- Cron chama a Edge Function payout-credits-to-usdc; ela envia USDC (Polygon) para wallet_address.

-- Tabela de payouts realizados (auditoria e idempotência)
CREATE TABLE IF NOT EXISTS public.usdc_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  to_address text NOT NULL,
  tx_hash text,
  network text NOT NULL DEFAULT 'polygon',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_usdc_payouts_user ON public.usdc_payouts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usdc_payouts_status ON public.usdc_payouts(status) WHERE status IN ('pending','failed');
CREATE INDEX IF NOT EXISTS idx_usdc_payouts_profile ON public.usdc_payouts(profile_id);

ALTER TABLE public.usdc_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts"
  ON public.usdc_payouts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role and admins manage payouts"
  ON public.usdc_payouts FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- Service role usa bypass RLS; a Edge Function usa service role.

-- Settings: mínimo em centavos para disparar payout; 500 = $5
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('payout_minimum_cents', '500', 'Mínimo em centavos (USD) para payout automático em USDC (ex: 500 = $5)', 'credits'),
  ('payout_enabled', 'true', 'Habilitar payouts automáticos USDC (true/false)', 'credits')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.usdc_payouts IS 'Payouts USDC enviados pela plataforma (Polygon). Sistema autônomo via cron.';

-- Dedução atômica de créditos para payout (evita race entre duas execuções do cron)
CREATE OR REPLACE FUNCTION public.reserve_credits_for_payout(p_profile_id uuid, p_amount_cents integer)
RETURNS TABLE(ok boolean, user_id uuid, reserved_cents integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_credits int;
BEGIN
  IF p_amount_cents IS NULL OR p_amount_cents <= 0 THEN
    RETURN QUERY SELECT false, NULL::uuid, 0;
    RETURN;
  END IF;
  SELECT profiles.user_id, profiles.credits INTO v_user_id, v_credits
  FROM public.profiles
  WHERE id = p_profile_id
  FOR UPDATE;
  IF v_user_id IS NULL OR v_credits IS NULL OR v_credits < p_amount_cents THEN
    RETURN QUERY SELECT false, v_user_id, 0;
    RETURN;
  END IF;
  UPDATE public.profiles
  SET credits = credits - p_amount_cents, updated_at = now()
  WHERE id = p_profile_id;
  RETURN QUERY SELECT true, v_user_id, p_amount_cents;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_credits_for_payout(uuid, integer) TO service_role;

-- Reembolso de créditos se o envio USDC falhar
CREATE OR REPLACE FUNCTION public.refund_credits_for_payout(p_profile_id uuid, p_amount_cents integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount_cents, updated_at = now()
  WHERE id = p_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refund_credits_for_payout(uuid, integer) TO service_role;
