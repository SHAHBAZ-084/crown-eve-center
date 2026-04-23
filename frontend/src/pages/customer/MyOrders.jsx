// frontend/src/pages/customer/MyOrders.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TableSkeleton from '../../components/skeletons/TableSkeleton';

const OrderRow = ({ order }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden transition-all hover:border-slate-700">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-500 italic font-black text-xs">
            #{order.id}
          </div>
          <div>
            <p className="font-bold">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{order.type} Transaction</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-12">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Amount</p>
            <p className="text-xl font-black italic text-emerald-400">${order.total.toLocaleString()}</p>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            {order.status === 'COMPLETED' ? <CheckCircle size={14} /> : <Clock size={14} />}
            <span>{order.status}</span>
          </div>
          {isOpen ? <ChevronUp size={20} className="text-slate-600" /> : <ChevronDown size={20} className="text-slate-600" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-8 pb-8 border-t border-slate-800"
          >
            <div className="pt-6 space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Items Ordered</h4>
               <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                       <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-slate-600"><Package size={16} /></div>
                          <span className="font-bold text-sm">{item.product?.name || 'Bike Component'}</span>
                       </div>
                       <div className="flex items-center space-x-8">
                          <span className="text-xs text-slate-500 font-bold">Qty: {item.qty}</span>
                          <span className="font-black text-white text-sm">${(item.product?.price * item.qty).toLocaleString()}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MyOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then(r => r.data), // Assumes endpoint exists or uses getAll with filters
  });

  if (isLoading) return <div className="space-y-6"><TableSkeleton /><TableSkeleton /></div>;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">My Orders</h2>
        <p className="text-slate-500 font-medium">Tracking your purchase history and current deliveries</p>
      </header>

      <div className="space-y-6">
        {data?.data.map(order => (
          <OrderRow key={order.id} order={order} />
        ))}
        {data?.data.length === 0 && (
          <div className="py-20 text-center bg-slate-900 rounded-[3rem] border border-slate-800">
             <Package size={48} className="mx-auto text-slate-800 mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
