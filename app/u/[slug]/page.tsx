import type { Metadata } from 'next';
import ProfilePage from '@/pages/ProfilePage';
import { supabase } from '@/integrations/supabase/client';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `https://jobinlink.com/u/${slug}`;

  // Se o slug estiver fora da janela pública, evitamos indexação via metadata.
  // O client Supabase está tipado a partir de `src/integrations/supabase/types.ts`.
  // Como o RPC `get_slug_public_status` foi criado recentemente, podemos não ter tipagem atual.
  // `as any` mantém a lógica e evita erro de build.
  const { data: status } = await supabase.rpc(
    'get_slug_public_status' as any,
    { p_slug: slug } as any
  );

  if (status !== 'published') {
    return {
      title: `${slug} | JobinLink`,
      description: `Perfil indisponível: ${slug}`,
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name,title,bio,photo_url')
    .eq('slug', slug)
    .maybeSingle();

  const name = profile?.name ?? slug;
  const roleTitle = profile?.title ?? 'Professional';
  const description =
    profile?.bio?.slice(0, 160) ??
    `Veja o perfil de ${name} no JobinLink.`;

  const ogImages = profile?.photo_url
    ? [{ url: profile.photo_url, alt: `${name} profile photo` }]
    : undefined;

  return {
    title: `${name} — ${roleTitle}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${name} — ${roleTitle}`,
      description,
      url: canonical,
      type: 'profile',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${roleTitle}`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProfileRoute({ params }: Props) {
  await params; // Next 15: params é Promise; em 14 retorna o próprio objeto
  return <ProfilePage prefix="u" />;
}
