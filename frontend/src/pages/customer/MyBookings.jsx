// frontend/src/pages/customer/MyBookings.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Calendar, Wrench, Clock, MapPin, AlertCircle, X } from 'lucide-react';
import CardSkeleton from '../../components/skeletons/CardSkeleton';

const MyBookings = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/appointments/my').then(r => r.data),
  });

  const cancelBooking = useMutation({
    mutationFn: (id) => api.put(`/appointments/${id}`, { status: 'CANCELLED' }),
    onSuccess: () => queryClient.invalidateQueries(['my-bookings']),
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><CardSkeleton /><CardSkeleton /></div>;

  const upcoming = data?.data.filter(b => b.status === 'BOOKED' || b.status === 'IN_PROGRESS') || [];
  const past = data?.data.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED') || [];

  const BookingCard = ({ booking, isPast = false }) => (
    <div className={`bg-slate-900 border rounded-[2.5rem] p-8 space-y-6 transition-all ${isPast ? 'border-slate-800 opacity-60' : 'border-blue-900/30 hover:border-blue-500/50 shadow-2xl shadow-blue-900/5'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPast ? 'bg-slate-800 text-slate-500' : 'bg-blue-600/10 text-blue-400'}`}>
            <Wrench size={28} />
          </div>
          <div>
            <h4 className="text-xl font-bold">{booking.service?.name}</h4>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: #{booking.id}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 
          booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center text-slate-400 text-xs font-bold uppercase">
          <Calendar size={16} className="mr-2 text-slate-600" />
          {new Date(booking.scheduledAt).toLocaleDateString()}
        </div>
        <div className="flex items-center text-slate-400 text-xs font-bold uppercase">
          <Clock size={16} className="mr-2 text-slate-600" />
          {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center text-slate-400 text-xs font-bold uppercase col-span-2">
          <MapPin size={16} className="mr-2 text-slate-600" />
          {booking.branch?.name}
        </div>
      </div>

      {!isPast && booking.status === 'BOOKED' && (
        <div className="pt-6 border-t border-slate-800 flex space-x-4">
          <button className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Reschedule</button>
          <button 
            onClick={() => { if(window.confirm('Cancel this booking?')) cancelBooking.mutate(booking.id) }}
            className="px-6 py-4 border border-red-900/50 text-red-900 hover:bg-red-900 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">My Bookings</h2>
          <p className="text-slate-500 font-medium">Managing your professional service appointments</p>
        </div>
        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all">
          Book New Service
        </button>
      </header>

      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
          <Clock size={14} className="mr-2" /> Upcoming Jobs
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcoming.map(b => <BookingCard key={b.id} booking={b} />)}
          {upcoming.length === 0 && <p className="text-slate-600 italic text-sm">No upcoming appointments.</p>}
        </div>
      </section>

      {past.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-900">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
            <AlertCircle size={14} className="mr-2" /> Service History
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {past.map(b => <BookingCard key={b.id} booking={b} isPast />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyBookings;
