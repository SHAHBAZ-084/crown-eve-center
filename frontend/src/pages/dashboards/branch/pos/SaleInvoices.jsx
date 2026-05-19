// pos/SaleInvoices.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { Icon } from '../../../../components/branch/BranchShared';
import { Search, Trash2 } from 'lucide-react';
import { useDebounce } from '../../../../hooks/useDebounce';
import './SaleInvoices.css';

const SaleInvoices = ({ user, queryClient, onInvoiceGenerated }) => {
  const [siForm, setSiForm] = useState({
    type: 'bike',
    items: [],
    customerId: '',
    paymentMethod: 'CASH',
    amount: '',
    bankId: ''
  });
  const [siItemSearch, setSiItemSearch] = useState('');
  const [siCustomerSearch, setSiCustomerSearch] = useState('');
  const debouncedSiItemSearch = useDebounce(siItemSearch, 300);
  const debouncedSiCustomerSearch = useDebounce(siCustomerSearch, 300);

  const { data: siItems, isLoading: loadingSiItems } = useQuery({
    queryKey: ['si-items', siForm.type, debouncedSiItemSearch],
    queryFn: () => api.get('/products', {
      params: { branchId: user?.branchId, product_type: siForm.type, search: debouncedSiItemSearch, limit: 50 }
    }).then(r => r.data),
    enabled: !!debouncedSiItemSearch
  });

  const { data: siCustomers, isLoading: loadingSiCustomers } = useQuery({
    queryKey: ['si-customers', debouncedSiCustomerSearch],
    queryFn: () => api.get('/walk-in-customers', {
      params: { branchId: user?.branchId, search: debouncedSiCustomerSearch, limit: 50 }
    }).then(r => r.data),
    enabled: !!debouncedSiCustomerSearch
  });

  const handleSiSubmit = async (e) => {
    e.preventDefault();
    if (siForm.items.length === 0) return alert('Please add at least one product');
    if (!siForm.customerId) return alert('Please select a customer');
    if (!siForm.amount || siForm.amount <= 0) return alert('Please enter a valid amount');
    try {
      const payload = {
        branchId: user?.branchId,
        walkInCustomerId: siForm.customerId,
        bankId: siForm.paymentMethod === 'BANK' ? siForm.bankId : null,
        payment_method: siForm.paymentMethod,
        total: parseFloat(siForm.amount),
        type: 'POS',
        items: siForm.items.map(item => ({
          productId: item.id,
          quantity: item.qty,
          price: item.price
        }))
      };
      const res = await api.post('/orders', payload);
      onInvoiceGenerated(res.data);
      setSiForm({ ...siForm, items: [], amount: '', bankId: '', customerId: '' });
      setSiItemSearch('');
      setSiCustomerSearch('');
      queryClient.invalidateQueries(['si-items']);
      queryClient.invalidateQueries(['si-customers']);
    } catch (err) {
      alert('Failed to generate invoice: ' + (err.response?.data?.message || err.message));
    }
  };

  const addItemToSi = (product) => {
    setSiForm(prev => {
      const exists = prev.items.find(i => i.id === product.id);
      if (exists) {
        const newItems = prev.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
        return { ...prev, items: newItems, amount: newItems.reduce((s, i) => s + i.price * i.qty, 0) };
      }
      const newItem = {
        id: product.id, name: product.name, price: product.price, qty: 1,
        stock: product.stock_qty,
        model: product.partDetail?.model || product.bikeDetail?.motor_type || 'N/A',
        description: product.partDetail?.description || product.bikeDetail?.battery_type || ''
      };
      const newItems = [...prev.items, newItem];
      return { ...prev, items: newItems, amount: newItems.reduce((s, i) => s + i.price * i.qty, 0) };
    });
    setSiItemSearch('');
  };

  const updateItemQty = (id, delta) => {
    setSiForm(prev => {
      const newItems = prev.items.map(i => {
        if (i.id === id) { const q = Math.max(1, Math.min(i.stock, i.qty + delta)); return { ...i, qty: q }; }
        return i;
      });
      return { ...prev, items: newItems, amount: newItems.reduce((s, i) => s + i.price * i.qty, 0) };
    });
  };

  const removeItemFromSi = (id) => {
    setSiForm(prev => {
      const newItems = prev.items.filter(i => i.id !== id);
      return { ...prev, items: newItems, amount: newItems.reduce((s, i) => s + i.price * i.qty, 0) };
    });
  };

  return (
    <div className="sale-invoices-container flex flex-col h-full space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F3E5DC] shadow-sm max-w-5xl mx-auto w-full">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-[#2D1A12] uppercase tracking-tight">Generate Sale Invoice</h2>
          <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.3em] mt-2">Professional Billing Terminal</p>
        </div>

        <form onSubmit={handleSiSubmit} className="space-y-10">
          {/* Category Toggle */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Product Category</label>
            <div className="flex gap-4 p-2 bg-[#FFFAF8] border border-[#F3E5DC] rounded-[2rem] w-fit">
              <button type="button" onClick={() => setSiForm({ ...siForm, type: 'bike' })}
                className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${siForm.type === 'bike' ? 'bg-[#E65100] text-white shadow-lg shadow-[#E65100]/20' : 'text-[#8D7A71] hover:bg-white'}`}>
                <Icon n="dashboard" size={16} /> Electric Bikes
              </button>
              <button type="button" onClick={() => setSiForm({ ...siForm, type: 'part' })}
                className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${siForm.type === 'part' ? 'bg-[#E65100] text-white shadow-lg shadow-[#E65100]/20' : 'text-[#8D7A71] hover:bg-white'}`}>
                <Icon n="inventory" size={16} /> Spare Parts
              </button>
            </div>
          </div>

          {/* Item Search */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Quick Add {siForm.type === 'bike' ? 'Bike' : 'Part'}</label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
                <input type="text" placeholder={`Search ${siForm.type} by name, model or description...`}
                  value={siItemSearch} onChange={e => setSiItemSearch(e.target.value)}
                  className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-5 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
              </div>
              {siItemSearch && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-[#F3E5DC] rounded-3xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar">
                  {loadingSiItems ? (
                    <div className="p-6 text-center animate-pulse text-[#8D7A71] text-xs font-bold uppercase">Searching database...</div>
                  ) : siItems?.data?.length === 0 ? (
                    <div className="p-6 text-center text-[#8D7A71] text-xs font-bold uppercase">No matching items found</div>
                  ) : siItems?.data?.map(item => (
                    <div key={item.id} onClick={() => addItemToSi(item)}
                      className="px-6 py-4 hover:bg-[#FFFAF8] cursor-pointer border-b border-[#F3E5DC] last:border-none group">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-black text-[#2D1A12] text-sm uppercase group-hover:text-[#E65100] transition-colors">{item.name}</div>
                        <div className="text-[#E65100] font-black text-xs">PKR {item.price.toLocaleString()}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-tighter">
                          Model: <span className="text-[#2D1A12]">{item.partDetail?.model || item.bikeDetail?.motor_type || 'Standard'}</span> •{' '}
                          Stock: <span className={item.stock_qty > 0 ? 'text-emerald-600' : 'text-red-600'}>{item.stock_qty} Units</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Items Table */}
          {siForm.items.length > 0 && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Invoice Items</label>
              <div className="bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F3E5DC]/30 border-b border-[#F3E5DC]">
                      <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Item Description</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-center">Qty</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-right">Unit Price</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-right">Total</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siForm.items.map(item => (
                      <tr key={item.id} className="border-b border-[#F3E5DC] last:border-none">
                        <td className="px-6 py-4">
                          <div className="font-black text-[#2D1A12] text-xs uppercase">{item.name}</div>
                          <div className="text-[9px] font-bold text-[#8D7A71] uppercase tracking-tighter">Model: {item.model}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button type="button" onClick={() => updateItemQty(item.id, -1)} className="w-6 h-6 rounded-full bg-white border border-[#F3E5DC] flex items-center justify-center text-xs font-black hover:bg-[#F3E5DC]">−</button>
                            <span className="font-black text-xs w-6 text-center">{item.qty}</span>
                            <button type="button" onClick={() => updateItemQty(item.id, 1)} className="w-6 h-6 rounded-full bg-white border border-[#F3E5DC] flex items-center justify-center text-xs font-black hover:bg-[#F3E5DC]">+</button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-xs">PKR {item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-black text-xs text-[#E65100]">PKR {(item.price * item.qty).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <button type="button" onClick={() => removeItemFromSi(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-10">
            {/* Customer Select */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Assign Customer</label>
              <div className="relative">
                <Icon n="user" className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
                <input type="text" placeholder="Search name or phone..." value={siCustomerSearch}
                  onChange={e => { setSiCustomerSearch(e.target.value); if (siForm.customerId) setSiForm({ ...siForm, customerId: '' }); }}
                  className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-5 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
                {siCustomerSearch && !siForm.customerId && (
                  <div className="absolute z-10 left-0 right-0 mt-2 bg-white border border-[#F3E5DC] rounded-3xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                    {loadingSiCustomers ? (
                      <div className="p-6 text-center animate-pulse text-[#8D7A71] text-xs font-bold uppercase">Fetching records...</div>
                    ) : siCustomers?.data?.length === 0 ? (
                      <div className="p-6 text-center text-[#8D7A71] text-xs font-bold uppercase">Customer not found</div>
                    ) : siCustomers?.data?.map(cust => (
                      <div key={cust.id} onClick={() => { setSiForm({ ...siForm, customerId: cust.id }); setSiCustomerSearch(`${cust.first_name} ${cust.last_name} (${cust.phone})`); }}
                        className="px-6 py-4 hover:bg-[#FFFAF8] cursor-pointer border-b border-[#F3E5DC] last:border-none">
                        <div className="font-black text-[#2D1A12] text-sm uppercase">{cust.first_name} {cust.last_name}</div>
                        <div className="text-[10px] font-bold text-[#8D7A71] tracking-widest">{cust.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total Summary */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Invoice Summary</label>
              <div className="bg-[#E65100] p-8 rounded-[2rem] text-white shadow-xl shadow-[#E65100]/20">
                <div className="text-[10px] font-bold text-[#FFFAF8]/80 uppercase tracking-[0.2em] mb-2">Total Bill Amount</div>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80 font-black text-xl">PKR</span>
                  <input type="number" value={siForm.amount} onChange={e => setSiForm({ ...siForm, amount: e.target.value })} placeholder="0"
                    className="w-full bg-transparent border-b-2 border-white/30 py-2 pl-12 pr-4 outline-none focus:border-white font-black text-4xl text-white placeholder-white/30 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full bg-[#2D1A12] text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-[#E65100] hover:scale-[1.01] active:scale-95 transition-all mt-6 flex items-center justify-center gap-4">
            <Icon n="check" size={20} /> Complete Sale &amp; Print Invoice
          </button>
        </form>
      </div>
    </div>
  );
};

export default SaleInvoices;
