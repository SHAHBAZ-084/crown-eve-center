// frontend/src/pages/dashboards/branch/BranchServices.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Wrench, Plus, Edit2, Trash2 } from 'lucide-react';

const BranchServices = () => {
  const { user } = useAuth();

  const { data: services, isLoading } = useQuery({
    queryKey: ['branch-services', user?.branchId],
    queryFn: () => api.get(`/services`, { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId,
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Service Protocols</h2>
          <p className="text-slate-500">Available maintenance packages for {user?.branchName}</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20">
          <Plus size={20} />
          <span>New Protocol</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-[2.5rem]" />) : (
          services?.map(service => (
            <div key={service.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 group hover:border-blue-500/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Wrench size={24} />
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 bg-slate-950 rounded-lg text-slate-500 hover:text-white"><Edit2 size={14} /></button>
                  <button className="p-2 bg-slate-950 rounded-lg text-red-900 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold">{service.name}</h4>
                <p className="text-2xl font-black italic text-emerald-400 mt-2">${service.price.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-slate-800/50 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                Standard Turnaround: 24h
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BranchServices;
