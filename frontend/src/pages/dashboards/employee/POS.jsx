// frontend/src/pages/dashboards/employee/POS.jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POS = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cart, setCart] = useState([]);
  const debouncedSearch = useDebounce(search, 300);

  const { data: products, isLoading } = useQuery({
    queryKey: ['pos-products', debouncedSearch, category],
    queryFn: () => api.get('/products', { params: { branchId: user?.branchId, search: debouncedSearch, category, limit: 24 } }).then(r => r.data),
  });

  const completeSale = useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData),
    onSuccess: () => {
      setCart([]);
      alert('Sale Completed Successfully!');
    }
  });

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.17;
  const total = subtotal + tax;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-8">
      {/* Left Column: Product Grid */}
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none font-bold"
              />
           </div>
           <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
              {['', 'Road', 'MTB', 'Parts'].map(c => (
                <button 
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${category === c ? 'bg-blue-600' : 'text-slate-500'}`}
                >
                  {c || 'All'}
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 xl:grid-cols-3 gap-6 pr-4 custom-scrollbar">
          {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-[2rem]" />) : (
            products?.data.map(p => (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] text-left hover:border-blue-500 transition-all group active:scale-95"
              >
                <div className="aspect-video bg-slate-950 rounded-xl mb-4 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="font-bold truncate">{p.name}</h4>
                <div className="flex justify-between items-center mt-4">
                   <p className="text-xl font-black italic text-emerald-400">PKR {p.price.toLocaleString()}</p>
                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Plus size={16} /></div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className="w-[400px] bg-slate-900 border border-slate-800 rounded-[3rem] flex flex-col overflow-hidden shadow-2xl">
        <header className="p-8 border-b border-slate-800">
           <h3 className="text-2xl font-black flex items-center italic">
              <ShoppingCart className="mr-3 text-blue-500" /> CART
           </h3>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-bold truncate text-sm">{item.name}</p>
                  <p className="text-emerald-400 font-black text-xs">PKR {(item.price * item.qty).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-slate-900 rounded-lg p-1">
                     <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:text-white text-slate-500"><Minus size={14} /></button>
                     <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                     <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:text-white text-slate-500"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
               <Package size={48} className="opacity-20" />
               <p className="font-bold uppercase tracking-widest text-[10px]">Cart is empty</p>
            </div>
          )}
        </div>

        <footer className="p-8 bg-slate-950 border-t border-slate-800 space-y-6">
           <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                 <span>Subtotal</span>
                 <span>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                 <span>Tax (17%)</span>
                 <span>PKR {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-2xl font-black italic text-white pt-2 border-t border-slate-800">
                 <span>TOTAL</span>
                 <span className="text-blue-500">PKR {total.toLocaleString()}</span>
              </div>
           </div>

           <button 
            disabled={cart.length === 0 || completeSale.isLoading}
            onClick={() => completeSale.mutate({
              branchId: user.branchId,
              type: 'POS',
              items: cart.map(i => ({ productId: i.id, quantity: i.qty, price: i.price })),
              total
            })}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 py-6 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 transition-all"
           >
              {completeSale.isLoading ? 'PROCESSING...' : (
                <>
                  <CheckCircle size={24} />
                  <span>COMPLETE SALE</span>
                </>
              )}
           </button>
        </footer>
      </div>
    </div>
  );
};

export default POS;
