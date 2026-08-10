import { createClient } from '@supabase/supabase-js';

// Same public anon key as the frontend (src/services/supabaseClient.js) —
// safe to duplicate here, real security comes from RLS, not secrecy.
const SUPABASE_URL = 'https://ccqctxaizxnxgqmtltnf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcWN0eGFpenhueGdxbXRsdG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNDMzMjgsImV4cCI6MjEwMTkxOTMyOH0.WCMANpPY8Pg2StwLqeEkezn07bGjk90JEy_KUAEl0TU';

function xmlEscape(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

// Vercel serverless function — served at /sitemap.xml via the rewrite in
// vercel.json. Queries the live database on every request (cached at the
// edge for an hour), so any series or character added later through the
// Admin panel shows up here automatically — no rebuild, no manual step.
export default async function handler(req, res) {
  const origin = `https://${req.headers.host}`;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const [{ data: series, error: seriesErr }, { data: characters, error: charErr }] = await Promise.all([
    supabase.from('series').select('id, updated_at'),
    supabase.from('characters').select('id, series_id, updated_at'),
  ]);

  if (seriesErr || charErr) {
    res.status(500).send('Error generating sitemap');
    return;
  }

  const urls = [
    { loc: `${origin}/`, priority: '1.0' },
    ...(series || []).map(s => ({ loc: `${origin}/${s.id}`, lastmod: s.updated_at, priority: '0.8' })),
    ...(characters || []).map(c => ({ loc: `${origin}/${c.series_id}/${c.id}`, lastmod: c.updated_at, priority: '0.6' })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
${u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>\n` : ''}    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(body);
}
