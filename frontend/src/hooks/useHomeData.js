import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useHomeData() {
  const servicesQuery = useQuery({
    queryKey: ['home', 'services'],
    queryFn: () => api.get('/services').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ['home', 'products'],
    queryFn: () =>
      api.get('/products', { params: { product_type: 'bike', limit: 3, lite: '1' } }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const testimonialsQuery = useQuery({
    queryKey: ['home', 'testimonials'],
    queryFn: () => api.get('/testimonials').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  return {
    services: servicesQuery.data ?? [],
    products: productsQuery.data?.data ?? productsQuery.data ?? [],
    testimonials: testimonialsQuery.data ?? [],
    isLoading: servicesQuery.isLoading || productsQuery.isLoading || testimonialsQuery.isLoading,
  };
}
