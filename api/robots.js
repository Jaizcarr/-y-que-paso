// Vercel serverless function — served at /robots.txt via the rewrite in
// vercel.json. Built from the request's own host so it's correct whether
// you're on a *.vercel.app URL or a custom domain, with no hardcoded domain
// to keep in sync.
export default function handler(req, res) {
  const origin = `https://${req.headers.host}`;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).send(body);
}
