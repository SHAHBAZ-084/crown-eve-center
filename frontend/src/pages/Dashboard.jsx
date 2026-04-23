import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, Wrench, AlertCircle, ArrowRight, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="glass-card p-8 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -mr-10 -mt-10 blur-2xl transition-all group-hover:opacity-10`}></div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">{title}</p>
        <h3 className="text-3xl font-bold font-heading">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-emerald-500 text-xs font-bold">{trend}</span>
            <span className="text-gray-600 text-xs font-medium ml-1">vs last month</span>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color.replace('bg-', 'bg-opacity-10 ')} ${color.replace('bg-', 'text-')}`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold font-heading">
            Welcome Back, <span className="premium-gradient-text">{user?.name.split(' ')[0]}</span>
          </h2>
          <p className="text-gray-500 mt-1 font-medium italic">Operational overview for {user?.branchName || 'Crown Eve Center'}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <Activity size={18} className="text-cyan-400" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">System Live</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenue" 
          value="$24.5k" 
          icon={<TrendingUp size={24} />} 
          color="bg-cyan-500" 
          trend="+12.4%"
        />
        <StatCard 
          title="Riders" 
          value="1,240" 
          icon={<Users size={24} />} 
          color="bg-blue-500" 
          trend="+8.2%"
        />
        <StatCard 
          title="Stock" 
          value="850" 
          icon={<Package size={24} />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Services" 
          value="12" 
          icon={<Wrench size={24} />} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Orders */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-heading">Recent Transactions</h3>
            <button className="text-cyan-500 hover:text-cyan-400 transition-colors text-xs font-bold flex items-center gap-2">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0a0c10] flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                    <div className="text-[10px] font-bold text-gray-500">#{1024 + i}</div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-200">Arslan Khan</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">2 mins ago • POS Terminal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-lg">$1,200.00</p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Watchlist */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-heading">Critical Inventory</h3>
            <span className="bg-red-500/10 text-red-500 text-[10px] px-3 py-1 rounded-full font-black flex items-center uppercase tracking-widest">
              <AlertCircle size={12} className="mr-1.5" /> 3 Low Stock
            </span>
          </div>
          <div className="space-y-4">
            {['Shimano Brake Pads', 'KMC Chain X11', 'Maxxis Ardent Tire'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/20 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/5 flex items-center justify-center text-red-500 group-hover:bg-red-500/10 transition-colors">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-200">{item}</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">SKU: CEB-PART-{200 + i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-red-500 text-lg">{i + 2}</p>
                  <p className="text-[8px] uppercase tracking-tighter text-gray-600 font-bold">Units Available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
