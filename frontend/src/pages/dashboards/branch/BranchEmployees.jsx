// frontend/src/pages/dashboards/branch/BranchEmployees.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { UserPlus, Shield, Mail, ArrowRight } from 'lucide-react';
import TableSkeleton from '../../../components/skeletons/TableSkeleton';

const BranchEmployees = () => {
  const { user } = useAuth();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['branch-employees', user?.branchId],
    queryFn: () => api.get(`/branches/${user.branchId}`).then(r => r.data.users),
    enabled: !!user?.branchId,
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Local Personnel</h2>
          <p className="text-slate-500">Managing staff roles for {user?.branchName}</p>
        </div>
        <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-purple-900/20">
          <UserPlus size={20} />
          <span>Onboard Staff</span>
        </button>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">
        {isLoading ? <TableSkeleton rows={5} /> : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Employee</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500">Current Role</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {employees?.map(emp => (
                <tr key={emp.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="font-bold group-hover:text-blue-400 transition-colors">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 flex items-center font-bold uppercase"><Mail size={10} className="mr-1" /> {emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <Shield size={14} className="text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300">{emp.role}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 transition-all">
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

export default BranchEmployees;
