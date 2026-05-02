/**
 * Proxies /api/* to your Node backend so the browser stays same-origin (no CORS mix-ups).
 * Set API_BACKEND_URL in Vercel → Settings → Environment Variables (e.g. https://your-app.onrender.com/api).
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  const backend = process.env.API_BACKEND_URL?.replace(/\/$/, '');
  if (!backend) {
    res.status(503).json({
      error: 'Misconfigured proxy',
      message:
        'Set API_BACKEND_URL in Vercel (Project → Settings → Environment Variables). Example: https://your-api.onrender.com/api',
    });
    return;
  }

  const slug = req.query.slug;
  const tail = Array.isArray(slug) ? slug.join('/') : slug || '';
  let search = '';
  try {
    const u = new URL(req.url, 'http://local.test');
    search = u.search || '';
  } catch {
    const q = req.url.indexOf('?');
    if (q !== -1) search = req.url.slice(q);
  }

  const targetUrl = `${backend}/${tail}${search}`;

  /** @type {Parameters<typeof fetch>[1]} */
  const init = {
    method: req.method,
    headers: {},
  };

  const auth = req.headers.authorization;
  if (auth) init.headers.Authorization = auth;
  const ct = req.headers['content-type'];
  if (ct) init.headers['Content-Type'] = ct;
  const accept = req.headers.accept;
  if (accept) init.headers.Accept = accept;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const raw = await readBody(req);
    if (raw.length) init.body = raw;
  }

  let upstream;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (err) {
    res.status(502).json({
      error: 'Upstream unreachable',
      message: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  const outCt = upstream.headers.get('content-type');
  if (outCt) res.setHeader('Content-Type', outCt);

  const buf = Buffer.from(await upstream.arrayBuffer());
  res.status(upstream.status).send(buf);
};
