// frontend/src/pages/dashboards/branch/pos/JournalVoucher.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { Search, FileText, Send, List, ShieldCheck } from 'lucide-react';
import './Vouchers.css';

const JournalVoucher = ({ user }) => {
  const [formData, setFormData] = useState({
    debitCategoryId: '',
    creditCategoryId: '',
    debitAccountId: '',
    creditAccountId: '',
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

  // Fetch Journal Vouchers History
  const { data: historyData, isLoading: loadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['vouchers-history-journal', user?.branchId],
    queryFn: () => api.get('/vouchers', { params: { branchId: user?.branchId, voucher_type: 'JOURNAL' } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  const categories = categoriesData?.data || [];
  const accounts = accountsData?.data || [];
  const vouchersHistory = historyData?.data || [];
  const nextVoucherNo = vouchersHistory.length > 0 ? (vouchersHistory.length + 1).toString().padStart(4, '0') : '0001';

  // Filter accounts based on selected category
  const activeDebitAccounts = accounts.filter(acc => 
    acc.status === 'ACTIVE' && 
    (formData.debitCategoryId ? acc.categoryId === formData.debitCategoryId : true)
  );

  const activeCreditAccounts = accounts.filter(acc => 
    acc.status === 'ACTIVE' && 
    (formData.creditCategoryId ? acc.categoryId === formData.creditCategoryId : true)
  );

  // Auto-clear selected account if its category changes and it no longer matches
  useEffect(() => {
    if (formData.debitAccountId) {
      const acc = accounts.find(a => a.id === formData.debitAccountId);
      if (acc && formData.debitCategoryId && acc.categoryId !== formData.debitCategoryId) {
        setFormData(prev => ({ ...prev, debitAccountId: '' }));
      }
    }
  }, [formData.debitCategoryId, accounts, formData.debitAccountId]);

  useEffect(() => {
    if (formData.creditAccountId) {
      const acc = accounts.find(a => a.id === formData.creditAccountId);
      if (acc && formData.creditCategoryId && acc.categoryId !== formData.creditCategoryId) {
        setFormData(prev => ({ ...prev, creditAccountId: '' }));
      }
    }
  }, [formData.creditCategoryId, accounts, formData.creditAccountId]);

  // Calculate balances
  const selectedDebitAccount = accounts.find(acc => acc.id === formData.debitAccountId);
  const currentDebitBalance = selectedDebitAccount ? selectedDebitAccount.current_balance : 0;

  const selectedCreditAccount = accounts.find(acc => acc.id === formData.creditAccountId);
  const currentCreditBalance = selectedCreditAccount ? selectedCreditAccount.current_balance : 0;

  // Formatting helper for Dr / Cr display
  const formatBalance = (bal, side) => {
    if (bal === 0) return '0.00';
    return `${Math.abs(bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${side}`;
  };

  // Filter History by Search
  const filteredHistory = vouchersHistory.filter(v => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.voucher_no.toLowerCase().includes(term) ||
      (v.ref_no && v.ref_no.toLowerCase().includes(term)) ||
      (v.description && v.description.toLowerCase().includes(term)) ||
      (v.fromAccount?.account_name?.toLowerCase().includes(term)) || // Credit account
      (v.toAccount?.account_name?.toLowerCase().includes(term)) ||   // Debit account
      v.amount.toString().includes(term)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.debitAccountId) return alert("Please select a Debit Account");
    if (!formData.creditAccountId) return alert("Please select a Credit Account");
    if (formData.debitAccountId === formData.creditAccountId) {
      return alert("Debit and Credit accounts must be different.");
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Please enter a positive amount");

    // Get category names to save in voucher metadata
    const toCat = categories.find(c => c.id === formData.debitCategoryId)?.name || 'N/A'; // Debit
    const fromCat = categories.find(c => c.id === formData.creditCategoryId)?.name || 'N/A'; // Credit

    setSubmitting(true);
    try {
      await api.post('/vouchers', {
        voucher_type: 'JOURNAL',
        fromAccountId: formData.creditAccountId, // Credit
        toAccountId: formData.debitAccountId,    // Debit
        category: fromCat,
        to_type: toCat,
        amount: parseFloat(formData.amount),
        ref_no: formData.ref_no,
        description: formData.description,
        date: formData.date,
        branchId: user?.branchId
      });

      alert("Journal Voucher posted successfully! Live balances updated.");
      setFormData({
        debitCategoryId: '',
        creditCategoryId: '',
        debitAccountId: '',
        creditAccountId: '',
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
        
        {/* Professional Gray Header */}
        <div className="bg-gradient-to-r from-[#757575] to-[#424242] px-8 py-5 flex justify-between items-center shadow-inner">
          <div>
            <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">Internal Adjustments</span>
            <h1 className="text-white text-2xl font-black italic tracking-wide drop-shadow-md flex items-center gap-2 mt-0.5">
              <FileText size={24} className="text-gray-200" /> Journal Voucher
            </h1>
          </div>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          
          {/* Top Two Frames: Debit Side & Credit Side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-6">
            
            {/* --- DEBIT SIDE FRAME --- */}
            <fieldset className="border-2 border-gray-200 rounded-xl p-6 bg-[#FAFAFA] relative">
              <legend className="px-3 text-sm font-bold text-[#424242] tracking-wide ml-2 bg-[#FAFAFA] whitespace-nowrap">
                Debit Side <span className="font-serif"> [بنام]</span>
              </legend>
              
              <div className="flex flex-col gap-5 mt-2">
                <div className="flex items-center">
                  <label className="w-40 whitespace-nowrap text-right pr-4 font-bold text-[#424242] text-xs uppercase tracking-wider">Debit Type:</label>
                  <select 
                    value={formData.debitCategoryId}
                    onChange={e => setFormData({ ...formData, debitCategoryId: e.target.value })}
                    className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all"
                  >
                    <option value="">-- All Categories --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="w-40 whitespace-nowrap text-right pr-4 font-bold text-[#424242] text-xs uppercase tracking-wider">Debit Account:</label>
                  <select 
                    required
                    value={formData.debitAccountId}
                    onChange={e => setFormData({ ...formData, debitAccountId: e.target.value })}
                    className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all"
                  >
                    <option value="">Select Account...</option>
                    {activeDebitAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="w-40 whitespace-nowrap text-right pr-4 font-bold text-[#424242] text-xs uppercase tracking-wider">Balance:</label>
                  <input 
                    type="text" 
                    disabled 
                    value={formatBalance(currentDebitBalance, 'Dr')} 
                    className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right text-emerald-700 font-black shadow-inner"
                  />
                </div>
              </div>
            </fieldset>

            {/* --- CREDIT SIDE FRAME --- */}
            <fieldset className="border-2 border-gray-200 rounded-xl p-6 bg-[#FAFAFA] relative">
              <legend className="px-3 text-sm font-bold text-[#424242] tracking-wide ml-2 bg-[#FAFAFA] whitespace-nowrap">
                Credit Side <span className="font-serif"> [جمع]</span>
              </legend>
              
              <div className="flex flex-col gap-5 mt-2">
                <div className="flex items-center">
                  <label className="w-40 whitespace-nowrap text-right pr-4 font-bold text-[#424242] text-xs uppercase tracking-wider">Credit Type:</label>
                  <select 
                    value={formData.creditCategoryId}
                    onChange={e => setFormData({ ...formData, creditCategoryId: e.target.value })}
                    className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all"
                  >
                    <option value="">-- All Categories --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="w-40 whitespace-nowrap text-right pr-4 font-bold text-[#424242] text-xs uppercase tracking-wider">Credit Account:</label>
                  <select 
                    required
                    value={formData.creditAccountId}
                    onChange={e => setFormData({ ...formData, creditAccountId: e.target.value })}
                    className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all"
                  >
                    <option value="">Select Account...</option>
                    {activeCreditAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="w-40 whitespace-nowrap text-right pr-4 font-bold text-[#424242] text-xs uppercase tracking-wider">Balance:</label>
                  <input 
                    type="text" 
                    disabled 
                    value={formatBalance(currentCreditBalance, 'Cr')} 
                    className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right text-red-700 font-black shadow-inner"
                  />
                </div>
              </div>
            </fieldset>

          </div>

          {/* Bottom Fields Layout */}
          <div className="flex flex-col gap-6 mt-2">
            
            {/* Description Row - Full Width */}
            <div className="flex items-center">
              <label className="w-32 xl:w-40 whitespace-nowrap text-right pr-4 font-bold text-[#424242] text-xs uppercase tracking-wider">Description:</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-all"
              />
            </div>

            {/* Metrics Row: Amount, Date, Ref#, Voucher# */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 xl:pl-4">
              
              <div className="flex items-center">
                <label className="w-auto whitespace-nowrap text-right pr-3 font-bold text-[#424242] text-xs uppercase tracking-wider">Amount:</label>
                <input 
                  required
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="flex-1 min-w-[80px] bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-right font-black text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all"
                />
              </div>

              <div className="flex items-center">
                <label className="w-auto whitespace-nowrap text-right pr-3 font-bold text-[#424242] text-xs uppercase tracking-wider">Date:</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="flex-1 min-w-[120px] bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all"
                />
              </div>

              <div className="flex items-center">
                <label className="w-auto whitespace-nowrap text-right pr-3 font-bold text-[#424242] text-xs uppercase tracking-wider">Ref #:</label>
                <input 
                  type="text" 
                  value={formData.ref_no}
                  onChange={e => setFormData({ ...formData, ref_no: e.target.value })}
                  className="flex-1 min-w-[80px] bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-[#2D1A12] shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all"
                />
              </div>

              <div className="flex items-center">
                <label className="w-auto whitespace-nowrap text-right pr-3 font-bold text-[#424242] text-xs uppercase tracking-wider">Voucher#:</label>
                <input 
                  type="text" 
                  disabled 
                  value={nextVoucherNo} 
                  className="flex-1 min-w-[80px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 shadow-inner"
                />
              </div>

            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-4 border-t border-[#F3E5DC] pt-6 flex justify-end gap-4">
            <button 
              type="button" 
              className="px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-[#8D7A71] bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-gray-100 transition-colors shadow-sm"
            >
              Close
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-[#616161] hover:bg-[#424242] shadow-lg shadow-gray-500/30 transition-all active:scale-95 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : <><Send size={16} /> Save Voucher</>}
            </button>
          </div>

        </form>
      </div>

      {/* Journal Vouchers History Section */}
      <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* History Header & Search Bar */}
        <div className="px-8 py-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#FAFAFA]">
          <h3 className="text-md font-black text-[#2D1A12] uppercase tracking-tight flex items-center gap-2">
            <List size={18} className="text-[#616161]" /> Recent Journal Vouchers
          </h3>
          
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search vouchers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded-full pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-all shadow-inner"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loadingHistory ? (
          <div className="text-center py-10 text-[#8D7A71] font-bold animate-pulse text-xs">Loading history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-10 m-6 text-[#8D7A71] text-xs font-bold border border-dashed border-[#E5E7EB] bg-[#F9FAFB] rounded-2xl">
            {searchTerm ? 'No vouchers found matching your search.' : 'No journal vouchers recorded.'}
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#E5E7EB] text-[10px] font-black text-[#8D7A71] uppercase tracking-widest bg-gray-50/50">
                  <th className="px-4 py-4 rounded-tl-xl">Voucher#</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Debit Side (To)</th>
                  <th className="px-4 py-4">Credit Side (From)</th>
                  <th className="px-4 py-4 text-right">Amount</th>
                  <th className="px-4 py-4">Ref#</th>
                  <th className="px-4 py-4 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(v => (
                  <tr key={v.id} className="border-b border-[#E5E7EB] last:border-none text-xs hover:bg-[#F9FAFB]/60 transition-colors">
                    <td className="px-4 py-4 font-black text-[#616161] uppercase whitespace-nowrap">{v.voucher_no}</td>
                    <td className="px-4 py-4 text-[#8D7A71] font-bold whitespace-nowrap">{new Date(v.date || v.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 font-bold text-emerald-700 whitespace-nowrap">{v.toAccount?.account_name}</td>
                    <td className="px-4 py-4 font-bold text-red-700 whitespace-nowrap">{v.fromAccount?.account_name}</td>
                    <td className="px-4 py-4 text-right font-black text-[#616161] whitespace-nowrap">PKR {v.amount?.toLocaleString()}</td>
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

export default JournalVoucher;
