import { useQuery } from '@tanstack/react-query';
import publicApi from '../services/publicApi';

export function useHomeData() {
  const servicesQuery = useQuery({
    queryKey: ['home', 'services'],
    queryFn: () => publicApi.get('/services').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ['home', 'products'],
    queryFn: () =>
      publicApi.get('/products', { params: { product_type: 'bike', limit: 6, lite: '1' } }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const branchesQuery = useQuery({
    queryKey: ['home', 'branches'],
    queryFn: () => publicApi.get('/branches', { params: { limit: 20 } }).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const testimonialsQuery = useQuery({
    queryKey: ['home', 'testimonials'],
    queryFn: () => publicApi.get('/testimonials').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const branchesRaw = branchesQuery.data?.data ?? branchesQuery.data ?? [];

  return {
    services: servicesQuery.data ?? [],
    products: productsQuery.data?.data ?? productsQuery.data ?? [],
    branches: Array.isArray(branchesRaw) ? branchesRaw : [],
    testimonials: testimonialsQuery.data ?? [],
    // Only block on products (above-the-fold); services/testimonials/branches load independently
    isLoading: productsQuery.isLoading,
    servicesLoading: servicesQuery.isLoading,
    branchesLoading: branchesQuery.isLoading,
    testimonialsLoading: testimonialsQuery.isLoading,
  };
}
