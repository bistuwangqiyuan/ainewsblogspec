/* eslint-disable no-console */
// Reason: CLI script requires direct logging for progress visibility
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const SOURCES: { name: string; homepage: string; rss?: string }[] = [
  { name: '开源中国 AI', homepage: 'https://www.oschina.net/', rss: 'https://www.oschina.net/news/widgets/_news_index_all_list?type=ajax&p=1' },
  { name: 'InfoQ 中文', homepage: 'https://www.infoq.cn/' },
  { name: '掘金', homepage: 'https://juejin.cn/' },
  { name: '少数派', homepage: 'https://sspai.com/' },
];

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function ensureSource(s: { name: string; homepage: string; rss?: string }) {
  const { data } = await supabase.from('sources').select('id').eq('homepage_url', s.homepage).maybeSingle();
  if (data) return data.id as number;
  const { data: inserted, error } = await supabase.from('sources').insert({ name: s.name, homepage_url: s.homepage, rss_url: s.rss, language: 'zh' }).select('id').single();
  if (error) throw error;
  return inserted!.id as number;
}

async function upsertArticle(record: { source_id: number; title: string; summary?: string; original_url: string; published_at?: string }) {
  const hostname = new URL(record.original_url).hostname;
  const hash_dedup = sha256(`${record.title.toLowerCase()}|${hostname}`);
  const { error } = await supabase.from('articles').upsert({
    source_id: record.source_id,
    title: record.title,
    summary: record.summary ?? null,
    original_url: record.original_url,
    published_at: record.published_at ?? null,
    hash_dedup
  }, { onConflict: 'original_url' });
  if (error) throw error;
}

async function ingestRss(url: string, source_id: number) {
  const parser = new Parser();
  const feed = await parser.parseURL(url);
  let inserted = 0, duplicated = 0;
  for (const item of feed.items) {
    const link = item.link || item.guid;
    if (!link || !item.title) continue;
    try {
      await upsertArticle({
        source_id,
        title: item.title,
        summary: item.contentSnippet || item.content || item.title,
        original_url: link,
        published_at: item.isoDate || item.pubDate
      });
      inserted++;
    } catch (e: any) {
      if (String(e.message || '').includes('duplicate')) duplicated++; else throw e;
    }
  }
  return { inserted, duplicated };
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: jobRow, error: jobErr } = await supabase.from('ingestion_jobs').insert({ job_date: today, status: 'running' }).select('id').single();
  if (jobErr) throw jobErr;
  const jobId = jobRow!.id as number;

  let totalFetched = 0, totalInserted = 0, totalDuplicated = 0;
  try {
    for (const s of SOURCES) {
      const sourceId = await ensureSource(s);
      console.log(`[ingest] source: ${s.name}`);
      try {
        if (s.rss) {
          const { inserted, duplicated } = await ingestRss(s.rss, sourceId);
          totalFetched += inserted + duplicated;
          totalInserted += inserted;
          totalDuplicated += duplicated;
        } else {
          await supabase.from('ingestion_logs').insert({ job_id: jobId, source_id: sourceId, level: 'warn', message: 'No RSS configured; skipped' });
        }
      } catch (e: any) {
        await supabase.from('ingestion_logs').insert({ job_id: jobId, source_id: sourceId, level: 'error', message: e?.message || 'ingest error' });
      }
    }
    await supabase.from('ingestion_jobs').update({ status: 'success', total_fetched: totalFetched, total_inserted: totalInserted, total_duplicated: totalDuplicated }).eq('id', jobId);
    console.log(`[ingest] done: fetched=${totalFetched} inserted=${totalInserted} duplicated=${totalDuplicated}`);
  } catch (e: any) {
    await supabase.from('ingestion_jobs').update({ status: 'failed', error_message: e?.message || 'failed' }).eq('id', jobId);
    console.error('[ingest] failed:', e);
    process.exitCode = 1;
  }
}

main();


