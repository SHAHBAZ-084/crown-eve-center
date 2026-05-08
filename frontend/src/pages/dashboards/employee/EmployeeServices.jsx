// frontend/src/pages/dashboards/employee/EmployeeServices.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Wrench, Clock, CheckCircle, User, ArrowRight } from 'lucide-react';

const EmployeeServices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['employee-assigned-services', user?.id],
    queryFn: () => {
      const params = { branchId: user?.branchId };
      if (user?.role === 'TECHNICIAN') params.techId = user.id;
      return api.get('/appointments/today', { params }).then(r => r.data);
    },
    enabled: !!user?.branchId,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/appointments/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['employee-assigned-services']),
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Service Queue</h2>
          <p className="text-slate-500 font-medium">Assigned maintenance and repair tasks</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Shift Active</span>
        </div>
      </header>

      <div className="space-y-6">
        {isLoading ? [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-[3rem]" />) : (
          appointments?.map(app => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-500/50 transition-all shadow-2xl">
              <div className="flex items-center space-x-8 flex-1">
                <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center text-slate-600 group-hover:text-blue-500 transition-colors border border-slate-800">
                  <Wrench size={40} />
                </div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase">{app.service?.name}</h3>
                   <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                         <User size={14} className="mr-2" /> {app.customer?.name}
                      </div>
                      <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                         <Clock size={14} className="mr-2" /> {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full md:w-auto">
                {app.status === 'BOOKED' ? (
                  <button 
                    onClick={() => updateStatus.mutate({ id: app.id, status: 'IN_PROGRESS' })}
                    className="flex-1 md:flex-none px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20"
                  >
                    START WORK
                  </button>
                ) : app.status === 'IN_PROGRESS' ? (
                  <button 
                    onClick={() => updateStatus.mutate({ id: app.id, status: 'COMPLETED' })}
                    className="flex-1 md:flex-none px-10 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20"
                  >
                    MARK COMPLETE
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-emerald-400 font-black uppercase text-xs tracking-widest">
                    <CheckCircle size={20} />
                    <span>DONE</span>
                  </div>
                )}
                <button className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-600 hover:text-orange-600 transition-all">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))
        )}

        {appointments?.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-20 text-center space-y-4">
             <Wrench size={48} className="mx-auto text-slate-800" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No services assigned for today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeServices;
