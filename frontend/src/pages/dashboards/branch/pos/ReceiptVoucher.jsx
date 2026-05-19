// frontend/src/pages/dashboards/branch/pos/ReceiptVoucher.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { FileText, Send, List, ShieldCheck, Search } from 'lucide-react';
import './Vouchers.css';

const ReceiptVoucher = ({ user }) => {
  const [formData, setFormData] = useState({
    fromCategoryId: '',
    toCategoryId: '',
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    ref_no: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Categories list
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-list', user?.branchId],
    queryFn: () => api.get('/accounts/categories', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  // Fetch Accounts list
  const { data: accountsData, refetch: refetchAccounts } = useQuery({
    queryKey: ['accounts-list', user?.branchId],
    queryFn: () => api.get('/accounts', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  // Fetch Receipt Vouchers History
  const { data: historyData, isLoading: loadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['vouchers-history-receipt', user?.branchId],
    queryFn: () => api.get('/vouchers', { params: { branchId: user?.branchId, voucher_type: 'RECEIPT' } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  const categories = categoriesData?.data || [];
  const accounts = accountsData?.data || [];
  const vouchersHistory = historyData?.data || [];
  const nextVoucherNo = vouchersHistory.length > 0 ? (vouchersHistory.length + 1).toString().padStart(4, '0') : '0001';

  // Filter accounts based on selected category
  const fromAccountsFiltered = accounts.filter(acc => 
    acc.status === 'ACTIVE' && 
    (formData.fromCategoryId ? acc.categoryId === formData.fromCategoryId : true)
  );

  const toAccountsFiltered = accounts.filter(acc => 
    acc.status === 'ACTIVE' && 
    acc.id !== formData.fromAccountId &&
    (formData.toCategoryId ? acc.categoryId === formData.toCategoryId : true)
  );

  // Auto-clear selected account if its category changes and it no longer matches
  useEffect(() => {
    if (formData.fromAccountId) {
      const acc = accounts.find(a => a.id === formData.fromAccountId);
      if (acc && formData.fromCategoryId && acc.categoryId !== formData.fromCategoryId) {
        setFormData(prev => ({ ...prev, fromAccountId: '' }));
      }
    }
  }, [formData.fromCategoryId, accounts, formData.fromAccountId]);

  useEffect(() => {
    if (formData.toAccountId) {
      const acc = accounts.find(a => a.id === formData.toAccountId);
      if (acc && formData.toCategoryId && acc.categoryId !== formData.toCategoryId) {
        setFormData(prev => ({ ...prev, toAccountId: '' }));
      }
    }
  }, [formData.toCategoryId, accounts, formData.toAccountId]);


  // Calculate balances
  const selectedFromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
  const currentFromBalance = selectedFromAccount ? selectedFromAccount.current_balance : 0;

  const selectedToAccount = accounts.find(acc => acc.id === formData.toAccountId);
  const currentToBalance = selectedToAccount ? selectedToAccount.current_balance : 0;

  // Formatting helper for Dr / Cr display
  const formatBalance = (bal) => {
    if (bal === 0) return '0.00';
    return `${Math.abs(bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
  };

  // Filter History by Search
  const filteredHistory = vouchersHistory.filter(v => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.voucher_no.toLowerCase().includes(term) ||
      (v.ref_no && v.ref_no.toLowerCase().includes(term)) ||
      (v.description && v.description.toLowerCase().includes(term)) ||
      (v.fromAccount?.account_name?.toLowerCase().includes(term)) ||
      (v.toAccount?.account_name?.toLowerCase().includes(term)) ||
      v.amount.toString().includes(term)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fromAccountId) return alert("Please select a From Account");
    if (!formData.toAccountId) return alert("Please select a To Account");
    if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Please enter a positive amount");

    // Get category names to save in voucher metadata
    const fromCat = categories.find(c => c.id === formData.fromCategoryId)?.name || 'N/A';
    const toCat = categories.find(c => c.id === formData.toCategoryId)?.name || 'N/A';

    setSubmitting(true);
    try {
      await api.post('/vouchers', {
        voucher_type: 'RECEIPT',
        category: fromCat,
        to_type: toCat,
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: parseFloat(formData.amount),
        ref_no: formData.ref_no,
        description: formData.description,
        date: formData.date,
        branchId: user?.branchId
      });

      alert("Receipt Voucher posted successfully! Live balances updated.");
      setFormData({
        fromCategoryId: '',
        toCategoryId: '',
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        ref_no: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      refetchAccounts();
      refetchHistory();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full p-2 pb-10">
      
      {/* Main Voucher Form Card - Full Width */}
      <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans">
        
        {/* Modern Professional Green Header */}
        <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] px-8 py-5 flex justify-between items-center shadow-inner">
          <div>
            <span className="text-[10px] font-black text-emerald-100/80 uppercase tracking-widest">Inward Cash/Bank Flow</span>
            <h1 className="text-white text-2xl font-black italic tracking-wide drop-shadow-md flex items-center gap-2 mt-0.5">
              <FileText size={24} className="text-emerald-100" /> Receipt Voucher
            </h1>
          </div>
          <div className="bg-black/20 px-4 py-2 rounded-xl border border-white/20 text-sm font-black text-white uppercase tracking-wider shadow-inner">
            Voucher# RV-Auto
          </div>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          
          {/* Two Columns Grid - Spaced out nicely for full width */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6">
            
            {/* --- LEFT COLUMN --- */}
            <div className="flex flex-col gap-5 bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
              
              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Voucher#:</label>
                <input 
                  type="text" 
                  disabled 
                  value={nextVoucherNo} 
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-gray-500 font-bold shadow-sm"
                />
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">From Type:</label>
                <select 
                  value={formData.fromCategoryId}
                  onChange={e => setFormData({ ...formData, fromCategoryId: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">-- All Categories --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">From Account:</label>
                <select 
                  required
                  value={formData.fromAccountId}
                  onChange={e => setFormData({ ...formData, fromAccountId: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Account...</option>
                  {fromAccountsFiltered.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Balance:</label>
                <input 
                  type="text" 
                  disabled 
                  value={formatBalance(currentFromBalance)} 
                  className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right text-[#E65100] font-black shadow-inner"
                />
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Amount (PKR):</label>
                <input 
                  required
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right font-black text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="flex flex-col gap-5 bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100/50">
              
              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Date:</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">To Type:</label>
                <select 
                  value={formData.toCategoryId}
                  onChange={e => setFormData({ ...formData, toCategoryId: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">-- Select Cash/Bank --</option>
                  {categories.filter(cat => cat.name.toLowerCase().includes('cash') || cat.name.toLowerCase().includes('bank')).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">To Account:</label>
                <select 
                  required
                  value={formData.toAccountId}
                  onChange={e => setFormData({ ...formData, toAccountId: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="">Select Account...</option>
                  {toAccountsFiltered.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Balance:</label>
                <input 
                  type="text" 
                  disabled 
                  value={formatBalance(currentToBalance)} 
                  className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right font-black text-[#2E7D32] shadow-inner"
                />
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Ref #:</label>
                <input 
                  type="text" 
                  value={formData.ref_no}
                  onChange={e => setFormData({ ...formData, ref_no: e.target.value })}
                  placeholder="e.g. Dep-22"
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

          </div>

          {/* Description - Full Width */}
          <div className="flex items-center mt-2 px-2">
            <label className="w-28 xl:w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Description:</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Receipt purpose or remarks..."
              className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-4 border-t border-[#F3E5DC] pt-6 flex justify-end gap-4">
            <button 
              type="button" 
              className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-[#8D7A71] bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-gray-100 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#2E7D32] hover:bg-[#1B5E20] shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : <><Send size={16} /> Post Receipt Voucher</>}
            </button>
          </div>

        </form>
      </div>

      {/* Receipt Vouchers History Section */}
      <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* History Header & Search Bar */}
        <div className="px-8 py-5 border-b border-[#F3E5DC] flex justify-between items-center bg-[#FAFAFA]">
          <h3 className="text-md font-black text-[#2D1A12] uppercase tracking-tight flex items-center gap-2">
            <List size={18} className="text-[#2E7D32]" /> Recent Receipt Vouchers
          </h3>
          
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search vouchers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded-full pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loadingHistory ? (
          <div className="text-center py-10 text-[#8D7A71] font-bold animate-pulse text-xs">Loading history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-10 m-6 text-[#8D7A71] text-xs font-bold border border-dashed border-[#F3E5DC] bg-[#FFFAF8] rounded-2xl">
            {searchTerm ? 'No vouchers found matching your search.' : 'No receipt vouchers recorded.'}
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#F3E5DC] text-[10px] font-black text-[#8D7A71] uppercase tracking-widest bg-gray-50/50">
                  <th className="px-4 py-4 rounded-tl-xl">Voucher#</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">From Account</th>
                  <th className="px-4 py-4">To Account</th>
                  <th className="px-4 py-4 text-right">Amount</th>
                  <th className="px-4 py-4">Ref#</th>
                  <th className="px-4 py-4 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(v => (
                  <tr key={v.id} className="border-b border-[#F3E5DC] last:border-none text-xs hover:bg-[#FFFAF8]/60 transition-colors">
                    <td className="px-4 py-4 font-black text-[#2E7D32] uppercase whitespace-nowrap">{v.voucher_no}</td>
                    <td className="px-4 py-4 text-[#8D7A71] font-bold whitespace-nowrap">{new Date(v.date || v.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 font-bold text-[#2D1A12] whitespace-nowrap">{v.fromAccount?.account_name}</td>
                    <td className="px-4 py-4 font-bold text-[#2D1A12] whitespace-nowrap">{v.toAccount?.account_name}</td>
                    <td className="px-4 py-4 text-right font-black text-[#2E7D32] whitespace-nowrap">PKR {v.amount?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[#8D7A71] whitespace-nowrap">{v.ref_no || '-'}</td>
                    <td className="px-4 py-4 text-emerald-600 font-bold uppercase text-[9px] whitespace-nowrap">
                      <span className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full w-max border border-emerald-100">
                        <ShieldCheck size={12} /> Double Posted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ReceiptVoucher;
