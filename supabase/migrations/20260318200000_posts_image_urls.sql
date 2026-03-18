-- Até 4 fotos por post: array de URLs (mantém image_url para compatibilidade)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]';

COMMENT ON COLUMN public.posts.image_urls IS 'Array de até 4 URLs de imagens do post';
