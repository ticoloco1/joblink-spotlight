-- Unificar ledger de créditos (1 crédito = 1 centavo USD)

-- 1) Garantir coluna credits (inteiro) em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 0;

-- 2) Compat: se existir credits_cents, migrar para credits (mantém o maior)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'credits_cents'
  ) THEN
    EXECUTE 'UPDATE public.profiles SET credits = GREATEST(credits, credits_cents)';
  END IF;
END $$;

-- 3) Compat: credit_transactions com nomes antigos e novos
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS amount integer;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS balance_after integer;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS amount_cents integer;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS balance_after_cents integer;

-- Backfill simples onde faltar (mantém consistência)
UPDATE public.credit_transactions
SET amount = COALESCE(amount, amount_cents),
    balance_after = COALESCE(balance_after, balance_after_cents),
    amount_cents = COALESCE(amount_cents, amount),
    balance_after_cents = COALESCE(balance_after_cents, balance_after)
WHERE amount IS NULL OR balance_after IS NULL OR amount_cents IS NULL OR balance_after_cents IS NULL;

-- 4) RPC: gastar créditos com segurança (para unlock CV/contato, slugs, boosts, ads, mensalidade)
CREATE OR REPLACE FUNCTION public.spend_credits(
  _user_id uuid,
  _amount_cents integer,
  _type text,
  _description text DEFAULT NULL,
  _related_profile_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _amount_cents <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT credits INTO v_balance
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_balance < _amount_cents THEN
    RETURN jsonb_build_object('ok', false, 'error_code', 'INSUFFICIENT_CREDITS', 'required', _amount_cents, 'available', v_balance);
  END IF;

  UPDATE public.profiles
  SET credits = credits - _amount_cents,
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.credit_transactions (
    user_id, type,
    amount, balance_after,
    amount_cents, balance_after_cents,
    description, related_profile_id
  ) VALUES (
    _user_id, _type,
    -_amount_cents, v_balance - _amount_cents,
    -_amount_cents, v_balance - _amount_cents,
    _description, _related_profile_id
  );

  RETURN jsonb_build_object('ok', true, 'balance_after', v_balance - _amount_cents);
END;
$$;

GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text, text, uuid) TO authenticated;

-- 5) Settings: taxa de conversão USDC -> créditos (centavos)
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('credits_per_usdc', '100', 'Créditos por 1 USDC (1 crédito = 1 centavo)', 'credits')
ON CONFLICT (key) DO NOTHING;

