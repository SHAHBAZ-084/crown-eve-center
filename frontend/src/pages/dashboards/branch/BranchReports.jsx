// frontend/src/pages/dashboards/branch/BranchReports.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import BranchRevenueCard from '../../../components/widgets/branch/BranchRevenueCard';
import { Download, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';

const BranchReports = () => {
  const { user } = useAuth();
  const bId = user?.branchId;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Local Intel</h2>
          <p className="text-slate-500">Performance metrics and sales breakdown for {user?.branchName}</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-600 px-6 py-3 rounded-2xl font-bold transition-all">
          <Download size={20} />
          <span>Export Stats</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BranchRevenueCard branchId={bId} />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Sales</p>
          <h3 className="text-3xl font-black">154</h3>
          <p className="text-[10px] text-emerald-400 font-bold mt-2">Active Month</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Service Utilization</p>
          <h3 className="text-3xl font-black">82%</h3>
          <p className="text-[10px] text-blue-400 font-bold mt-2">Technician Efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center">
                <TrendingUp className="mr-3 text-emerald-500" /> Revenue Stream
              </h3>
              <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-slate-500">
                 <Calendar size={12} /> <span>30 Days</span>
              </div>
           </div>
           <div className="h-48 flex items-end justify-between px-2 gap-2">
              {[20, 30, 45, 25, 60, 50, 80, 40, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-lg hover:bg-emerald-500 transition-all" style={{ height: `${h}%` }} />
              ))}
           </div>
        </div>

        {/* Top Local Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-bold flex items-center">
            <ShoppingBag className="mr-3 text-blue-500" /> Performance Leaders
          </h3>
          <div className="space-y-6">
            {['Elite X-1 Road', 'Carbon Wheelset', 'Aero Stem'].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black italic">#{i+1}</div>
                  <p className="font-bold text-sm">{p}</p>
                </div>
                <p className="font-black text-emerald-400 text-sm">$4,200 total</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchReports;
