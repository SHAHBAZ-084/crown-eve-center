// frontend/src/pages/dashboards/branch/BranchOrders.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ShoppingBag, Search, Filter, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const BranchOrders = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['branch-orders', user?.branchId, page, status],
    queryFn: () => 
      api.get('/orders', { params: { branchId: user?.branchId, page, limit: 10, status } })
         .then(r => r.data),
    enabled: !!user?.branchId,
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Order Queue</h2>
          <p className="text-slate-500">Live transaction stream for {user?.branchName}</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
           {['', 'PENDING', 'COMPLETED', 'CANCELLED'].map(s => (
             <button 
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {s || 'All'}
             </button>
           ))}
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
        {isLoading ? <TableSkeleton rows={8} /> : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Reference</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Customer</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Total</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Status</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.data.map(order => (
                <tr key={order.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black italic">#{order.id}</div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{order.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold">{order.customer?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5 font-black text-emerald-400 text-lg">${order.total.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {order.status === 'COMPLETED' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      <span>{order.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl group-hover:border-blue-500 transition-all">
                      <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BranchOrders;
