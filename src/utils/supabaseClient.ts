import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read from import.meta.env first (Astro runtime), then fall back to process.env for tests/CI
function getEnv() {
  // Direct access to avoid "Dynamic access of import.meta.env is not supported" error
  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;
  
  try {
    supabaseUrl = import.meta.env?.PUBLIC_SUPABASE_URL;
    supabaseAnonKey = import.meta.env?.PUBLIC_SUPABASE_ANON_KEY;
  } catch (e) {
    // Fallback for non-Astro environments
  }
  
  // Fallback to process.env
  if (!supabaseUrl && typeof process !== 'undefined') {
    supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  }
  if (!supabaseAnonKey && typeof process !== 'undefined') {
    supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  }
  
  return { supabaseUrl, supabaseAnonKey };
}

// Lazy initialization to avoid crashing at module load time
let _supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (_supabaseClient) return _supabaseClient;
  
  const { supabaseUrl, supabaseAnonKey } = getEnv();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured');
    return null;
  }
  
  try {
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true
      }
    });
    return _supabaseClient;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Export a getter instead of a direct client
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not initialized');
    }
    return (client as any)[prop];
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

  try {
    const client = getSupabaseClient();
    
    // Check if we have valid credentials
    if (!client) {
      console.warn('Supabase credentials not configured, returning empty results');
      return { data: [] as ArticleRow[], total: 0 };
    }

    let query = client
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
      console.error('Supabase query error:', error);
      throw error;
    }
    return { data: (data || []) as ArticleRow[], total: count ?? 0 };
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Return empty data instead of crashing
    return { data: [] as ArticleRow[], total: 0 };
  }
}


