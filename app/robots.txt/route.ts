import { NextResponse } from 'next/server';

export async function GET() {
  const sitemapUrl = `https://jobinlink.com/sitemap.xml`;

  const body = [
    'User-agent: *',
    'Allow: /',
    // Bloqueia áreas do sistema que não são foco de SEO.
    'Disallow: /dashboard',
    'Disallow: /admin',
    'Disallow: /api/',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

