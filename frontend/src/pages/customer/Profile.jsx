// frontend/src/pages/customer/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Shield, Save, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="w-24 h-24 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center text-4xl font-black italic shadow-2xl shadow-blue-900/40">
          {user?.name[0]}
        </div>
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">My Profile</h2>
          <p className="text-slate-500 font-medium">Manage your personal settings and security</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
               <Shield size={14} className="mr-2" /> Security
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Change Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none font-bold transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all ${
            isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle size={24} />
              <span>PROFILE SAVED</span>
            </>
          ) : (
            <>
              <Save size={24} />
              <span>UPDATE PROFILE</span>
            </>
          )}
        </button>
      </form>

      <div className="bg-red-950/10 border border-red-900/20 p-10 rounded-[3rem] space-y-4">
         <h4 className="font-bold text-red-500 uppercase tracking-widest text-xs">Account Deactivation</h4>
         <p className="text-sm text-slate-500">Permanently remove your account and data from the Crown Eve Network.</p>
         <button className="text-red-900 hover:text-red-500 font-black text-xs uppercase tracking-widest underline transition-all">Request Deletion</button>
      </div>
    </div>
  );
};

export default Profile;
