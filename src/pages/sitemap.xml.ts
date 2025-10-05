import type { APIRoute } from 'astro';

interface URLEntry {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const GET: APIRoute = async () => {
  const base = import.meta.env.SITE || '';
  const now = new Date().toISOString();
  
  // Define URL entries with different priorities and frequencies
  const urls: URLEntry[] = [
    { loc: '/', lastmod: now, changefreq: 'hourly', priority: 1.0 },
    { loc: '/about', lastmod: now, changefreq: 'monthly', priority: 0.8 },
    { loc: '/contact', lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { loc: '/privacy', lastmod: now, changefreq: 'yearly', priority: 0.3 },
    { loc: '/terms', lastmod: now, changefreq: 'yearly', priority: 0.3 },
    { loc: '/auth', lastmod: now, changefreq: 'monthly', priority: 0.6 },
    { loc: '/feedback', lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { loc: '/blobs', lastmod: now, changefreq: 'daily', priority: 0.7 },
    { loc: '/image-cdn', lastmod: now, changefreq: 'monthly', priority: 0.6 },
    { loc: '/revalidation', lastmod: now, changefreq: 'monthly', priority: 0.5 },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map(
    (entry) => `  <url>
    <loc>${base}${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  
  return new Response(body, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    } 
  });
};


