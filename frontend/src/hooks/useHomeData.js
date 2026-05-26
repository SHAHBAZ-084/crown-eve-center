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
      publicApi.get('/products', { params: { product_type: 'bike', limit: 3, lite: '1' } }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const testimonialsQuery = useQuery({
    queryKey: ['home', 'testimonials'],
    queryFn: () => publicApi.get('/testimonials').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  return {
    services: servicesQuery.data ?? [],
    products: productsQuery.data?.data ?? productsQuery.data ?? [],
    testimonials: testimonialsQuery.data ?? [],
    // Only block on products (above-the-fold); services/testimonials load independently
    isLoading: productsQuery.isLoading,
    servicesLoading: servicesQuery.isLoading,
    testimonialsLoading: testimonialsQuery.isLoading,
  };
}
