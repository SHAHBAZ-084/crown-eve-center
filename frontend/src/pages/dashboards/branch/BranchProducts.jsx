// frontend/src/pages/dashboards/branch/BranchProducts.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Search, Filter, ShoppingCart, Tag } from 'lucide-react';

const BranchProducts = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['branch-products', user?.branchId],
    queryFn: () => api.get('/products', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId,
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase premium-gradient-text">Maintenance Kits</h2>
          <p className="text-slate-500 font-medium">Managing official spare bundles for {user?.branchName}</p>
        </div>
        <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/20">
          <Plus size={20} />
          <span>New Product</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? [...Array(8)].map((_, i) => <div key={i} className="h-64 bg-slate-900 animate-pulse rounded-[2rem]" />) : (
          data?.data.map(product => (
            <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="aspect-square bg-slate-950 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black italic text-emerald-400">
                  ${product.price.toLocaleString()}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h4 className="font-bold text-lg">{product.name}</h4>
                <div className="flex items-center justify-between text-xs text-slate-500 font-black uppercase tracking-widest">
                  <span className="flex items-center"><Tag size={12} className="mr-1" /> {product.parts?.length || 0} Parts</span>
                  <button className="text-blue-400 hover:underline">Edit Config</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BranchProducts;
