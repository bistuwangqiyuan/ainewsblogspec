import type { APIRoute } from 'astro';
import { fetchArticles } from '../utils/supabaseClient';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || 'https://ainewsblogspec.netlify.app';
  
  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: 'about', priority: '0.8', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: 'contact', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: 'privacy', priority: '0.5', changefreq: 'yearly', lastmod: new Date().toISOString() },
    { url: 'terms', priority: '0.5', changefreq: 'yearly', lastmod: new Date().toISOString() },
    { url: 'feedback', priority: '0.6', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: 'image-cdn', priority: '0.4', changefreq: 'monthly', lastmod: new Date().toISOString() },
  ];

  // Fetch recent articles for dynamic URLs (skip if Supabase not configured)
  let dynamicUrls: any[] = [];
  try {
    const { data: articles } = await fetchArticles({ 
      page: 1, 
      pageSize: 100, 
      sort: 'published_at', 
      order: 'desc' 
    });
    
    if (articles && articles.length > 0) {
      // Group articles by source for additional sitemap entries
      const sources = [...new Set(articles.map((a: any) => a.source).filter(Boolean))];
      dynamicUrls = sources.map(source => ({
        url: `?source=${encodeURIComponent(source)}`,
        priority: '0.6',
        changefreq: 'daily',
        lastmod: new Date().toISOString()
      }));
    }
  } catch (e) {
    console.error('Error fetching articles for sitemap:', e);
    // Continue with static pages only
  }

  const allUrls = [...staticPages, ...dynamicUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allUrls.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
};