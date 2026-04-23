// frontend/src/pages/dashboards/employee/EmployeeOrders.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ShoppingBag, Search, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const EmployeeOrders = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('PENDING');

  const { data, isLoading } = useQuery({
    queryKey: ['employee-orders', user?.branchId, status],
    queryFn: () => api.get('/orders', { params: { branchId: user?.branchId, status, limit: 20 } }).then(r => r.data),
    enabled: !!user?.branchId,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Order Station</h2>
          <p className="text-slate-500 font-medium">Managing current transactions for {user?.branchName}</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-xl">
           {['PENDING', 'COMPLETED'].map(s => (
             <button 
              key={s}
              onClick={() => setStatus(s)}
              className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {s}
             </button>
           ))}
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
        {isLoading ? <TableSkeleton rows={6} /> : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-10 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">ID</th>
                <th className="px-10 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Source</th>
                <th className="px-10 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Total</th>
                <th className="px-10 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.data.map(order => (
                <tr key={order.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-10 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-black italic">#{order.id}</div>
                      <span className="text-xs font-bold">{order.customer?.name || 'Guest'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.type === 'POS' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {order.type}
                    </span>
                  </td>
                  <td className="px-10 py-5 font-black text-emerald-400 text-lg">${order.total.toLocaleString()}</td>
                  <td className="px-10 py-5 text-right">
                    <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Process
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

export default EmployeeOrders;
