const NodeCache = require('node-cache');

const cacheStore = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

const SKIP_PREFIXES = [
  '/api/auth',
  '/api/orders',
  '/api/vouchers',
  '/api/accounts',
  '/api/inventory',
  '/api/purchases',
];

const shouldSkipCache = (url) => SKIP_PREFIXES.some((p) => url.startsWith(p));

/**
 * Cache GET JSON responses. Key = method + originalUrl (includes query string).
 */
const cacheGet = (ttlSeconds = 60) => (req, res, next) => {
  if (req.method !== 'GET' || shouldSkipCache(req.originalUrl)) {
    return next();
  }

  const key = `${req.method}:${req.originalUrl}`;
  const hit = cacheStore.get(key);
  if (hit !== undefined) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(hit);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheStore.set(key, body, ttlSeconds);
    }
    res.setHeader('X-Cache', 'MISS');
    return originalJson(body);
  };
  next();
};

const clearCache = () => cacheStore.flushAll();

module.exports = { cacheGet, clearCache, cacheStore };
