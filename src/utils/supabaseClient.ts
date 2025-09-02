import { createClient } from '@supabase/supabase-js';

// Read from import.meta.env first (Astro runtime), then fall back to process.env for tests/CI
const metaEnv = (import.meta as any)?.env || {};
const supabaseUrl: string | undefined = metaEnv.PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? (process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) : undefined);
const supabaseAnonKey: string | undefined = metaEnv.PUBLIC_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? (process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  // Reason: Fail fast to avoid accidental use of mock or undefined credentials
  throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});

export type ArticleRow = {
  id: number;
  source_id: number | null;
  title: string;
  summary: string | null;
  author: string | null;
  original_url: string;
  cover_image_url: string | null;
  published_at: string | null;
  popularity_score: number | null;
  growth_score: number | null;
};

export type ArticleQueryParams = {
  page: number;
  pageSize: number;
  sort?: 'published_at' | 'popularity_score' | 'growth_score';
  order?: 'asc' | 'desc';
  keyword?: string;
  source?: string;
  category?: string;
  timeWindow?: '24h' | '7d' | '30d';
};

export async function fetchArticles(params: ArticleQueryParams) {
  const { page, pageSize, sort = 'published_at', order = 'desc', keyword, source, category, timeWindow } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('articles')
    .select('id, source_id, title, summary, author, original_url, cover_image_url, published_at, popularity_score, growth_score', { count: 'exact' });

  if (keyword && keyword.trim()) {
    query = query.ilike('title', `%${keyword.trim()}%`);
  }
  if (source && source.trim()) {
    // Assuming a computed/source field or join view; fallback to filter by original_url domain
    query = query.ilike('original_url', `%${source.trim()}%`);
  }
  if (timeWindow) {
    const now = new Date();
    const start = new Date(now);
    if (timeWindow === '24h') start.setDate(now.getDate() - 1);
    if (timeWindow === '7d') start.setDate(now.getDate() - 7);
    if (timeWindow === '30d') start.setDate(now.getDate() - 30);
    query = query.gte('published_at', start.toISOString());
  }

  // Sorting
  query = query.order(sort, { ascending: order === 'asc' });

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    // Reason: Do not fall back to mock; surface real errors
    throw error;
  }
  return { data: (data || []) as ArticleRow[], total: count ?? 0 };
}


