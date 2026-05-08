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
  const [type, setType] = useState(''); // '' (All), 'bike', 'part'
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH', 'ACCOUNT'
  const [transactionId, setTransactionId] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: products, isLoading } = useQuery({
    queryKey: ['pos-products', debouncedSearch, category, type, page],
    queryFn: () => api.get('/products', { 
      params: { 
        branchId: user?.branchId, 
        search: debouncedSearch, 
        category, 
        product_type: type,
        limit: 50,
        page
      } 
    }).then(r => r.data),
  });

  const { data: dynamicCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products').then(r => [...new Set((r.data?.data || r.data || []).map(p => p.category).filter(Boolean))])
  });
  const categories = ['', ...dynamicCategories];

  const completeSale = useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData),
    onSuccess: () => {
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('CASH');
      setTransactionId('');
      alert('Sale Completed Successfully!');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to complete sale. Please check stock availability.');
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
  const total = subtotal;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-8">
      {/* Left Column: Product Grid */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Type Filter & Search */}
        <div className="flex flex-col space-y-3">
          <div className="flex gap-3">
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner">
               {[
                 { label: 'All Products', val: '' },
                 { label: 'Electric Bikes', val: 'bike' },
                 { label: 'Spare Parts', val: 'part' }
               ].map(t => (
                 <button 
                   key={t.val}
                   onClick={() => { setType(t.val); setPage(1); }}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t.val ? 'bg-blue-600 text-orange-600 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {t.label}
                 </button>
               ))}
            </div>
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input 
                 type="text" 
                 placeholder="Search by name, model or item code..." 
                 value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                 className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none font-bold"
               />
            </div>
          </div>
          
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 overflow-x-auto no-scrollbar">
             {categories.map(c => (
               <button 
                 key={c}
                 onClick={() => { setCategory(c); setPage(1); }}
                 className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${category === c ? 'bg-slate-700 text-blue-400' : 'text-slate-500 hover:text-slate-400'}`}
               >
                 {c || 'All Categories'}
               </button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-5 pr-4 custom-scrollbar">
          {isLoading ? [...Array(9)].map((_, i) => <div key={i} className="h-64 bg-slate-900 animate-pulse rounded-[2.5rem]" />) : (
            (products?.data || []).map(p => {
              const mainImg = p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url;
              const imgUrl = mainImg 
                ? (mainImg.startsWith('http') ? mainImg : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${mainImg}`)
                : null;
              const modelName = p.partDetail?.model || p.bikeDetail?.model || "Standard";
              const stock = p.productParts?.reduce((acc, pp) => acc + (pp.part?.inventory?.[0]?.stock || 0), 0) || 0;

              return (
                <button 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-[2rem] text-left hover:border-blue-500/50 hover:bg-slate-900 transition-all group active:scale-95 flex flex-col min-h-[280px] relative overflow-hidden"
                >
                  <div className="w-full h-44 bg-slate-950 rounded-[1.5rem] overflow-hidden border border-slate-800 relative flex-shrink-0">
                     {imgUrl ? (
                        <img 
                          src={imgUrl} 
                          className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" 
                          onError={(e) => { e.target.src = ""; e.target.style.opacity = 0; }}
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10"><Package size={32} /></div>
                     )}
                     <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">{modelName}</span>
                     </div>
                     <div className="absolute top-3 right-3 bg-blue-600/90 px-2.5 py-1 rounded-full shadow-lg">
                        <span className="text-[11px] font-black text-orange-600">PKR {p.price.toLocaleString()}</span>
                     </div>
                  </div>
                  
                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-100 line-clamp-1">{p.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${stock <= 0 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          STOCK: {stock}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">{p.partDetail?.item_code || 'N/A'}</span>
                       <div className="w-8 h-8 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-orange-600 transition-all">
                          <Plus size={16} />
                       </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
          {products?.data?.length === 0 && <div className="col-span-3 h-64 flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest text-xs">No products found</div>}
        </div>

        {/* Pagination */}
        {products?.meta?.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-6 py-2 border-t border-slate-800/50">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              PREV
            </button>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              PAGE <span className="text-blue-500">{page}</span> OF {products.meta.totalPages}
            </div>
            <button 
              disabled={page === products.meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              NEXT
            </button>
          </div>
        )}
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
                     <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:text-orange-600 text-slate-500"><Minus size={14} /></button>
                     <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                     <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:text-orange-600 text-slate-500"><Plus size={14} /></button>
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
              <div className="flex justify-between text-2xl font-black italic text-orange-600 pt-2 border-t border-slate-800">
                 <span>TOTAL</span>
                 <span className="text-blue-500">PKR {total.toLocaleString()}</span>
              </div>
            </div>
 
            {/* Customer Details */}
            <div className="space-y-3 pb-2 border-b border-slate-800/50">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Customer Details</label>
               <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Customer Name" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-[10px] font-bold text-orange-600 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Contact Number" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-[10px] font-bold text-orange-600 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
               </div>
            </div>

            {/* Billing Method Selection */}
            <div className="space-y-3 pt-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Billing Method</label>
               <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${paymentMethod === 'CASH' ? 'bg-blue-600/10 border-blue-600 text-blue-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                  >
                    Cash
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('ACCOUNT')}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${paymentMethod === 'ACCOUNT' ? 'bg-blue-600/10 border-blue-600 text-blue-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                  >
                    Account
                  </button>
               </div>
               
               {paymentMethod === 'ACCOUNT' && (
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                   <input 
                     type="text" 
                     placeholder="Enter Transaction ID..." 
                     value={transactionId}
                     onChange={(e) => setTransactionId(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs font-bold text-orange-600 focus:ring-1 focus:ring-blue-500 outline-none"
                   />
                 </motion.div>
               )}
            </div>

           <button 
            disabled={cart.length === 0 || completeSale.isPending}
            onClick={() => completeSale.mutate({
              branchId: user.branchId,
              type: 'POS',
              payment_method: paymentMethod,
              transaction_id: paymentMethod === 'ACCOUNT' ? transactionId : null,
              customer_name: customerName,
              customer_phone: customerPhone,
              customerId: null,
              notes: 'Walk-in POS Sale',
              items: cart.map(i => ({ productId: i.id, quantity: i.qty, price: i.price })),
              total
            })}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 py-6 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 transition-all"
           >
              {completeSale.isPending ? 'PROCESSING...' : (
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
