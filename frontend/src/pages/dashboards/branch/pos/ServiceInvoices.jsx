// frontend/src/pages/dashboards/branch/pos/ServiceInvoices.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { Icon } from '../../../../components/branch/BranchShared';
import { Search, Plus, X, MessageCircle, Home, FileText, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  getWalkInCustomerName,
  getWalkInCustomerPhone,
  generateServiceId,
  formatDate,
  formatTime12Hour
} from './utils';
import './ServiceInvoices.css';

const ServiceInvoices = ({ user, queryClient, onPrintReceipt }) => {
  const [svForm, setSvForm] = useState({
    customerId: '',
    serviceId: '',
    basePrice: 0,
    labor: 0,
    parts: 0,
    selectedParts: [],
    customerNotes: '',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: new Date().toTimeString().slice(0, 5)
  });

  const [svPartSearch, setSvPartSearch] = useState('');
  const [svCustomerSearch, setSvCustomerSearch] = useState('');
  const [svHistorySearch, setSvHistorySearch] = useState('');
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);

  const debouncedSvPartSearch = useDebounce(svPartSearch, 300);
  const debouncedSvCustomerSearch = useDebounce(svCustomerSearch, 300);

  // Queries
  const { data: svServices } = useQuery({
    queryKey: ['sv-services', user?.branchId],
    queryFn: () => api.get('/services', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  const { data: svCustomers, isLoading: loadingSvCustomers } = useQuery({
    queryKey: ['sv-customers', debouncedSvCustomerSearch],
    queryFn: () => api.get('/walk-in-customers', {
      params: { branchId: user?.branchId, search: debouncedSvCustomerSearch, limit: 50 }
    }).then(r => r.data),
    enabled: !!debouncedSvCustomerSearch
  });

  const { data: svParts, isLoading: loadingSvParts } = useQuery({
    queryKey: ['sv-parts', debouncedSvPartSearch],
    queryFn: () => api.get('/products', {
      params: { branchId: user?.branchId, search: debouncedSvPartSearch, limit: 10 }
    }).then(r => r.data),
    enabled: !!debouncedSvPartSearch
  });

  const { data: svHistory, refetch: refetchSvHistory } = useQuery({
    queryKey: ['sv-history', user?.branchId],
    queryFn: () => api.get('/appointments', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  const handleSvDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service invoice?")) {
      try {
        await api.delete('/appointments/' + id);
        refetchSvHistory();
      } catch (err) {
        alert("Failed to delete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSvComplete = async (id, currentStatus) => {
    if (currentStatus === 'COMPLETED') return alert("This service is already completed!");
    if (window.confirm("Mark this service as COMPLETED?")) {
      try {
        await api.put('/appointments/' + id, { status: 'COMPLETED' });
        refetchSvHistory();
      } catch (err) {
        alert("Failed to complete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSvSubmit = async (e) => {
    e.preventDefault();
    if (!svForm.customerId && !svCustomerSearch.trim()) return alert("Please select or type a customer name");
    if (!svForm.serviceId) return alert("Please select a service type");

    try {
      const selectedServiceObj = (svServices || []).find(s => s.id === svForm.serviceId);
      const serviceName = selectedServiceObj ? selectedServiceObj.name : "Bike Maintenance";
      let customerName = "Walk-in Customer";
      let customerPhone = "";
      
      if (svCustomerSearch.trim()) {
        const match = svCustomerSearch.match(/(.*?)\s*\(([^)]+)\)/);
        if (match) {
          customerName = match[1].trim();
          customerPhone = match[2].trim();
        } else {
          customerName = svCustomerSearch.trim();
        }
      }

      const partsTotal = svForm.selectedParts.reduce((sum, p) => sum + (p.price * p.qty), 0);
      const grandTotal = (parseFloat(svForm.labor) || 0) + partsTotal;

      const partsListStr = svForm.selectedParts.map(p => `${p.name}|${p.model || ""}|${p.price}|${p.qty}`).join(", ");
      const finalNotes = partsListStr 
        ? `Walk-in Service: ${customerName} (${customerPhone}) | Remarks: ${svForm.customerNotes || ""} | Bill: Labor ${svForm.labor}, Parts ${partsTotal} [${partsListStr}]`
        : `Walk-in Service: ${customerName} (${customerPhone}) | Remarks: ${svForm.customerNotes || ""} | Bill: Labor ${svForm.labor}, Parts ${partsTotal}`;

      const payload = {
        serviceId: svForm.serviceId,
        branchId: Number(user?.branchId),
        booking_date: svForm.bookingDate,
        booking_time: svForm.bookingTime,
        status: "COMPLETED",
        customer_notes: finalNotes,
        final_price: grandTotal,
        partsUsed: svForm.selectedParts.map((p) => ({
          productId: p.id,
          quantity: p.qty,
          price: p.price,
          name: p.name,
        })),
      };

      await api.post('/appointments', payload);
      alert("Walk-in service ticket created — parts stock updated!");
      setSvForm({
        customerId: '',
        serviceId: '',
        basePrice: 0,
        labor: 0,
        parts: 0,
        selectedParts: [],
        customerNotes: '',
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: new Date().toTimeString().slice(0, 5)
      });
      setSvCustomerSearch("");
      setSvPartSearch("");
      setShowNewServiceModal(false);
      refetchSvHistory();
      queryClient.invalidateQueries({ queryKey: ['sv-parts'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products-list'] });
    } catch (err) {
      alert("Failed to submit service invoice: " + (err.response?.data?.message || err.message));
    }
  };

  const handleServiceSelect = (serviceId) => {
    const selected = (svServices || []).find(s => s.id === serviceId);
    if (selected) {
      setSvForm(prev => ({
        ...prev,
        serviceId,
        basePrice: selected.base_price,
        labor: selected.base_price
      }));
    } else {
      setSvForm(prev => ({
        ...prev,
        serviceId: '',
        basePrice: 0,
        labor: 0
      }));
    }
  };

  const addPartToSv = (product) => {
    if (product.stock_qty <= 0) {
      alert(`Insufficient stock! "${product.name}" is out of stock.`);
      return;
    }
    setSvForm(prev => {
      const exists = prev.selectedParts.find(p => p.id === product.id);
      if (exists) {
        if (exists.qty + 1 > (exists.stock ?? product.stock_qty)) {
          alert(`Insufficient stock! Only ${exists.stock ?? product.stock_qty} unit(s) available.`);
          return prev;
        }
        return {
          ...prev,
          selectedParts: prev.selectedParts.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p)
        };
      }
      return {
        ...prev,
        selectedParts: [...prev.selectedParts, {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          stock: product.stock_qty,
          model: product.partDetail?.model || ""
        }]
      };
    });
    setSvPartSearch("");
  };

  const updateSvPartQty = (id, delta) => {
    setSvForm(prev => {
      let overStock = false;
      const newParts = prev.selectedParts.map(p => {
        if (p.id !== id) return p;
        const nextQty = p.qty + delta;
        if (nextQty > (p.stock ?? 0)) {
          overStock = true;
          return p;
        }
        return { ...p, qty: Math.max(1, nextQty) };
      });
      if (overStock) {
        alert("Insufficient stock! Cannot exceed available quantity.");
        return prev;
      }
      return { ...prev, selectedParts: newParts };
    });
  };

  const removeSvPart = (id) => {
    setSvForm(prev => ({
      ...prev,
      selectedParts: prev.selectedParts.filter(p => p.id !== id)
    }));
  };

  const partsTotal = svForm.selectedParts.reduce((sum, p) => sum + (p.price * p.qty), 0);
  const grandTotal = (parseFloat(svForm.labor) || 0) + partsTotal;

  const svHistoryList = Array.isArray(svHistory) ? svHistory : (svHistory?.data || []);
  let sortedHistory = [...svHistoryList].sort((a, b) => {
    const dateA = new Date((a.booking_date || "") + "T" + (a.booking_time || "00:00"));
    const dateB = new Date((b.booking_date || "") + "T" + (b.booking_time || "00:00"));
    return dateB - dateA;
  });

  if (svHistorySearch.trim()) {
    sortedHistory = sortedHistory.filter(item => {
      const displayId = generateServiceId(item.id);
      return displayId.includes(svHistorySearch.trim());
    });
  }

  return (
    <div className="service-invoices-container flex flex-col h-full space-y-6">
      {/* Service Invoices History Dashboard */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#F3E5DC] shadow-sm max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-[#F3E5DC] gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#2D1A12] uppercase tracking-tight">Service Invoices</h2>
            <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.2em] mt-1">Manage and track walk-in customer services</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={16} />
              <input 
                type="text" 
                value={svHistorySearch}
                onChange={e => setSvHistorySearch(e.target.value)}
                placeholder="Search Service ID..."
                className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-full py-3.5 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-xs"
              />
            </div>
            <button 
              onClick={() => setShowNewServiceModal(true)}
              className="w-full sm:w-auto whitespace-nowrap bg-[#E65100] text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Service Invoice
            </button>
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFAF8] rounded-[2rem] border border-dashed border-[#F3E5DC]">
            <div className="text-4xl mb-4">🔧</div>
            <p className="font-black text-[#2D1A12] uppercase tracking-wider text-sm">No Service History Found</p>
            <p className="text-xs text-[#8D7A71] mt-1">Try adjusting your search or issue a new service invoice.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F3E5DC] text-[9px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 whitespace-nowrap">ID &amp; Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Customer Info</th>
                  <th className="px-6 py-4 whitespace-nowrap">Service Details</th>
                  <th className="px-6 py-4 text-center min-w-[240px]">Actions</th>
                  <th className="px-4 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((item) => {
                  const name = getWalkInCustomerName(item.customer_notes);
                  const phone = getWalkInCustomerPhone(item.customer_notes);
                  const serviceName = item.service?.name || "Maintenance & Tuning";
                  const displayId = generateServiceId(item.id);
                  const formattedDate = formatDate(item.booking_date);
                  const formattedTime = formatTime12Hour(item.booking_time);
                  const isCompleted = item.status === "COMPLETED";

                  return (
                    <tr key={item.id} className="border-b border-[#F3E5DC] last:border-none hover:bg-[#FFFAF8] transition-colors group">
                      {/* ID & Status */}
                      <td className="px-6 py-5 align-middle">
                        <div className="flex flex-col items-start gap-2.5">
                          <span className="px-3 py-1.5 rounded-lg text-[11px] font-black text-[#E65100] bg-[#FFF6F0] uppercase tracking-wider">
                            #{displayId}
                          </span>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {isCompleted ? "COMPLETED" : item.status}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5 align-middle">
                        <h3 className="font-black text-sm text-[#2D1A12] leading-tight mb-2.5 truncate max-w-[200px]">{name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="bg-white border border-[#F3E5DC] px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#8D7A71] shadow-sm">{phone || "N/A"}</div>
                          {phone && (
                            <a href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20 hover:scale-105 active:scale-95">
                              <MessageCircle size={14} fill="currentColor" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Service & Date */}
                      <td className="px-6 py-5 align-middle">
                        <p className="font-bold text-xs text-[#E65100] mb-2 truncate max-w-[200px]">{serviceName}</p>
                        <div className="bg-[#FFF6F0] border border-[#F3E5DC] border-dashed rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-[10px] font-bold text-[#2D1A12] w-max mb-2">
                          <Home size={12} className="text-[#8D7A71]" />
                          <span>{formattedDate} @ {formattedTime}</span>
                        </div>
                        <div className="font-black text-xs text-[#2D1A12]">PKR {item.final_price?.toLocaleString() || 0}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 align-middle">
                        <div className="flex flex-col gap-2 w-full max-w-[240px] mx-auto">
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => alert("Scheduling module coming soon")} className="bg-[#FFF6F0] text-[#2D1A12] py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#FFE0CC] transition-colors">
                              <Home size={12} /> Schedule
                            </button>
                            <button onClick={() => onPrintReceipt(item, 'BILL')} className="bg-[#1A1A1A] text-white py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-black transition-colors shadow-sm">
                              <FileText size={12} /> Billing
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onPrintReceipt(item, 'TICKET')} className="bg-white border border-[#E65100] text-[#E65100] py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#FFF6F0] transition-colors">
                              <Calendar size={12} /> Ticket
                            </button>
                            <button onClick={() => handleSvComplete(item.id, item.status)} className="bg-white border border-emerald-500 text-emerald-500 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition-colors">
                              <FileText size={12} /> Complete
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Edit/Delete */}
                      <td className="px-4 py-5 align-middle pr-6">
                        <div className="flex flex-col gap-2 justify-center items-end">
                           <button onClick={() => alert("Edit invoice coming soon")} className="w-8 h-8 rounded-xl bg-[#FFF6F0] text-[#E65100] flex items-center justify-center hover:bg-[#FFE0CC] transition-colors shadow-sm">
                             <Edit2 size={13} />
                           </button>
                           <button onClick={() => handleSvDelete(item.id)} className="w-8 h-8 rounded-xl bg-[#FFF6F0] text-[#E65100] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm">
                             <Trash2 size={13} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Service Invoice Modal */}
      {showNewServiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewServiceModal(false)} />
          
          <div className="relative bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <header className="px-10 py-7 border-b border-[#F3E5DC] flex justify-between items-center bg-[#FFFAF8]">
              <div>
                <h2 className="text-xl font-black text-[#2D1A12] uppercase tracking-tight">Walk-in Customer Service Bay</h2>
                <p className="text-[9px] font-bold text-[#8D7A71] uppercase tracking-[0.2em] mt-0.5">Generate new maintenance service invoice</p>
              </div>
              <button 
                className="w-8 h-8 bg-white border border-[#F3E5DC] rounded-full flex items-center justify-center text-[#8D7A71] hover:bg-[#F3E5DC] transition-all" 
                onClick={() => setShowNewServiceModal(false)}
              >
                <X size={16} />
              </button>
            </header>

            <div className="overflow-y-auto p-10">
              <form onSubmit={handleSvSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Walk-in Customer *</label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
                        <input 
                          type="text" 
                          value={svCustomerSearch} 
                          onChange={e => {
                            setSvCustomerSearch(e.target.value);
                            if (svForm.customerId) setSvForm({ ...svForm, customerId: '' });
                          }}
                          placeholder="Search walk-in customer by name or phone..."
                          className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-4.5 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                        />
                      </div>
                      {svCustomerSearch && !svForm.customerId && (
                        <div className="absolute z-10 left-0 right-0 mt-2 bg-white border border-[#F3E5DC] rounded-3xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                          {loadingSvCustomers ? (
                            <div className="p-6 text-center animate-pulse text-[#8D7A71] text-xs font-bold uppercase">Searching...</div>
                          ) : svCustomers?.data?.length === 0 ? (
                            <div className="p-6 text-center text-[#8D7A71] text-xs font-bold uppercase">Customer not found</div>
                          ) : (
                            (svCustomers?.data || []).map(c => (
                              <div 
                                key={c.id} 
                                onClick={() => {
                                  setSvForm({ ...svForm, customerId: c.id });
                                  setSvCustomerSearch(`${c.first_name} ${c.last_name} (${c.phone})`);
                                }}
                                className="px-6 py-4 hover:bg-[#FFFAF8] cursor-pointer border-b border-[#F3E5DC] last:border-none"
                              >
                                <div className="font-black text-[#2D1A12] text-sm uppercase">{c.first_name} {c.last_name}</div>
                                <div className="text-[10px] font-bold text-[#8D7A71] tracking-widest">{c.phone}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Service Type *</label>
                    <select 
                      required
                      value={svForm.serviceId} 
                      onChange={e => handleServiceSelect(e.target.value)}
                      className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-4.5 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                    >
                      <option value="">Select Service...</option>
                      {(svServices || []).map(s => (
                        <option key={s.id} value={s.id}>{s.name} (PKR {s.base_price})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Add Parts */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Add Spare Parts Used (Optional)</label>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
                    <input 
                      type="text" 
                      value={svPartSearch} 
                      onChange={e => setSvPartSearch(e.target.value)}
                      placeholder="Type to search branch spare parts used in service..."
                      className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-5 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                    />
                    {svPartSearch && (
                      <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-[#F3E5DC] rounded-3xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                        {loadingSvParts ? (
                          <div className="p-6 text-center animate-pulse text-[#8D7A71] text-xs font-bold uppercase">Searching...</div>
                        ) : svParts?.data?.length === 0 ? (
                          <div className="p-6 text-center text-[#8D7A71] text-xs font-bold uppercase">No matching spare parts found</div>
                        ) : (
                          (svParts?.data || []).map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => addPartToSv(p)}
                              className="px-6 py-4 hover:bg-[#FFFAF8] cursor-pointer border-b border-[#F3E5DC] last:border-none flex justify-between items-center group"
                            >
                              <div>
                                <div className="font-black text-[#2D1A12] text-sm uppercase group-hover:text-[#E65100] transition-colors">{p.name}</div>
                                <div className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-tighter">Model: {p.partDetail?.model || "N/A"} • Stock: {p.stock_qty} Units</div>
                              </div>
                              <div className="text-[#E65100] font-black text-xs">PKR {p.price.toLocaleString()}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Parts Table */}
                {svForm.selectedParts.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Selected Parts Applied</label>
                    <div className="bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F3E5DC]/30 border-b border-[#F3E5DC]">
                            <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Part Description</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-center">Qty</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-right">Unit Price</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-right">Total Price</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {svForm.selectedParts.map(item => (
                            <tr key={item.id} className="border-b border-[#F3E5DC] last:border-none">
                              <td className="px-6 py-4">
                                <div className="font-black text-[#2D1A12] text-xs uppercase">{item.name}</div>
                                <div className="text-[9px] font-bold text-[#8D7A71] uppercase tracking-tighter">Model: {item.model || "Standard"}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-3">
                                  <button type="button" onClick={() => updateSvPartQty(item.id, -1)} className="w-6 h-6 rounded-full bg-white border border-[#F3E5DC] flex items-center justify-center text-xs font-black hover:bg-[#F3E5DC] transition-colors">−</button>
                                  <span className="font-black text-xs w-6 text-center">{item.qty}</span>
                                  <button type="button" onClick={() => updateSvPartQty(item.id, 1)} className="w-6 h-6 rounded-full bg-white border border-[#F3E5DC] flex items-center justify-center text-xs font-black hover:bg-[#F3E5DC] transition-colors">+</button>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-xs">PKR {item.price.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right font-black text-xs text-[#E65100]">PKR {(item.price * item.qty).toLocaleString()}</td>
                              <td className="px-6 py-4 text-center">
                                <button type="button" onClick={() => removeSvPart(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
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

                {/* Calculations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Labor / Service Charges (PKR)</label>
                      <input 
                        type="number" 
                        value={svForm.labor} 
                        onChange={e => setSvForm({ ...svForm, labor: e.target.value })}
                        className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-4.5 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Job Remarks / Technicians Notes</label>
                      <textarea 
                        value={svForm.customerNotes} 
                        onChange={e => setSvForm({ ...svForm, customerNotes: e.target.value })}
                        placeholder="Describe maintenance actions, diagnostic results..."
                        className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Tuning Date</label>
                        <input 
                          type="date" 
                          value={svForm.bookingDate} 
                          onChange={e => setSvForm({ ...svForm, bookingDate: e.target.value })}
                          className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none font-bold text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Tuning Time</label>
                        <input 
                          type="time" 
                          value={svForm.bookingTime} 
                          onChange={e => setSvForm({ ...svForm, bookingTime: e.target.value })}
                          className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="bg-[#2D1A12] p-8 rounded-[2rem] text-white shadow-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-[#FFFAF8]/60 uppercase tracking-[0.2em]">Labor / Tuning</span>
                        <span className="font-bold text-xs">PKR {(parseFloat(svForm.labor) || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                        <span className="text-[10px] font-bold text-[#FFFAF8]/60 uppercase tracking-[0.2em]">Spare Parts Cost</span>
                        <span className="font-bold text-xs">PKR {partsTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Total service bill</span>
                        <span className="text-2xl font-black text-[#E65100]">PKR {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#E65100] text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.01] active:scale-95 transition-all mt-6 flex items-center justify-center gap-4"
                >
                  <Icon n="check" size={20} /> Generate Service Invoice &amp; Print
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceInvoices;
