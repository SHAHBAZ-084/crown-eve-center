/** Canonical customer portal paths (use these instead of public /shop, /cart, etc.) */
export const CUSTOMER_PATHS = {
  dashboard: '/my/dashboard',
  shop: '/my/shop',
  product: (id) => `/my/product/${id}`,
  orders: '/my/orders',
  bookings: '/my/bookings',
  bookService: '/my/book-service',
  profile: '/my/profile',
  cart: '/my/cart',
  checkout: '/my/checkout',
  track: (id) => `/my/track/${id}`,
};

/** Old URLs → customer portal (post-login redirect, legacy bookmarks) */
export const CUSTOMER_ROUTE_ALIASES = {
  '/appointments': CUSTOMER_PATHS.bookService,
  '/shop': CUSTOMER_PATHS.shop,
  '/cart': CUSTOMER_PATHS.cart,
  '/checkout': CUSTOMER_PATHS.checkout,
};

export function normalizeCustomerRedirect(path) {
  if (!path || typeof path !== 'string') return path;
  const qIndex = path.indexOf('?');
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const search = qIndex >= 0 ? path.slice(qIndex) : '';
  const mapped = CUSTOMER_ROUTE_ALIASES[pathname];
  if (!mapped) return path;
  if (pathname.startsWith('/track/')) {
    return `${CUSTOMER_PATHS.track(pathname.split('/')[2])}${search}`;
  }
  if (pathname.startsWith('/product/')) {
    return `${CUSTOMER_PATHS.product(pathname.split('/')[2])}${search}`;
  }
  return `${mapped}${search}`;
}
