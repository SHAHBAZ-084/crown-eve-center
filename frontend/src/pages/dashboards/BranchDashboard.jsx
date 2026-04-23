// frontend/src/pages/dashboards/BranchDashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import BranchRevenueCard from '../../components/widgets/branch/BranchRevenueCard';
import ServiceQueueBadge from '../../components/widgets/branch/PendingOrdersBadge';
import TodayBookingsCard from '../../components/widgets/branch/TodayBookingsCard';
import LowStockAlertsCard from '../../components/widgets/branch/LowStockAlertsCard';
import TodayAppointmentsList from '../../components/widgets/branch/TodayAppointmentsList';
import RecentOrdersTable from '../../components/widgets/branch/RecentOrdersTable';
import StockAlertsList from '../../components/widgets/branch/StockAlertsList';
import { Package, Wrench, Calendar, TrendingUp } from 'lucide-react';

const BranchDashboard = () => {
  const { user } = useAuth();
  const bId = user?.branchId;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">{user?.branchName || 'Local'} Terminal</h2>
          <p className="text-slate-500 font-medium">Daily operations and localized branch monitoring</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl">
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
           <span className="text-xs font-black tracking-widest uppercase text-slate-300">Station Active</span>
        </div>
      </header>

      {/* 4 Quick Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BranchRevenueCard branchId={bId} />
        <ServiceQueueBadge branchId={bId} />
        <TodayBookingsCard branchId={bId} />
        <LowStockAlertsCard branchId={bId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <TodayAppointmentsList branchId={bId} />
        
        {/* Revenue Chart Placeholder / Revenue Chart widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center">
                <TrendingUp className="mr-3 text-emerald-500" /> Revenue Flow
              </h3>
              <span className="text-xs font-bold text-slate-500">Last 30 Days</span>
           </div>
           <div className="h-64 flex items-end justify-between px-4 gap-2">
              {[30, 45, 20, 60, 40, 80, 50, 90, 70, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-emerald-600/10 to-emerald-500/40 rounded-t-lg transition-all hover:bg-emerald-500" style={{ height: `${h}%` }} />
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentOrdersTable branchId={bId} />
        <StockAlertsList branchId={bId} />
      </div>
    </div>
  );
};

export default BranchDashboard;
