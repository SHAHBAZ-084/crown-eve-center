// frontend/src/pages/dashboards/EmployeeDashboard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import PendingOrdersBadge from '../../components/widgets/branch/PendingOrdersBadge';
import TodayBookingsCard from '../../components/widgets/branch/TodayBookingsCard';
import { ShoppingBag, Wrench, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <header className="text-center space-y-4">
        <h2 className="text-5xl font-black italic tracking-tighter uppercase">Frontline Terminal</h2>
        <p className="text-slate-500 font-medium">Ready for duty at {user?.branchName}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PendingOrdersBadge branchId={user?.branchId} />
        <TodayBookingsCard branchId={user?.branchId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/emp/pos" className="bg-blue-600 p-10 rounded-[3rem] group hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/20">
           <div className="flex justify-between items-start">
              <ShoppingBag size={48} className="text-white opacity-40" />
              <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
           </div>
           <h3 className="text-3xl font-black mt-8">Open POS</h3>
           <p className="text-blue-200 font-bold mt-2">Process new sales and orders</p>
        </Link>

        <Link to="/emp/services" className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] group hover:border-slate-600 transition-all">
           <div className="flex justify-between items-start">
              <Wrench size={48} className="text-slate-700" />
              <ArrowRight size={32} className="text-slate-700 group-hover:translate-x-2 transition-transform" />
           </div>
           <h3 className="text-3xl font-black mt-8 text-white">My Services</h3>
           <p className="text-slate-500 font-bold mt-2">Manage assigned technical tasks</p>
        </Link>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
