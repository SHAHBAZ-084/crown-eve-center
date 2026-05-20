// frontend/src/hooks/useRevenue.js
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useRevenueSummary = (branchId) => {
  return useQuery({
    queryKey: ['revenue-summary', branchId],
    queryFn: () => api.get('/reports/revenue/summary', { params: { branchId } }).then(r => r.data),
    staleTime: 60000, // 60s as per checklist
  });
};

export const useRevenueChart = (branchId, period = '30d') => {
  return useQuery({
    queryKey: ['revenue-chart', branchId, period],
    queryFn: () => api.get('/reports/revenue/chart', { params: { branchId, period } }).then(r => r.data),
    staleTime: 60000,
  });
};

export const useBranchComparison = (period = 'month') => {
  return useQuery({
    queryKey: ['branch-comparison', period],
    queryFn: () => api.get('/reports/branches/compare', { params: { period } }).then(r => r.data),
    staleTime: 60000,
  });
};
