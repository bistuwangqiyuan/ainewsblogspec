/* eslint-disable no-console */
import fs from 'fs';

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF || (process.env.PUBLIC_SUPABASE_URL || '').split('https://').pop()?.split('.')[0];

if (!accessToken || !projectRef) {
    console.error('[db-init-admin] Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF/PUBLIC_SUPABASE_URL');
    process.exit(2);
}

const sql = fs.readFileSync(new URL('./init.sql', import.meta.url), 'utf-8');

async function execSql(sqlText) {
    const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/sql`;
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ query: sqlText })
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return text;
}

async function main() {
    console.log('[db-init-admin] applying DDL & RLS via Supabase Management API');
    const out = await execSql(sql);
    console.log('[db-init-admin] done:', out?.slice(0, 200) || 'ok');
}

main().catch((e) => {
    console.error('[db-init-admin] failed:', e?.message || e);
    process.exit(1);
});
