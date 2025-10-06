import type { APIRoute } from 'astro';
import { fetchArticles } from '../utils/supabaseClient';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || 'https://ainewsblogspec.netlify.app';
  
  try {
    // Fetch latest 50 articles (returns empty array if Supabase not configured)
    const { data: items } = await fetchArticles({ 
      page: 1, 
      pageSize: 50, 
      sort: 'published_at', 
      order: 'desc' 
    });
    
    // If no items, return a minimal RSS feed
    if (!items || items.length === 0) {
      const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI编程资讯聚合</title>
    <link>${siteUrl}</link>
    <description>AI编程工具与实践的中文资讯聚合</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}rss.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;
      return new Response(fallbackRss, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>AI编程资讯聚合</title>
    <link>${siteUrl}</link>
    <description>AI编程工具与实践的中文资讯聚合，提供最新的AI编程新闻、工具、教程和实践案例</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}rss.xml" rel="self" type="application/rss+xml"/>
    <generator>Astro</generator>
    <image>
      <url>${siteUrl}images/og-image.jpg</url>
      <title>AI编程资讯聚合</title>
      <link>${siteUrl}</link>
    </image>
${items.map((item: any) => `    <item>
      <title><![CDATA[${item.title || ''}]]></title>
      <link>${item.url || ''}</link>
      <guid isPermaLink="false">${item.id || ''}</guid>
      <pubDate>${item.published_at ? new Date(item.published_at).toUTCString() : new Date().toUTCString()}</pubDate>
      <description><![CDATA[${item.summary || item.title || ''}]]></description>
      ${item.source ? `<dc:creator>${item.source}</dc:creator>` : ''}
      <category>AI编程</category>
    </item>`).join('\n')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    
    // Return minimal RSS on error
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI编程资讯聚合</title>
    <link>${siteUrl}</link>
    <description>AI编程工具与实践的中文资讯聚合</description>
    <language>zh-CN</language>
  </channel>
</rss>`;

    return new Response(fallbackRss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
};

