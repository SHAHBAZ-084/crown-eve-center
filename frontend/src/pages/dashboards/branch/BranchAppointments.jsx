// frontend/src/pages/dashboards/branch/BranchAppointments.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, List, Clock, User, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';

const BranchAppointments = () => {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  const { data, isLoading } = useQuery({
    queryKey: ['branch-appointments', user?.branchId],
    queryFn: () => api.get('/appointments', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId,
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Service Bay</h2>
          <p className="text-slate-500">Managing technical bookings for {user?.branchName}</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
           <button 
            onClick={() => setView('list')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <List size={14} /> <span>List</span>
           </button>
           <button 
            onClick={() => setView('calendar')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${view === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Calendar size={14} /> <span>Calendar</span>
           </button>
        </div>
      </header>

      {view === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? [...Array(4)].map((_, i) => <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-[2rem]" />) : (
            data?.data.map(app => (
              <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 group hover:border-blue-500/50 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                      <Wrench size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{app.service?.name}</h4>
                      <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                         <User size={12} className="mr-1" /> {app.customer?.name}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    app.status === 'BOOKED' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                   <div className="flex items-center space-x-6">
                      <div className="flex items-center text-slate-400 text-xs font-bold uppercase">
                        <Calendar size={14} className="mr-2 text-slate-600" />
                        {new Date(app.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-slate-400 text-xs font-bold uppercase">
                        <Clock size={14} className="mr-2 text-slate-600" />
                        {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                   </div>
                   <button className="text-xs font-black uppercase text-blue-400 hover:underline">Manage</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center space-y-8">
           <div className="flex items-center justify-center space-x-12">
              <button className="p-4 hover:bg-white/5 rounded-full"><ChevronLeft /></button>
              <h3 className="text-4xl font-black italic tracking-tighter">OCTOBER 2026</h3>
              <button className="p-4 hover:bg-white/5 rounded-full"><ChevronRight /></button>
           </div>
           <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[10px] font-black uppercase tracking-widest text-slate-600">{d}</div>
              ))}
              {[...Array(31)].map((_, i) => (
                <div key={i} className={`aspect-square bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-blue-500 cursor-pointer transition-all ${i === 22 ? 'ring-2 ring-blue-600 border-blue-600' : ''}`}>
                   <span className="text-xs font-bold">{i + 1}</span>
                   {i % 4 === 0 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default BranchAppointments;
