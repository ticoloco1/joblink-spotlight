-- Adiciona campo para endereço de carteira Polygon nos perfis
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Tabela de pagamentos blockchain para auditoria
CREATE TABLE IF NOT EXISTS public.blockchain_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  token TEXT NOT NULL DEFAULT 'USDC',
  amount_raw TEXT NOT NULL,
  amount_usd NUMERIC(12,4) NOT NULL,
  credits_added INTEGER NOT NULL DEFAULT 0,
  network TEXT NOT NULL DEFAULT 'polygon',
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all blockchain payments"
  ON public.blockchain_payments
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own blockchain payments"
  ON public.blockchain_payments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_blockchain_payments_wallet ON public.blockchain_payments(to_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_payments_tx ON public.blockchain_payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles(wallet_address) WHERE wallet_address IS NOT NULL;