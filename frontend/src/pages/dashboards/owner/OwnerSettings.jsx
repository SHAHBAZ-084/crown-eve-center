// frontend/src/pages/dashboards/owner/OwnerSettings.jsx
import React from 'react';
import { Settings, Shield, Bell, Globe, Database, Save } from 'lucide-react';

const SettingItem = ({ icon, title, desc, children }) => (
  <div className="flex items-start justify-between p-8 bg-slate-900 border border-slate-800 rounded-[2rem] hover:border-slate-700 transition-all">
    <div className="flex items-start space-x-6">
      <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-400">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-bold">{title}</h4>
        <p className="text-sm text-slate-500 max-w-md">{desc}</p>
      </div>
    </div>
    <div className="flex items-center h-full pt-2">
      {children}
    </div>
  </div>
);

const OwnerSettings = () => {
  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Configuration</h2>
          <p className="text-slate-500">Master-level overrides and global parameters</p>
        </div>
        <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 transition-all">
          <Save size={20} />
          <span>COMMIT CHANGES</span>
        </button>
      </header>

      <div className="space-y-6">
        <SettingItem 
          icon={<Globe />} 
          title="Global Catalog Access" 
          desc="Enable or disable branch-specific part visibility. When off, branches can only see their own local inventory."
        >
          <div className="w-14 h-8 bg-blue-600 rounded-full p-1 flex justify-end">
            <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
          </div>
        </SettingItem>

        <SettingItem 
          icon={<Shield />} 
          title="Master RBAC Policy" 
          desc="Strict enforcement of role-based access. Requires MFA for all Branch Owner and Technician accounts."
        >
          <div className="w-14 h-8 bg-slate-800 rounded-full p-1 flex justify-start">
            <div className="w-6 h-6 bg-slate-600 rounded-full shadow-lg" />
          </div>
        </SettingItem>

        <SettingItem 
          icon={<Bell />} 
          title="Enterprise Alerts" 
          desc="Push notifications for low stock alerts and high-value orders directly to Company Owner dashboard."
        >
          <div className="w-14 h-8 bg-blue-600 rounded-full p-1 flex justify-end">
            <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
          </div>
        </SettingItem>

        <SettingItem 
          icon={<Database />} 
          title="Data Retention" 
          desc="Automatic archival of orders and logs after 24 months. Improves query performance on active data."
        >
          <select className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 font-bold text-sm">
            <option>24 Months</option>
            <option>12 Months</option>
            <option>Indefinite</option>
          </select>
        </SettingItem>
      </div>

      <div className="bg-red-950/20 border border-red-900/30 p-10 rounded-[3rem] space-y-6 mt-12">
        <h4 className="text-xl font-bold text-red-500 flex items-center">
          <Shield size={24} className="mr-3" /> Danger Zone
        </h4>
        <p className="text-sm text-red-900/80 max-w-2xl">These actions are destructive and cannot be undone. System-wide maintenance may be required after execution.</p>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-red-900/20 border border-red-900/50 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Flush System Logs</button>
          <button className="px-6 py-3 bg-red-900/20 border border-red-900/50 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reset Network Stats</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerSettings;
