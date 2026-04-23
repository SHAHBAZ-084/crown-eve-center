// frontend/src/pages/dashboards/branch/BranchInventory.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Package, Plus, Search, Filter, RefreshCcw, AlertTriangle } from 'lucide-react';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const BranchInventory = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['branch-inventory', user?.branchId, page],
    queryFn: () => api.get('/inventory', { params: { branchId: user?.branchId, page, limit: 12 } }).then(r => r.data),
    enabled: !!user?.branchId,
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ partId, stock }) => api.put(`/inventory/${user.branchId}/${partId}`, { stock }),
    onSuccess: () => queryClient.invalidateQueries(['branch-inventory']),
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase premium-gradient-text">Station Inventory</h2>
          <p className="text-slate-500 font-medium">Live spare parts management for {user?.branchName}</p>
        </div>
        <div className="flex space-x-4">
           <button className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">
             <RefreshCcw size={18} />
             <span>Reconcile</span>
           </button>
           <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20">
             <Plus size={20} />
             <span>New Purchase</span>
           </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search local stock..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? [...Array(8)].map((_, i) => <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-3xl" />) : (
          data?.data.map(item => (
            <div key={item.id} className={`bg-slate-900 border p-6 rounded-[2rem] space-y-4 group transition-all ${item.stock <= item.alertAt ? 'border-red-900/50 shadow-2xl shadow-red-900/5' : 'border-slate-800 hover:border-slate-700'}`}>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-500">
                  <Package size={20} />
                </div>
                {item.stock <= item.alertAt && (
                   <AlertTriangle size={18} className="text-red-500 animate-bounce" />
                )}
              </div>
              <div>
                <h4 className="font-bold truncate">{item.part?.name}</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.part?.category}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">On Hand</p>
                  <p className="text-2xl font-black italic">{item.stock}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => updateStockMutation.mutate({ partId: item.part.id, stock: item.stock - 1 })}
                    className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-800"
                  >-</button>
                  <button 
                    onClick={() => updateStockMutation.mutate({ partId: item.part.id, stock: item.stock + 1 })}
                    className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-800"
                  >+</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BranchInventory;
