import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { Search, FileText, ShieldCheck, Printer } from 'lucide-react';

const ViewVoucher = ({ user }) => {
  const [voucherType, setVoucherType] = useState('PAYMENT');
  const [searchVoucherNo, setSearchVoucherNo] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['view-voucher', user?.branchId, voucherType, submittedSearch],
    queryFn: () => api.get('/vouchers', { 
      params: { 
        branchId: user?.branchId, 
        voucher_type: voucherType,
        voucher_no: submittedSearch
      } 
    }).then(r => r.data),
    enabled: !!user?.branchId && !!submittedSearch
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchVoucherNo.trim()) return;
    setSubmittedSearch(searchVoucherNo.trim());
  };

  const voucher = data?.data && data.data.length > 0 ? data.data[0] : null;

  const printVoucher = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 w-full p-2 pb-10">
      
      {/* Search Header */}
      <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans print:hidden">
        <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] px-8 py-5 flex justify-between items-center shadow-inner">
          <div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Financial Records</span>
            <h1 className="text-white text-2xl font-black italic tracking-wide drop-shadow-md flex items-center gap-2 mt-0.5">
              <Search size={24} className="text-slate-300" /> View Voucher
            </h1>
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-8 flex flex-col sm:flex-row gap-6 items-end bg-[#F8FAFC]">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-black text-[#475569] uppercase tracking-widest ml-1">Voucher Type</label>
            <select 
              value={voucherType}
              onChange={(e) => { setVoucherType(e.target.value); setSubmittedSearch(''); }}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              <option value="PAYMENT">Payment Voucher (PV)</option>
              <option value="RECEIPT">Receipt Voucher (RV)</option>
              <option value="JOURNAL">Journal Voucher (JV)</option>
            </select>
          </div>
          
          <div className="flex-[2] space-y-2">
            <label className="text-xs font-black text-[#475569] uppercase tracking-widest ml-1">Voucher Number</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="e.g. PV-20260519-0001"
                value={searchVoucherNo}
                onChange={(e) => setSearchVoucherNo(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#0F172A] shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 uppercase"
              />
              <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button 
            type="submit"
            className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-500/30 hover:bg-[#1E293B] active:scale-95 transition-all flex items-center justify-center h-[46px]"
          >
            Search Record
          </button>
        </form>
      </div>

      {/* Result Area */}
      {isLoading && (
        <div className="py-20 text-center text-[#64748B] font-bold animate-pulse">Searching ledger database...</div>
      )}

      {!isLoading && submittedSearch && !voucher && (
        <div className="w-full bg-white border border-dashed border-[#E2E8F0] rounded-2xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
          <FileText size={48} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-wider">Voucher Not Found</h3>
          <p className="text-xs font-bold text-[#64748B] mt-2 max-w-sm">No {voucherType} voucher matches the exact ID "{submittedSearch}". Please verify the number and try again.</p>
        </div>
      )}

      {voucher && (
        <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden flex flex-col font-sans relative print:shadow-none print:border-none print:rounded-none">
          
          <div className="absolute top-0 right-0 p-8 print:hidden z-10">
            <button onClick={printVoucher} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-full transition-colors shadow-sm" title="Print Document">
              <Printer size={20} />
            </button>
          </div>

          {/* Document Header */}
          <div className="px-10 py-10 border-b-4 border-[#0F172A] flex flex-col items-center text-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
            <div className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">CROWN EVE</div>
            <div className="text-xs font-black text-[#475569] uppercase tracking-[0.3em] mt-1 mb-8">Official Accounting Record</div>
            
            <div className="bg-[#0F172A] text-white px-6 py-2 rounded-lg font-black text-lg tracking-widest uppercase shadow-md inline-block">
              {voucher.voucher_type} VOUCHER
            </div>
            <div className="text-lg font-bold text-[#0F172A] mt-4 uppercase">No. {voucher.voucher_no}</div>
            <div className="text-xs font-bold text-[#64748B] mt-1">{new Date(voucher.date || voucher.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} | {new Date(voucher.createdAt).toLocaleTimeString()}</div>
          </div>

          {/* Document Body */}
          <div className="p-10 flex flex-col gap-8">
            
            {/* Double Entry Table */}
            <div className="border-2 border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
                    <th className="px-6 py-4 text-xs font-black text-[#475569] uppercase tracking-wider w-1/2 border-r border-[#E2E8F0]">Account Name</th>
                    <th className="px-6 py-4 text-xs font-black text-[#475569] uppercase tracking-wider w-1/4 text-right border-r border-[#E2E8F0]">Debit (PKR)</th>
                    <th className="px-6 py-4 text-xs font-black text-[#475569] uppercase tracking-wider w-1/4 text-right">Credit (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Debit Row */}
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="px-6 py-5 border-r border-[#E2E8F0]">
                      <div className="font-black text-sm text-[#0F172A] uppercase">{voucher.toAccount?.account_name || 'N/A'}</div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1">
                        Category: {voucher.toAccount?.category?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5 border-r border-[#E2E8F0] text-right font-black text-lg text-[#0F172A]">
                      {voucher.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-[#94A3B8]">-</td>
                  </tr>
                  
                  {/* Credit Row */}
                  <tr>
                    <td className="px-6 py-5 border-r border-[#E2E8F0]">
                      <div className="font-black text-sm text-[#0F172A] uppercase pl-6">{voucher.fromAccount?.account_name || 'N/A'}</div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-1 pl-6">
                        Category: {voucher.fromAccount?.category?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5 border-r border-[#E2E8F0] text-right font-bold text-[#94A3B8]">-</td>
                    <td className="px-6 py-5 text-right font-black text-lg text-[#0F172A]">
                      {voucher.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-[#0F172A] text-white">
                  <tr>
                    <td className="px-6 py-4 font-black uppercase text-xs tracking-wider text-right border-r border-slate-700">Total Amounts</td>
                    <td className="px-6 py-4 text-right font-black border-r border-slate-700">PKR {voucher.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black">PKR {voucher.amount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-8 bg-[#F8FAFC] p-6 rounded-xl border border-[#E2E8F0]">
              <div>
                <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Narration / Description</div>
                <div className="text-sm font-bold text-[#0F172A] leading-relaxed">{voucher.description || 'No description provided.'}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Reference Number</div>
                <div className="text-sm font-bold text-[#0F172A]">{voucher.ref_no || '-'}</div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 flex justify-between items-end border-t border-[#E2E8F0] pt-10 px-8">
              <div className="text-center">
                <div className="w-48 border-b-2 border-[#0F172A] mb-2"></div>
                <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Prepared By</div>
              </div>
              <div className="flex flex-col items-center justify-center opacity-70">
                <ShieldCheck size={32} className="text-emerald-600 mb-2" />
                <div className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Digitally Verified</div>
                <div className="text-[8px] font-bold text-emerald-600/70">{voucher.id.split('-')[0]}</div>
              </div>
              <div className="text-center">
                <div className="w-48 border-b-2 border-[#0F172A] mb-2"></div>
                <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Authorized Signatory</div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ViewVoucher;
