// frontend/src/pages/dashboards/owner/OwnerParts.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { Package, Plus, Search, Filter, Edit3 } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const OwnerParts = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-parts', debouncedSearch, page],
    queryFn: () => 
      api.get('/parts', { params: { search: debouncedSearch, page, limit: 10 } })
         .then(r => r.data),
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Global Catalog</h2>
          <p className="text-slate-500">Universal parts master list (1700+ SKUs)</p>
        </div>
        <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/20">
          <Plus size={20} />
          <span>Add SKU</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search catalog by name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
          />
        </div>
        <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-2 hover:bg-slate-800 transition-all font-bold">
          <Filter size={18} />
          <span>Category</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
        {isLoading ? <TableSkeleton rows={8} /> : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Component</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Category</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Price</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Base Stock</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.data.map(part => (
                <tr key={part.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-600">
                        <Package size={20} />
                      </div>
                      <span className="font-bold group-hover:text-blue-400 transition-colors">{part.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400 font-medium">{part.category}</td>
                  <td className="px-8 py-5 font-bold text-emerald-400">${part.price}</td>
                  <td className="px-8 py-5 text-sm font-bold">{part.stock} units</td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-3 text-slate-500 hover:text-white transition-all"><Edit3 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="p-6 bg-slate-950/50 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-bold">Showing {data?.data.length} of {data?.meta.total} results</p>
          <div className="flex space-x-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30 font-bold text-xs"
            >
              Prev
            </button>
            <button 
              disabled={page >= (data?.meta.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30 font-bold text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerParts;
