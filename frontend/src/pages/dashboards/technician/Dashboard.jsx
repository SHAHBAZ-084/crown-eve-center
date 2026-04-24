// frontend/src/pages/dashboards/TechnicianDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Clock, CheckCircle, Play } from 'lucide-react';
import api from '../../../services/api';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await api.get('/appointments'); // Ideally filter by techId on server
      setTasks(res.data.filter(t => t.techId === user.id || !t.techId));
    };
    fetchTasks();
  }, [user]);

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}`, { status, techId: user.id });
    // refresh
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Service Queue</h2>
        <p className="text-slate-400">Assigned maintenance and repair tasks</p>
      </header>

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{task.service?.name}</h4>
                <p className="text-sm text-slate-400">Customer: {task.customer?.name} • Scheduled: {new Date(task.scheduledAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                task.status === 'BOOKED' ? 'bg-blue-500/10 text-blue-400' : 
                task.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
              
              {task.status === 'BOOKED' && (
                <button onClick={() => updateStatus(task.id, 'IN_PROGRESS')} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all">
                  <Play size={18} />
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button onClick={() => updateStatus(task.id, 'COMPLETED')} className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all">
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
