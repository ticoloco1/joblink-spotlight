-- Mensalidade do mini-site via créditos (USDC→créditos)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minisite_paid_until timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minisite_plan text NOT NULL DEFAULT 'none' CHECK (minisite_plan IN ('none','monthly','annual'));

COMMENT ON COLUMN public.profiles.minisite_paid_until IS 'Até quando a mensalidade/anuidade do mini-site está paga';
COMMENT ON COLUMN public.profiles.minisite_plan IS 'Plano ativo do mini-site (credits): none|monthly|annual';

-- Settings (em créditos = centavos)
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('minisite_monthly_credits', '999', 'Mensalidade mini-site (créditos) ex: 999 = $9.99', 'minisite'),
  ('minisite_annual_credits', '7999', 'Anuidade mini-site (créditos) ex: 7999 = $79.99', 'minisite')
ON CONFLICT (key) DO NOTHING;

-- Processar pagamento mensal/anual do mini-site (usuário autenticado)
CREATE OR REPLACE FUNCTION public.pay_minisite_with_credits(
  _plan text -- 'monthly'|'annual'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_profile_id uuid;
  v_balance integer;
  v_cost integer;
  v_paid_until timestamptz;
  v_now timestamptz := now();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _plan NOT IN ('monthly','annual') THEN
    RAISE EXCEPTION 'Invalid plan';
  END IF;

  SELECT id, credits, minisite_paid_until
  INTO v_profile_id, v_balance, v_paid_until
  FROM public.profiles
  WHERE user_id = v_user
  LIMIT 1
  FOR UPDATE;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  SELECT (value::integer) INTO v_cost
  FROM public.platform_settings
  WHERE key = CASE WHEN _plan = 'monthly' THEN 'minisite_monthly_credits' ELSE 'minisite_annual_credits' END
  LIMIT 1;

  IF v_cost IS NULL OR v_cost <= 0 THEN
    RAISE EXCEPTION 'Minisite pricing not configured';
  END IF;

  IF v_balance < v_cost THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'INSUFFICIENT_CREDITS', 'required', v_cost, 'available', v_balance);
  END IF;

  -- estende a partir do maior entre agora e paid_until atual
  IF v_paid_until IS NULL OR v_paid_until < v_now THEN
    v_paid_until := v_now;
  END IF;
  v_paid_until := v_paid_until + CASE WHEN _plan = 'monthly' THEN interval '30 days' ELSE interval '365 days' END;

  UPDATE public.profiles
  SET credits = credits - v_cost,
      minisite_paid_until = v_paid_until,
      minisite_plan = _plan,
      is_published = true,
      updated_at = now()
  WHERE id = v_profile_id;

  INSERT INTO public.credit_transactions (
    user_id, type,
    amount, balance_after,
    amount_cents, balance_after_cents,
    description, related_profile_id
  ) VALUES (
    v_user, 'minisite_subscription',
    -v_cost, v_balance - v_cost,
    -v_cost, v_balance - v_cost,
    CASE WHEN _plan = 'monthly' THEN 'Mensalidade mini-site' ELSE 'Anuidade mini-site' END,
    v_profile_id
  );

  RETURN jsonb_build_object('ok', true, 'paid_until', v_paid_until, 'balance_after', v_balance - v_cost);
END;
$$;

GRANT EXECUTE ON FUNCTION public.pay_minisite_with_credits(text) TO authenticated;

-- Cobrança automática: despublicar quando vencer (para cron)
CREATE OR REPLACE FUNCTION public.enforce_minisite_paid_until()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  UPDATE public.profiles
  SET is_published = false,
      minisite_plan = 'none',
      updated_at = now()
  WHERE is_published = true
    AND minisite_paid_until IS NOT NULL
    AND minisite_paid_until < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

