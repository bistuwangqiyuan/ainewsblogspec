/* eslint-disable no-console */
import fs from 'fs';

const base = (process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const service = process.env.SUPABASE_SERVICE_ROLE;
if (!base || !service) {
    console.error('[db-init-try] Missing SUPABASE_URL/PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE');
    process.exit(2);
}

const sql = fs.readFileSync(new URL('./init.sql', import.meta.url), 'utf-8');
const paths = ['/postgres/v1/query', '/postgres/v1/exec', '/postgres/v1/execute', '/pg/meta/query', '/pg/meta/exec', '/pg/sql'];
const bodies = [(s) => ({ query: s }), (s) => ({ sql: s })];

async function tryOnce(path, body) {
    const url = base + path;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: service,
            Authorization: `Bearer ${service}`
        },
        body: JSON.stringify(body)
    });
    const text = await res.text().catch(() => '');
    return { ok: res.ok, status: res.status, text, url };
}

async function main() {
    console.log('[db-init-try] start base=', base);
    for (const p of paths) {
        for (const b of bodies) {
            const { ok, status, text, url } = await tryOnce(p, b(sql));
            console.log('> try', url, 'status', status);
            if (ok) {
                console.log('[db-init-try] success via', url);
                console.log(text.slice(0, 200));
                return;
            } else {
                console.log('[db-init-try] failed:', text.slice(0, 200));
            }
        }
    }
    process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
