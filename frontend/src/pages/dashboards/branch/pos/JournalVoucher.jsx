// frontend/src/pages/dashboards/branch/pos/JournalVoucher.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { Icon } from '../../../../components/branch/BranchShared';
import { FileText, Send, List, ShieldCheck } from 'lucide-react';
import './Vouchers.css';

const JournalVoucher = ({ user }) => {
  const [formData, setFormData] = useState({
    debitAccountId: '',
    creditAccountId: '',
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

  // Fetch Journal Vouchers History
  const { data: historyData, isLoading: loadingHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['vouchers-history-journal', user?.branchId],
    queryFn: () => api.get('/vouchers', { params: { branchId: user?.branchId, voucher_type: 'JOURNAL' } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  const accounts = accountsData?.data || [];
  const vouchersHistory = historyData?.data || [];

  const activeAccounts = accounts.filter(acc => acc.status === 'ACTIVE');

  // Calculate current balances
  const selectedDebitAccount = accounts.find(acc => acc.id === formData.debitAccountId);
  const currentDebitBalance = selectedDebitAccount ? selectedDebitAccount.current_balance : 0;

  const selectedCreditAccount = accounts.find(acc => acc.id === formData.creditAccountId);
  const currentCreditBalance = selectedCreditAccount ? selectedCreditAccount.current_balance : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.debitAccountId) return alert("Please select a Debit Account");
    if (!formData.creditAccountId) return alert("Please select a Credit Account");
    if (formData.debitAccountId === formData.creditAccountId) {
      return alert("Debit and Credit accounts must be different.");
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Please enter a positive amount");

    setSubmitting(true);
    try {
      // In our unified backend model:
      // fromAccountId = Credit account (pays/gives value, credited in ledger)
      // toAccountId = Debit account (receives value, debited in ledger)
      await api.post('/vouchers', {
        voucher_type: 'JOURNAL',
        fromAccountId: formData.creditAccountId, // Credit
        toAccountId: formData.debitAccountId,    // Debit
        amount: parseFloat(formData.amount),
        ref_no: formData.ref_no,
        description: formData.description,
        date: formData.date,
        branchId: user?.branchId
      });

      alert("Journal Voucher posted successfully! Live balances updated.");
      setFormData({
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
    <div className="voucher-view-container flex flex-col gap-8 p-1">
      {/* Gray Header Form Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Gray Header */}
        <header className="px-8 py-6 bg-gradient-to-r from-[#616161] to-[#424242] text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">Internal Adjustments / Transfer</span>
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mt-0.5">
              <FileText size={20} className="text-gray-200" /> Journal Voucher
            </h2>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-xs font-black uppercase tracking-wider">
            Voucher# JV-Auto
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voucher Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Voucher Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#FFFAF8] border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-gray-400/20 font-bold text-xs"
              />
            </div>

            {/* Ref# */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Reference# / Slip#</label>
              <input
                type="text"
                value={formData.ref_no}
                onChange={e => setFormData({ ...formData, ref_no: e.target.value })}
                placeholder="e.g. Adj-2992, Tfr-9922"
                className="w-full bg-[#FFFAF8] border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-gray-400/20 font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Debit Side (To Account) */}
            <div className="p-5 bg-gray-50/50 border border-gray-200/50 rounded-[2rem] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-[#424242]">Debit Account (To)</span>
                {formData.debitAccountId && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-200 text-[#424242]">
                    Live Balance: PKR {currentDebitBalance.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#8D7A71] uppercase tracking-widest ml-1">Select Debit Account *</label>
                <select
                  required
                  value={formData.debitAccountId}
                  onChange={e => setFormData({ ...formData, debitAccountId: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-gray-400/20 font-bold text-xs"
                >
                  <option value="">Select account to debit...</option>
                  {activeAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.category?.name}) - PKR {acc.current_balance?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Credit Side (From Account) */}
            <div className="p-5 bg-gray-50/50 border border-gray-200/50 rounded-[2rem] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest text-[#424242]">Credit Account (From)</span>
                {formData.creditAccountId && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-200 text-[#424242]">
                    Live Balance: PKR {currentCreditBalance.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#8D7A71] uppercase tracking-widest ml-1">Select Credit Account *</label>
                <select
                  required
                  value={formData.creditAccountId}
                  onChange={e => setFormData({ ...formData, creditAccountId: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-gray-400/20 font-bold text-xs"
                >
                  <option value="">Select account to credit...</option>
                  {activeAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.category?.name}) - PKR {acc.current_balance?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Amount (PKR) *</label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#FFFAF8] border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-gray-400/20 font-bold text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Description / Remarks *</label>
              <input
                required
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Cash transfer to petty cash, account adjustments"
                className="w-full bg-[#FFFAF8] border border-gray-200 rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-gray-400/20 font-bold text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#616161] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-500/20 hover:scale-102 active:scale-95 transition-all flex items-center gap-2"
            >
              {submitting ? 'Posting...' : <><Send size={14} /> Post Journal Voucher</>}
            </button>
          </div>
        </form>
      </div>

      {/* Journal Vouchers History */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-[#F3E5DC] shadow-sm flex flex-col">
        <h3 className="text-md font-black text-[#2D1A12] uppercase tracking-tight mb-4 flex items-center gap-2">
          <List size={18} className="text-[#616161]" /> Recent Journal Vouchers
        </h3>

        {loadingHistory ? (
          <div className="text-center py-8 text-[#8D7A71] font-bold animate-pulse text-xs">Loading history...</div>
        ) : vouchersHistory.length === 0 ? (
          <div className="text-center py-8 text-[#8D7A71] text-xs font-bold border border-dashed border-[#F3E5DC] bg-[#FFFAF8] rounded-2xl">
            No journal vouchers recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F3E5DC] text-[9px] font-black text-[#8D7A71] uppercase tracking-wider">
                  <th className="px-4 py-3">Voucher#</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Debit Side (To)</th>
                  <th className="px-4 py-3">Credit Side (From)</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Ref#</th>
                  <th className="px-4 py-3">Ledger Posting</th>
                </tr>
              </thead>
              <tbody>
                {vouchersHistory.map(v => (
                  <tr key={v.id} className="border-b border-[#F3E5DC] last:border-none text-xs hover:bg-[#FFFAF8]/40 transition-colors">
                    <td className="px-4 py-3.5 font-black text-[#616161] uppercase">{v.voucher_no}</td>
                    <td className="px-4 py-3.5 text-[#8D7A71] font-bold">{new Date(v.date || v.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 font-bold">{v.toAccount?.account_name}</td>
                    <td className="px-4 py-3.5 font-bold">{v.fromAccount?.account_name}</td>
                    <td className="px-4 py-3.5 text-right font-black text-[#616161]">PKR {v.amount?.toLocaleString()}</td>
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

export default JournalVoucher;
