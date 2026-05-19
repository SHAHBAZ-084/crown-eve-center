// frontend/src/pages/dashboards/branch/pos/ReceiptVoucher.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { Icon } from '../../../../components/branch/BranchShared';
import { FileText, Send, DollarSign, List, ShieldCheck } from 'lucide-react';
import './Vouchers.css';

const ReceiptVoucher = ({ user }) => {
  const [formData, setFormData] = useState({
    category: 'Sale Party',
    to_type: 'Cash',
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    ref_no: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch Accounts list
  const { data: accountsData, isLoading: loadingAccounts, refetch: refetchAccounts } = useQuery({
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

  const accounts = accountsData?.data || [];
  const vouchersHistory = historyData?.data || [];

  // Filter accounts for "From Account" (Usually Customers, Debtors, Revenue, etc.)
  const fromAccountsFiltered = accounts.filter(acc => acc.status === 'ACTIVE');

  // Filter accounts for "To Account" (Destination, e.g. Cash, Bank assets)
  const toAccountsFiltered = accounts.filter(acc => acc.status === 'ACTIVE' && acc.id !== formData.fromAccountId);

  // Calculate current balance of selected From Account
  const selectedFromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
  const currentFromBalance = selectedFromAccount ? selectedFromAccount.current_balance : 0;

  // Calculate current balance of selected To Account
  const selectedToAccount = accounts.find(acc => acc.id === formData.toAccountId);
  const currentToBalance = selectedToAccount ? selectedToAccount.current_balance : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fromAccountId) return alert("Please select a From Account");
    if (!formData.toAccountId) return alert("Please select a To Account");
    if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Please enter a positive amount");

    setSubmitting(true);
    try {
      await api.post('/vouchers', {
        voucher_type: 'RECEIPT',
        category: formData.category,
        to_type: formData.to_type,
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
        category: 'Sale Party',
        to_type: 'Cash',
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
    <div className="voucher-view-container flex flex-col gap-8 p-1">
      {/* Green Header Form Container */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden flex flex-col">
        {/* Green Header */}
        <header className="px-8 py-6 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Inward Cash/Bank Flow</span>
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mt-0.5">
              <FileText size={20} className="text-emerald-100" /> Receipt Voucher
            </h2>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-xs font-black uppercase tracking-wider">
            Voucher# RV-Auto
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Voucher Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#FFFAF8] border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Receipt Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#FFFAF8] border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
              >
                <option value="Sale Party">Sale Party</option>
                <option value="Revenue/Services">Revenue/Services</option>
                <option value="Owner’s Equity">Owner’s Equity</option>
                <option value="Other Inflow">Other Inflow</option>
              </select>
            </div>

            {/* To Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Receipt To Type</label>
              <select
                value={formData.to_type}
                onChange={e => setFormData({ ...formData, to_type: e.target.value })}
                className="w-full bg-[#FFFAF8] border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Asset">Asset</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Account & Balance */}
            <div className="p-5 bg-[#FFFAF8] border border-emerald-100/50 rounded-[2rem] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Source (From)</span>
                {formData.fromAccountId && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFF6F0] text-[#E65100]">
                    Live Balance: PKR {currentFromBalance.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#8D7A71] uppercase tracking-widest ml-1">From Account *</label>
                <select
                  required
                  value={formData.fromAccountId}
                  onChange={e => setFormData({ ...formData, fromAccountId: e.target.value })}
                  className="w-full bg-white border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
                >
                  <option value="">Select source account...</option>
                  {fromAccountsFiltered.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.category?.name}) - PKR {acc.current_balance?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* To Account & Balance */}
            <div className="p-5 bg-emerald-50/30 border border-emerald-100/50 rounded-[2rem] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Destination (To)</span>
                {formData.toAccountId && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32]">
                    Live Balance: PKR {currentToBalance.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#8D7A71] uppercase tracking-widest ml-1">To Cash/Bank Account *</label>
                <select
                  required
                  value={formData.toAccountId}
                  onChange={e => setFormData({ ...formData, toAccountId: e.target.value })}
                  className="w-full bg-white border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
                >
                  <option value="">Select Cash/Bank account...</option>
                  {toAccountsFiltered.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.category?.name}) - PKR {acc.current_balance?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Amount Received (PKR) *</label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#FFFAF8] border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
              />
            </div>

            {/* Ref# */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Reference/Slip#</label>
              <input
                type="text"
                value={formData.ref_no}
                onChange={e => setFormData({ ...formData, ref_no: e.target.value })}
                placeholder="e.g. Deposit-4949, Slip-332"
                className="w-full bg-[#FFFAF8] border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Description/Remarks</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Payment purpose or depositor name"
                className="w-full bg-[#FFFAF8] border border-emerald-100 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2E7D32] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-102 active:scale-95 transition-all flex items-center gap-2"
            >
              {submitting ? 'Posting...' : <><Send size={14} /> Post Receipt Voucher</>}
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Vouchers History */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-[#F3E5DC] shadow-sm flex flex-col">
        <h3 className="text-md font-black text-[#2D1A12] uppercase tracking-tight mb-4 flex items-center gap-2">
          <List size={18} className="text-[#2E7D32]" /> Recent Receipt Vouchers
        </h3>

        {loadingHistory ? (
          <div className="text-center py-8 text-[#8D7A71] font-bold animate-pulse text-xs">Loading history...</div>
        ) : vouchersHistory.length === 0 ? (
          <div className="text-center py-8 text-[#8D7A71] text-xs font-bold border border-dashed border-[#F3E5DC] bg-[#FFFAF8] rounded-2xl">
            No receipt vouchers recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F3E5DC] text-[9px] font-black text-[#8D7A71] uppercase tracking-wider">
                  <th className="px-4 py-3">Voucher#</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">From Account</th>
                  <th className="px-4 py-3">To Account</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Ref#</th>
                  <th className="px-4 py-3">Ledger Posting</th>
                </tr>
              </thead>
              <tbody>
                {vouchersHistory.map(v => (
                  <tr key={v.id} className="border-b border-[#F3E5DC] last:border-none text-xs hover:bg-[#FFFAF8]/40 transition-colors">
                    <td className="px-4 py-3.5 font-black text-[#2E7D32] uppercase">{v.voucher_no}</td>
                    <td className="px-4 py-3.5 text-[#8D7A71] font-bold">{new Date(v.date || v.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 font-bold">{v.fromAccount?.account_name}</td>
                    <td className="px-4 py-3.5 font-bold">{v.toAccount?.account_name}</td>
                    <td className="px-4 py-3.5 text-right font-black text-[#2E7D32]">PKR {v.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-[#8D7A71]">{v.ref_no || '-'}</td>
                    <td className="px-4 py-3.5 text-emerald-600 font-bold uppercase text-[9px] flex items-center gap-1">
                      <ShieldCheck size={12} /> Double Posted
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
