// frontend/src/pages/dashboards/owner/OwnerUsers.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { Users, UserPlus, Shield, MapPin, Mail } from 'lucide-react';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const OwnerUsers = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['owner-users'],
    queryFn: () => api.get('/auth/users').then(r => r.data), // Needs backend endpoint
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Personnel Hub</h2>
          <p className="text-slate-500">Managing access and roles for all 150+ employees</p>
        </div>
        <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-purple-900/20">
          <UserPlus size={20} />
          <span>Add Employee</span>
        </button>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Employee</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Role</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Branch</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Status</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-bold group-hover:text-blue-400 transition-colors">{u.name}</p>
                      <p className="text-xs text-slate-500 flex items-center"><Mail size={12} className="mr-1" /> {u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-2">
                    <Shield size={14} className="text-purple-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">{u.role}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center text-slate-400 text-xs">
                    <MapPin size={14} className="mr-1 text-slate-600" />
                    {u.branch?.name || 'Unassigned'}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">Active</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-xs font-bold text-slate-500 hover:text-white transition-all underline">Edit Permissions</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerUsers;
