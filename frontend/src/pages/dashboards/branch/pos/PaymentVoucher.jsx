// frontend/src/pages/dashboards/branch/pos/PaymentVoucher.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { Search, FileText, Send, List, ShieldCheck } from 'lucide-react';
import './Vouchers.css';

const PaymentVoucher = ({ user }) => {
  const [formData, setFormData] = useState({
    from_type: 'Cash',
    to_type: 'Expenses',
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    ref_no: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Accounts list
  const { data: accountsData, refetch: refetchAccounts } = useQuery({
    queryKey: ['accounts-list', user?.branchId],
    queryFn: () => api.get('/accounts', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  // Fetch Payment Vouchers History (for next voucher number calculation & history table)
  const { data: historyData, isLoading: loadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['vouchers-history-payment', user?.branchId],
    queryFn: () => api.get('/vouchers', { params: { branchId: user?.branchId, voucher_type: 'PAYMENT' } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  const accounts = accountsData?.data || [];
  const vouchersHistory = historyData?.data || [];
  const nextVoucherNo = vouchersHistory.length > 0 ? (vouchersHistory.length + 1).toString().padStart(4, '0') : '0001';

  // Filter accounts
  const fromAccountsFiltered = accounts.filter(acc => acc.status === 'ACTIVE');
  const toAccountsFiltered = accounts.filter(acc => acc.status === 'ACTIVE' && acc.id !== formData.fromAccountId);

  // Calculate balances
  const selectedFromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
  const currentFromBalance = selectedFromAccount ? selectedFromAccount.current_balance : 0;

  const selectedToAccount = accounts.find(acc => acc.id === formData.toAccountId);
  const currentToBalance = selectedToAccount ? selectedToAccount.current_balance : 0;

  // Formatting helper for Dr / Cr display
  const formatBalance = (bal) => {
    if (bal === 0) return '0.00';
    return `${Math.abs(bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Dr`;
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

    setSubmitting(true);
    try {
      await api.post('/vouchers', {
        voucher_type: 'PAYMENT',
        category: formData.from_type,
        to_type: formData.to_type,
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount: parseFloat(formData.amount),
        ref_no: formData.ref_no,
        description: formData.description,
        date: formData.date,
        branchId: user?.branchId
      });

      alert("Payment Voucher posted successfully! Live balances updated.");
      setFormData({
        from_type: 'Cash',
        to_type: 'Expenses',
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
    <div className="flex flex-col gap-6 w-full h-full p-2">
      
      {/* Main Voucher Form Card - Full Width */}
      <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans">
        
        {/* Modern Professional Red Header */}
        <div className="bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] px-8 py-5 flex justify-between items-center shadow-inner">
          <div>
            <span className="text-[10px] font-black text-red-100/80 uppercase tracking-widest">Outward Transaction</span>
            <h1 className="text-white text-2xl font-black italic tracking-wide drop-shadow-md flex items-center gap-2 mt-0.5">
              <FileText size={24} className="text-red-100" /> Payment Voucher
            </h1>
          </div>
          <div className="bg-black/20 px-4 py-2 rounded-xl border border-white/20 text-sm font-black text-white uppercase tracking-wider shadow-inner">
            Voucher# PV-Auto
          </div>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          
          {/* Two Columns Grid - Spaced out nicely for full width */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6">
            
            {/* --- LEFT COLUMN --- */}
            <div className="flex flex-col gap-5 bg-[#FFFAF8] p-6 rounded-2xl border border-red-50">
              
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
                  value={formData.from_type}
                  onChange={e => setFormData({ ...formData, from_type: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Owner’s Equity">Owner’s Equity</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">From Account:</label>
                <select 
                  required
                  value={formData.fromAccountId}
                  onChange={e => setFormData({ ...formData, fromAccountId: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
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
                  className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right text-[#D32F2F] font-black shadow-inner"
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
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right font-black text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="flex flex-col gap-5 bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
              
              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Date:</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">To Type:</label>
                <select 
                  value={formData.to_type}
                  onChange={e => setFormData({ ...formData, to_type: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                >
                  <option value="Expenses">Expenses</option>
                  <option value="Ext. Purchase Party">Ext. Purchase Party</option>
                  <option value="Liability">Liability</option>
                  <option value="Asset">Asset</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">To Account:</label>
                <select 
                  required
                  value={formData.toAccountId}
                  onChange={e => setFormData({ ...formData, toAccountId: e.target.value })}
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
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
                  className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right font-black text-[#E65100] shadow-inner"
                />
              </div>

              <div className="flex items-center">
                <label className="w-32 text-right pr-4 font-bold text-[#8D7A71] text-xs uppercase tracking-wider">Ref #:</label>
                <input 
                  type="text" 
                  value={formData.ref_no}
                  onChange={e => setFormData({ ...formData, ref_no: e.target.value })}
                  placeholder="e.g. Chq-8484"
                  className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
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
              placeholder="Payment purpose or remarks..."
              className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
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
              className="px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#D32F2F] hover:bg-[#B71C1C] shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : <><Send size={16} /> Post Payment Voucher</>}
            </button>
          </div>

        </form>
      </div>

      {/* Payment Vouchers History Section */}
      <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* History Header & Search Bar */}
        <div className="px-8 py-5 border-b border-[#F3E5DC] flex justify-between items-center bg-[#FAFAFA]">
          <h3 className="text-md font-black text-[#2D1A12] uppercase tracking-tight flex items-center gap-2">
            <List size={18} className="text-[#D32F2F]" /> Recent Payment Vouchers
          </h3>
          
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search vouchers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded-full pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loadingHistory ? (
          <div className="text-center py-10 text-[#8D7A71] font-bold animate-pulse text-xs">Loading history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-10 m-6 text-[#8D7A71] text-xs font-bold border border-dashed border-[#F3E5DC] bg-[#FFFAF8] rounded-2xl">
            {searchTerm ? 'No vouchers found matching your search.' : 'No payment vouchers recorded.'}
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
                    <td className="px-4 py-4 font-black text-[#D32F2F] uppercase whitespace-nowrap">{v.voucher_no}</td>
                    <td className="px-4 py-4 text-[#8D7A71] font-bold whitespace-nowrap">{new Date(v.date || v.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 font-bold text-[#2D1A12] whitespace-nowrap">{v.fromAccount?.account_name}</td>
                    <td className="px-4 py-4 font-bold text-[#2D1A12] whitespace-nowrap">{v.toAccount?.account_name}</td>
                    <td className="px-4 py-4 text-right font-black text-[#D32F2F] whitespace-nowrap">PKR {v.amount?.toLocaleString()}</td>
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

export default PaymentVoucher;
