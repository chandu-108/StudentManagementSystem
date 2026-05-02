/**
 * Proxies /api/* to your Node backend (same-origin in the browser).
 * Vercel → Settings → Environment Variables:
 *   API_BACKEND_URL=https://your-host.onrender.com/api   (HTTPS, include /api, no trailing slash)
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function stripApiPath(pathname) {
  const base = '/api';
  if (pathname === base || pathname === `${base}/`) return '';
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length + 1);
  return '';
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

  let pathname = req.url || '';
  let search = '';
  try {
    const u = new URL(req.url, 'http://local.test');
    pathname = u.pathname || '';
    search = u.search || '';
  } catch {
    const q = pathname.indexOf('?');
    if (q !== -1) {
      search = pathname.slice(q);
      pathname = pathname.slice(0, q);
    }
  }

  const tail = stripApiPath(pathname);
  const targetUrl = tail ? `${backend}/${tail}${search}` : `${backend}/${search}`;

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
