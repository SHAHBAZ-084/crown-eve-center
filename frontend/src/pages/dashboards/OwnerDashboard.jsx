// frontend/src/pages/dashboards/OwnerDashboard.jsx
import React from 'react';
import GlobalRevenueCard from '../../components/widgets/owner/GlobalRevenueCard';
import TotalBranchesCard from '../../components/widgets/owner/TotalBranchesCard';
import ServiceOrdersCard from '../../components/widgets/owner/TotalOrdersCard';
import LowStockAlertCard from '../../components/widgets/owner/LowStockAlertCard';
import BranchComparisonChart from '../../components/widgets/owner/BranchComparisonChart';
import TopBranchesTable from '../../components/widgets/owner/TopBranchesTable';
import PartsOverviewCard from '../../components/widgets/owner/PartsOverviewCard';
import RecentActivityFeed from '../../components/widgets/owner/RecentActivityFeed';

const OwnerDashboard = () => {
  return (
    <div className="space-y-10 p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="section-label"><div className="section-label-line"></div><span>Enterprise Control</span></div>
          <h2 className="text-6xl font-family-bebas tracking-tighter uppercase text-white">Network <span className="text-[#FF4D00]">Command</span></h2>
          <p className="text-[#BDBDB8] font-light text-lg mt-2">Real-time monitoring for the Crown Eve branch network</p>
        </div>
        <div className="flex items-center space-x-4 bg-[#111] px-8 py-4 rounded-none border border-white/5 shadow-2xl">
           <div className="relative">
             <span className="absolute inset-0 bg-[#FF4D00] rounded-full animate-ping opacity-20" />
             <span className="relative block w-3 h-3 bg-[#FF4D00] rounded-full border-2 border-[#0A0A0A]" />
           </div>
           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#F5F5F0]">Live Station Network Active</span>
        </div>
      </header>

      {/* Independent Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlobalRevenueCard />
        <TotalBranchesCard />
        <ServiceOrdersCard />
        <LowStockAlertCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BranchComparisonChart />
        </div>
        <div>
          <TopBranchesTable />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <PartsOverviewCard />
        <RecentActivityFeed />
      </div>
    </div>
  );
};

export default OwnerDashboard;
