/** Unwrap { data: [...] } or bare array from API responses */
export const normalizeApiList = (payload) => {
  const list = payload?.data ?? payload;
  return Array.isArray(list) ? list : [];
};

/** Paginated products/services shape */
export const normalizePaginated = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 1 } };
  }
  const data = normalizeApiList(payload);
  const meta = payload.meta ?? {
    total: data.length,
    page: 1,
    limit: data.length || 12,
    totalPages: 1,
  };
  return { data, meta };
};
