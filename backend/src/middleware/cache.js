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

const hasAuthHeader = (req) =>
  Boolean(req.headers.authorization) || /(?:^|;\s*)token=/.test(req.headers.cookie || '');

const inFlight = new Map();

/**
 * Cache GET JSON responses. Skips authenticated requests and sensitive prefixes.
 */
const cacheGet = (ttlSeconds = 60) => (req, res, next) => {
  if (req.method !== 'GET' || shouldSkipCache(req.originalUrl) || hasAuthHeader(req)) {
    return next();
  }

  const key = `${req.method}:${req.originalUrl}`;
  const hit = cacheStore.get(key);
  if (hit !== undefined) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(hit);
  }

  if (inFlight.has(key)) {
    inFlight.get(key).push({ res });
    return;
  }

  inFlight.set(key, []);

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheStore.set(key, body, ttlSeconds);
      const waiters = inFlight.get(key) || [];
      inFlight.delete(key);
      for (const waiter of waiters) {
        waiter.res.setHeader('X-Cache', 'STAMPEDE-HIT');
        waiter.res.json(body);
      }
    } else {
      inFlight.delete(key);
    }
    res.setHeader('X-Cache', 'MISS');
    return originalJson(body);
  };
  next();
};

const clearCache = () => cacheStore.flushAll();

const CATALOG_CACHE_PREFIXES = [
  '/api/products',
  '/api/branches',
  '/api/categories',
  '/api/brands',
  '/api/services',
  '/api/testimonials',
];

/** Drop catalog GET cache only — avoids wiping cache on every login and reduces DB spikes. */
const invalidateCatalogCache = () => {
  const keys = cacheStore.keys();
  for (const key of keys) {
    if (CATALOG_CACHE_PREFIXES.some((p) => key.includes(p))) {
      cacheStore.del(key);
    }
  }
};

/** Clear catalog cache after successful mutations (not auth/login). */
const invalidateCacheOnWrite = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }
  if (req.originalUrl.startsWith('/api/auth')) {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      invalidateCatalogCache();
    }
  });
  next();
};

module.exports = {
  cacheGet,
  clearCache,
  invalidateCatalogCache,
  cacheStore,
  invalidateCacheOnWrite,
};
