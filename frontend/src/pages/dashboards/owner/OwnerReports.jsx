// frontend/src/pages/dashboards/owner/OwnerReports.jsx
import React from 'react';
import BranchComparisonChart from '../../../components/widgets/owner/BranchComparisonChart';
import GlobalRevenueCard from '../../../components/widgets/owner/GlobalRevenueCard';
import { Download, Calendar, Filter } from 'lucide-react';

const OwnerReports = () => {
  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Revenue Analytics</h2>
          <p className="text-slate-500">Comparative performance data across the global network</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-slate-600 px-6 py-3 rounded-2xl font-bold transition-all">
          <Download size={20} />
          <span>Export CSV</span>
        </button>
      </header>

      {/* High-level summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlobalRevenueCard />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Avg. Order Value</p>
          <h3 className="text-3xl font-black">$2,450</h3>
          <p className="text-[10px] text-emerald-400 font-bold mt-2">+12.4% vs last month</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Return Customer Rate</p>
          <h3 className="text-3xl font-black">18.5%</h3>
          <p className="text-[10px] text-blue-400 font-bold mt-2">+2.1% growth</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button className="px-6 py-2 bg-blue-600 rounded-full text-xs font-black uppercase tracking-widest">Revenue</button>
          <button className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs font-black uppercase tracking-widest text-slate-500">Volume</button>
          <button className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs font-black uppercase tracking-widest text-slate-500">Growth</button>
        </div>
        <BranchComparisonChart />
      </div>

      {/* Data Table Placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Branch Performance Ledger</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-950 px-4 py-2 rounded-xl">
               <Calendar size={14} />
               <span>Oct 2026</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
               <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 bg-slate-800 rounded-xl" />
                 <div>
                   <p className="font-bold text-sm">Main Branch NY</p>
                   <p className="text-[10px] text-slate-500 uppercase font-black">North America</p>
                 </div>
               </div>
               <div className="flex space-x-12">
                 <div className="text-right">
                   <p className="text-xs text-slate-500 uppercase font-black">Revenue</p>
                   <p className="font-bold">$42,500</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-slate-500 uppercase font-black">Target</p>
                   <p className="font-bold text-emerald-400">105%</p>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerReports;
