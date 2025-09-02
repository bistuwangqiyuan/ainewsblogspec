/* eslint-disable no-console */
import fs from 'fs';

const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE;
if (!url || !service) {
    console.error('[db-init] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
    process.exit(2);
}

const sql = fs.readFileSync(new URL('./init.sql', import.meta.url), 'utf-8');

async function execSql(sqlText) {
    const endpoint = url.replace(/\/$/, '') + '/postgres/v1/query';
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: service,
            Authorization: `Bearer ${service}`
        },
        body: JSON.stringify({ query: sqlText })
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return res.json().catch(() => ({}));
}

async function main() {
    console.log('[db-init] applying DDL & RLS via Postgres Meta');
    await execSql(sql);
    console.log('[db-init] done');
}

main().catch((e) => {
    console.error('[db-init] failed:', e?.message || e);
    process.exit(1);
});
