/* eslint-disable no-console */
// Simple Node-based self-test runner without vitest/vite
import { createClient } from '@supabase/supabase-js';

const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anon = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !anon) {
    console.error('[selftest] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
    process.exit(2);
}

const supabase = createClient(url, anon);

const results = [];
function logResult(name, ok, info) {
    results.push({ name, ok, info });
    const badge = ok ? 'PASS' : 'FAIL';
    console.log(`[${badge}] ${name}${info ? ' - ' + info : ''}`);
}

async function testFetchDefaultPage() {
    const name = 'articles: default page order by published_at desc';
    try {
        const { data, error, count } = await supabase
            .from('articles')
            .select('id,published_at,title,original_url', { count: 'exact' })
            .order('published_at', { ascending: false })
            .range(0, 9);
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error('data not array');
        if (typeof count !== 'number') throw new Error('count missing');
        logResult(name, true, `items=${data.length} total=${count}`);
    } catch (e) {
        logResult(name, false, e?.message);
    }
}

async function testKeywordFilter() {
    const name = 'articles: keyword filter (rare keyword -> 0 or few)';
    try {
        const { data, error } = await supabase.from('articles').select('id,title').ilike('title', '%unlikely_keyword_xyz987%').limit(5);
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error('data not array');
        logResult(name, true, `items=${data.length}`);
    } catch (e) {
        logResult(name, false, e?.message);
    }
}

async function testInvalidSort() {
    const name = 'articles: invalid sort should error';
    try {
        const { error } = await supabase.from('articles').select('id').order('not_exists', { ascending: false }).limit(1);
        if (!error) throw new Error('expected error but got none');
        logResult(name, true, error.message);
    } catch (e) {
        logResult(name, false, e?.message);
    }
}

async function testFeedbackReadable() {
    const name = 'feedback: public readable';
    try {
        const { data, error } = await supabase.from('feedback').select('id,title,created_at').order('created_at', { ascending: false }).limit(5);
        if (error) throw error;
        if (!Array.isArray(data)) throw new Error('data not array');
        logResult(name, true, `items=${data.length}`);
    } catch (e) {
        logResult(name, false, e?.message);
    }
}

async function main() {
    console.log('[selftest] start');
    const start = Date.now();
    await testFetchDefaultPage();
    await testKeywordFilter();
    await testInvalidSort();
    await testFeedbackReadable();
    const pass = results.every((r) => r.ok);
    const summary = `${results.filter((r) => r.ok).length}/${results.length} passed`;
    console.log('[selftest] done in', Date.now() - start, 'ms -', summary);
    if (!pass) process.exit(1);
}

main();
