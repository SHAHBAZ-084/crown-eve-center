// frontend/src/pages/dashboards/branch/BranchSuppliers.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Truck, Plus, ExternalLink, Package } from 'lucide-react';

const BranchSuppliers = () => {
  const { user } = useAuth();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['branch-suppliers'],
    queryFn: () => api.get('/suppliers').then(r => r.data),
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Supply Chain</h2>
          <p className="text-slate-500">Authorized part providers for the network</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">
          <Plus size={20} />
          <span>Register Supplier</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-[2.5rem]" />) : (
          suppliers?.map(supplier => (
            <div key={supplier.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 group hover:border-blue-500/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <Truck size={24} />
                </div>
                <button className="p-2 text-slate-500 hover:text-white transition-all"><ExternalLink size={18} /></button>
              </div>
              <div>
                <h4 className="text-xl font-bold">{supplier.name}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{supplier.contact}</p>
              </div>
              <div className="pt-6 border-t border-slate-800/50">
                 <button className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-xs hover:border-blue-500 transition-all">
                    <Package size={14} />
                    <span>Purchase Order</span>
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BranchSuppliers;
