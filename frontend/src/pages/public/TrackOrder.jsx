// frontend/src/pages/public/TrackOrder.jsx
import React, { useState } from 'react';
import { Search, MapPin, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import api from '../../services/api';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}`); // This would need a public endpoint or logic
      setOrder(res.data);
    } catch (err) {
      alert('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Confirmed', status: 'COMPLETED', icon: <CheckCircle /> },
    { label: 'Processing', status: 'PROCESSING', icon: <Package /> },
    { label: 'On its way', status: 'SHIPPED', icon: <Truck /> },
    { label: 'Delivered', status: 'DELIVERED', icon: <MapPin /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Track Your Build</h1>
        <p className="text-slate-400">Enter your order reference ID to see live progress.</p>
      </div>

      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
        <input 
          type="text" 
          placeholder="e.g. CEB-123456" 
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-6 pl-14 pr-32 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button 
          onClick={handleTrack}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-bold transition-all"
        >
          {loading ? '...' : 'Track'}
        </button>
      </div>

      {order && (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-12 animate-in fade-in slide-in-from-bottom-10">
          <header className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Order Reference</p>
              <h2 className="text-2xl font-bold">#{order.id}</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Estimated Delivery</p>
              <h2 className="text-xl font-bold text-blue-400">Oct 24, 2026</h2>
            </div>
          </header>

          <div className="relative py-10">
            {/* Progress Bar */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 transition-all duration-1000" style={{ width: '66%' }} />
            
            <div className="relative flex justify-between">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                    i <= 2 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${i <= 2 ? 'text-white' : 'text-slate-600'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800">
            <div className="space-y-2">
              <h4 className="font-bold flex items-center"><Truck size={18} className="mr-2 text-slate-500" /> Shipping Address</h4>
              <p className="text-slate-400 leading-relaxed">
                John Doe<br />
                123 Cycling Way, Gear District<br />
                New York, NY 10001
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold flex items-center"><Clock size={18} className="mr-2 text-slate-500" /> Recent Activity</h4>
              <div className="space-y-4">
                <div className="flex space-x-3 text-sm">
                  <span className="text-slate-600 font-medium">10:45 AM</span>
                  <span className="text-slate-300">Package arrived at local sorting facility.</span>
                </div>
                <div className="flex space-x-3 text-sm">
                  <span className="text-slate-600 font-medium">Yesterday</span>
                  <span className="text-slate-300">Build completed at Main Branch. Quality checked.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
