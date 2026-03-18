-- Selo azul (pessoas) e selo dourado (empresas) no Diretório
-- Configurável via Admin (platform_settings) com botão liga/desliga.

INSERT INTO public.platform_settings (key, value, label, category) VALUES
  ('directory_seals_enabled', 'true', 'Ativar selos no Diretório', 'directory'),
  ('directory_person_seal_min_boost', '1', 'Boost mínimo para selo azul (pessoas)', 'directory'),
  ('directory_company_seal_min_boost', '1', 'Boost mínimo para selo dourado (empresas)', 'directory')
ON CONFLICT (key) DO NOTHING;

