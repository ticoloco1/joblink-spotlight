-- Preços por tamanho (1–8+ letras) e taxa anual $7
INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('slug_price_4_chars', '130000', 'Preço slug 4 caracteres (centavos)', 'slugs'),
  ('slug_price_5_chars', '100000', 'Preço slug 5 caracteres (centavos)', 'slugs'),
  ('slug_price_6_chars', '60000', 'Preço slug 6 caracteres (centavos)', 'slugs'),
  ('slug_price_7_chars', '40000', 'Preço slug 7 caracteres (centavos)', 'slugs'),
  ('slug_price_8_plus', '599', 'Preço slug 8+ caracteres (centavos) = $5.99', 'slugs'),
  ('slug_renewal_annual', '700', 'Taxa anual por slug (centavos) = $7', 'slugs')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label;

-- Atualizar defaults de preços fortes (1–3 letras) para os novos valores
UPDATE public.platform_settings SET value = '100000' WHERE key = 'slug_price_1_char';
UPDATE public.platform_settings SET value = '200000' WHERE key = 'slug_price_2_chars';
UPDATE public.platform_settings SET value = '150000' WHERE key = 'slug_price_3_chars';
UPDATE public.platform_settings SET value = '599' WHERE key = 'slug_price_default';

-- Taxa anual em slugs: $7
ALTER TABLE public.slugs ALTER COLUMN renewal_price SET DEFAULT 7.00;
UPDATE public.slugs SET renewal_price = 7.00 WHERE renewal_price IS NOT NULL;
