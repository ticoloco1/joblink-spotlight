import { NextResponse } from 'next/server';

export async function GET() {
  const projectId = process.env.VITE_SUPABASE_PROJECT_ID;
  if (!projectId) {
    return new NextResponse('Missing VITE_SUPABASE_PROJECT_ID', { status: 500 });
  }

  // Proxy para a função Supabase gerar XML.
  // Agora o sitemap já é gerado fixo para `jobinlink.com`.
  const target = `https://${projectId}.supabase.co/functions/v1/sitemap`;

  const res = await fetch(target, { next: { revalidate: 3600 } });
  const xml = await res.text();

  const contentType = res.headers.get('content-type') ?? 'application/xml; charset=utf-8';
  const cacheControl = res.headers.get('cache-control') ?? 'public, max-age=3600';

  return new NextResponse(xml, {
    status: res.status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    },
  });
}

