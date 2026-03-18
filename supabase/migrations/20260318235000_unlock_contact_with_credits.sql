-- Desbloqueio de contato/CV via créditos (em vez de Stripe)
-- Preço e taxa vêm de platform_settings; comprador gasta créditos; dono do perfil recebe sua parte.

INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('contact_unlock_platform_fee_percent', '50', 'Percentual da plataforma no desbloqueio de contato (0-100)', 'contacts')
ON CONFLICT (key) DO NOTHING;

-- Garantir que contact_unlock_price exista (centavos = créditos)
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('contact_unlock_price', '500', 'Preço desbloqueio contato (créditos = centavos)', 'contacts')
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label;

CREATE OR REPLACE FUNCTION public.unlock_contact_with_credits(p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id uuid;
  v_owner_id uuid;
  v_price_cents int;
  v_fee_percent int;
  v_platform_share int;
  v_profile_share int;
  v_spend_result jsonb;
  v_seller_balance int;
BEGIN
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  -- Preço em créditos (centavos)
  SELECT COALESCE((SELECT (value)::int FROM public.platform_settings WHERE key = 'contact_unlock_price' LIMIT 1), 500) INTO v_price_cents;
  SELECT COALESCE((SELECT (value)::int FROM public.platform_settings WHERE key = 'contact_unlock_platform_fee_percent' LIMIT 1), 50) INTO v_fee_percent;
  v_fee_percent := GREATEST(0, LEAST(100, v_fee_percent));
  v_platform_share := (v_price_cents * v_fee_percent) / 100;
  v_profile_share := v_price_cents - v_platform_share;

  -- Dono do perfil
  SELECT user_id INTO v_owner_id FROM public.profiles WHERE id = p_profile_id LIMIT 1;
  IF v_owner_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Profile not found');
  END IF;
  IF v_owner_id = v_buyer_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Cannot unlock own profile', 'already_unlocked', true);
  END IF;

  -- Já desbloqueado?
  IF EXISTS (SELECT 1 FROM public.contact_unlocks WHERE company_user_id = v_buyer_id AND profile_id = p_profile_id) THEN
    RETURN jsonb_build_object('ok', true, 'already_unlocked', true);
  END IF;

  -- Debitar créditos do comprador
  v_spend_result := public.spend_credits(v_buyer_id, v_price_cents, 'contact_unlock', 'Unlock contact/CV', p_profile_id);
  IF (v_spend_result->>'ok')::boolean IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error_code', COALESCE(v_spend_result->>'error_code', 'SPEND_FAILED'),
      'required', v_price_cents,
      'available', (v_spend_result->>'available')::int
    );
  END IF;

  -- Creditar parte do dono do perfil
  UPDATE public.profiles
  SET credits = credits + v_profile_share, updated_at = now()
  WHERE user_id = v_owner_id;

  SELECT credits INTO v_seller_balance FROM public.profiles WHERE user_id = v_owner_id LIMIT 1;

  INSERT INTO public.credit_transactions (
    user_id, type, amount, balance_after, amount_cents, balance_after_cents, description, related_profile_id
  ) VALUES (
    v_owner_id, 'contact_unlock_sale', v_profile_share, v_seller_balance, v_profile_share, v_seller_balance,
    'Venda de desbloqueio de contato', p_profile_id
  );

  -- Registrar o unlock (stripe_payment_id = 'credits' para identificar pagamento por créditos)
  INSERT INTO public.contact_unlocks (
    company_user_id, profile_id, amount_cents, platform_share_cents, profile_share_cents, stripe_payment_id
  ) VALUES (
    v_buyer_id, p_profile_id, v_price_cents, v_platform_share, v_profile_share, 'credits'
  );

  RETURN jsonb_build_object('ok', true, 'unlocked', true, 'already_unlocked', false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_contact_with_credits(uuid) TO authenticated;
