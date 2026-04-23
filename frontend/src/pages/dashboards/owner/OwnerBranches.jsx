// frontend/src/pages/dashboards/owner/OwnerBranches.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { MapPin, Plus, Edit2, Trash2, Users, Package } from 'lucide-react';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const OwnerBranches = () => {
  const { data: branches, isLoading } = useQuery({
    queryKey: ['owner-branches'],
    queryFn: () => api.get('/branches').then(r => r.data),
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Network Nodes</h2>
          <p className="text-slate-500">Manage all global branch locations</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20">
          <Plus size={20} />
          <span>New Branch</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches?.map(branch => (
          <div key={branch.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{branch.name}</h3>
                  <p className="text-slate-500 text-sm">{branch.location}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-3 bg-slate-950 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"><Edit2 size={16} /></button>
                <button className="p-3 bg-slate-950 rounded-xl text-red-900 hover:text-red-500 hover:bg-red-500/5 transition-all"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Users size={14} className="mr-2" /> Staff
                </div>
                <span className="font-bold">{branch._count?.users || 0}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Package size={14} className="mr-2" /> Stock
                </div>
                <span className="font-bold">{branch._count?.products || 0}</span>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-800 hover:bg-blue-600 rounded-2xl font-bold transition-all">
              Manage Operations
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerBranches;
