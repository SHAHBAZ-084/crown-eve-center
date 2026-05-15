// frontend/src/pages/dashboards/branch/POS.jsx
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { Icon } from "../../../components/branch/BranchShared";
import { Package, Search, Filter, Tag, Plus, ShoppingCart, Trash2 } from "lucide-react";
import "../../../styles/pos.css";

const POS = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeMenu, setActiveMenu] = useState("sale-invoices");
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  // Banks State
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ 
    name: "", account_title: "", account_number: "", iban: "", branch_name: "", initial_balance: "" 
  });

  const { data: banks, isLoading: loadingBanks, refetch: refetchBanks } = useQuery({
    queryKey: ['pos-banks-list'],
    queryFn: () => api.get('/banks', {
      params: { branchId: user?.branchId }
    }).then(r => r.data),
    enabled: activeMenu === 'add-bank'
  });

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      await api.post('/banks', { ...bankForm, branchId: user?.branchId });
      alert("Bank account registered successfully!");
      setShowBankForm(false);
      setBankForm({ name: "", account_title: "", account_number: "", iban: "", branch_name: "", initial_balance: "" });
      refetchBanks();
    } catch (err) {
      alert("Failed to register bank: " + (err.response?.data?.message || err.message));
    }
  };

  const renderBanks = () => (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#F3E5DC] shadow-sm">
        <div>
          <h2 className="text-xl font-black text-[#2D1A12]">BRANCH ACCOUNTS</h2>
          <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.2em] mt-1">Management of bank & cash accounts</p>
        </div>
        <button 
          onClick={() => setShowBankForm(true)}
          className="bg-[#E65100] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-[#E65100]/20 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Add New Bank Account
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-[#F3E5DC] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FFFAF8] border-b border-[#F3E5DC]">
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">Bank Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">Account Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">Current Balance</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E5DC]">
              {loadingBanks ? (
                <tr><td colSpan="4" className="px-8 py-12 text-center animate-pulse text-[#8D7A71]">Syncing with ledger...</td></tr>
              ) : (banks?.data || []).length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-12 text-center text-[#8D7A71]">No bank accounts registered for this branch.</td></tr>
              ) : (banks.data.map(b => (
                <tr key={b.id} className="hover:bg-[#FFFAF8]/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl flex items-center justify-center text-[#E65100] font-black text-xs">
                        {b.name?.substring(0,3).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-[#2D1A12] text-sm">{b.name}</div>
                        <div className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-widest mt-0.5">{b.branch_name || "Main Branch"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#2D1A12]">{b.account_title}</div>
                      <div className="text-[10px] font-black text-[#E65100] tracking-widest uppercase">{b.account_number}</div>
                      {b.iban && <div className="text-[9px] text-[#8D7A71] font-bold">IBAN: {b.iban}</div>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-black text-[#2D1A12] text-sm">PKR {b.current_balance?.toLocaleString()}</div>
                    <div className="text-[9px] text-[#8D7A71] font-bold uppercase mt-0.5">Initial: {b.initial_balance?.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Active</span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bank Modal */}
      {showBankForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBankForm(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <header className="px-12 py-8 border-b border-[#F3E5DC] flex justify-between items-center bg-[#FFFAF8]">
              <div>
                <h2 className="text-2xl font-black text-[#2D1A12]">REGISTER BANK ACCOUNT</h2>
                <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.2em] mt-1">Branch Financial Identity</p>
              </div>
              <button className="w-10 h-10 bg-white border border-[#F3E5DC] rounded-full flex items-center justify-center text-[#8D7A71]" onClick={() => setShowBankForm(false)}>
                <Icon n="close" size={20} />
              </button>
            </header>
            
            <form onSubmit={handleAddBank} className="p-12 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Bank Name *</label>
                  <input required type="text" value={bankForm.name} onChange={e => setBankForm({...bankForm, name: e.target.value})} placeholder="e.g. Meezan Bank" className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Branch Name</label>
                  <input type="text" value={bankForm.branch_name} onChange={e => setBankForm({...bankForm, branch_name: e.target.value})} placeholder="e.g. DHA Branch" className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Account Title *</label>
                <input required type="text" value={bankForm.account_title} onChange={e => setBankForm({...bankForm, account_title: e.target.value})} placeholder="e.g. Crown Eve Center" className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Account Number *</label>
                  <input required type="text" value={bankForm.account_number} onChange={e => setBankForm({...bankForm, account_number: e.target.value})} placeholder="Account #" className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Initial Balance (PKR) *</label>
                  <input required type="number" value={bankForm.initial_balance} onChange={e => setBankForm({...bankForm, initial_balance: e.target.value})} placeholder="0.00" className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">IBAN Number</label>
                <input type="text" value={bankForm.iban} onChange={e => setBankForm({...bankForm, iban: e.target.value})} placeholder="PKXX XXXX XXXX XXXX XXXX XXXX" className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm" />
              </div>

              <button type="submit" className="w-full bg-[#E65100] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-[#E65100]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">Save Bank Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Products State
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null); // Detail Modal
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH"); // CASH or BANK
  const [selectedBank, setSelectedBank] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  // Sale Invoice Form State
  const [siForm, setSiForm] = useState({
    type: 'bike',
    items: [], // Array of { id, name, price, qty, stock, model, description }
    customerId: '',
    paymentMethod: 'CASH',
    amount: '',
    bankId: ''
  });
  const [siItemSearch, setSiItemSearch] = useState("");
  const [siCustomerSearch, setSiCustomerSearch] = useState("");
  const debouncedSiItemSearch = useDebounce(siItemSearch, 300);
  const debouncedSiCustomerSearch = useDebounce(siCustomerSearch, 300);

  // Fetch Items for Sale Invoice
  const { data: siItems, isLoading: loadingSiItems } = useQuery({
    queryKey: ['si-items', siForm.type, debouncedSiItemSearch],
    queryFn: () => api.get('/products', {
      params: { branchId: user?.branchId, product_type: siForm.type, search: debouncedSiItemSearch, limit: 50 }
    }).then(r => r.data),
    enabled: activeMenu === 'sale-invoices'
  });

  // Fetch Customers for Sale Invoice
  const { data: siCustomers, isLoading: loadingSiCustomers } = useQuery({
    queryKey: ['si-customers', debouncedSiCustomerSearch],
    queryFn: () => api.get('/walk-in-customers', {
      params: { branchId: user?.branchId, search: debouncedSiCustomerSearch, limit: 50 }
    }).then(r => r.data),
    enabled: activeMenu === 'sale-invoices'
  });

  // Fetch data for checkout
  const { data: customersData } = useQuery({
    queryKey: ['pos-customers-dropdown'],
    queryFn: () => api.get('/walk-in-customers', { params: { branchId: user?.branchId } }).then(r => r.data)
  });

  const { data: banksData } = useQuery({
    queryKey: ['pos-banks-dropdown'],
    queryFn: () => api.get('/banks', { params: { branchId: user?.branchId } }).then(r => r.data)
  });

  // Customers State
  const [customerSearch, setCustomerSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [custForm, setCustForm] = useState({ 
    first_name: "", last_name: "", cnic: "", phone: "", whatsapp: "", address: "", email: "" 
  });

  const { data: customers, isLoading: loadingCustomers, refetch: refetchCustomers } = useQuery({
    queryKey: ['pos-customers-list', customerSearch],
    queryFn: () => api.get('/walk-in-customers', {
      params: { branchId: user?.branchId, search: customerSearch }
    }).then(r => r.data),
    enabled: activeMenu === 'add-customer'
  });

  // Purchase Invoices State
  const [piForm, setPiForm] = useState({
    supplierId: "",
    documentNo: "",
    purchaseNo: "",
    partyInvoiceNo: "",
    remarks: "",
    items: [] // { id, name, brand, category, model, color, engineNo, chassisNo, stockType, qty, rate, amount }
  });
  const [piType, setPiType] = useState(""); // "" (All), "bike", "part"
  const [piSearch, setPiSearch] = useState("");
  const [piSupplierSearch, setPiSupplierSearch] = useState("");
  const debouncedPiSearch = useDebounce(piSearch, 300);
  const debouncedPiSupplierSearch = useDebounce(piSupplierSearch, 300);

  const { data: piSuppliers } = useQuery({
    queryKey: ['pos-suppliers', debouncedPiSupplierSearch],
    queryFn: () => api.get('/suppliers', { params: { search: debouncedPiSupplierSearch } }).then(r => r.data),
    enabled: activeMenu === 'purchase-invoices'
  });

  const { data: piProducts } = useQuery({
    queryKey: ['pos-pi-products', debouncedPiSearch, piType],
    queryFn: () => api.get('/products', { params: { branchId: user?.branchId, search: debouncedPiSearch, product_type: piType, limit: 10 } }).then(r => r.data),
    enabled: activeMenu === 'purchase-invoices' && debouncedPiSearch.length > 1
  });

  const renderPurchaseInvoices = () => {
    const handlePiSubmit = async (e) => {
      e.preventDefault();
      if (!piForm.supplierId) return alert("Please select a supplier");
      if (piForm.items.length === 0) return alert("Please add at least one item");

      try {
        const payload = {
          branchId: user?.branchId,
          supplierId: piForm.supplierId,
          total: piForm.items.reduce((s, i) => s + i.amount, 0),
          remarks: piForm.remarks,
          documentNo: piForm.documentNo,
          purchaseNo: piForm.purchaseNo,
          partyInvoiceNo: piForm.partyInvoiceNo,
          items: piForm.items.map(i => ({
            productId: i.id,
            quantity: i.qty,
            cost: i.rate,
            engineNo: i.engineNo,
            chassisNo: i.chassisNo,
            stockType: i.stockType
          }))
        };
        await api.post('/purchases', payload);
        alert("Purchase invoice generated successfully!");
        setPiForm({ supplierId: "", documentNo: "", purchaseNo: "", partyInvoiceNo: "", remarks: "", items: [] });
        setPiSupplierSearch("");
      } catch (err) {
        alert("Failed to save purchase: " + (err.response?.data?.message || err.message));
      }
    };

    const addItemToPi = (p) => {
      const newItem = {
        id: p.id,
        name: p.name,
        brand: p.brand?.name || "N/A",
        category: p.category?.name || "N/A",
        model: p.partDetail?.model || p.bikeDetail?.motor_type || "N/A",
        color: "N/A",
        engineNo: "",
        chassisNo: "",
        stockType: "New",
        qty: 1,
        rate: p.price || 0,
        amount: p.price || 0
      };
      setPiForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
      setPiSearch("");
    };

    const updatePiItem = (idx, field, val) => {
      setPiForm(prev => {
        const items = [...prev.items];
        items[idx][field] = val;
        if (field === 'qty' || field === 'rate') {
          items[idx].amount = (Number(items[idx].qty) || 0) * (Number(items[idx].rate) || 0);
        }
        return { ...prev, items };
      });
    };

    const removePiItem = (idx) => {
      setPiForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#F3E5DC] shadow-sm w-full">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-[#2D1A12] uppercase tracking-tight">Purchase Invoice</h2>
              <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.3em] mt-2">Inventory Procurement Terminal</p>
            </div>
            <div className="flex gap-4">
               <div className="text-right">
                 <div className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Date</div>
                 <div className="font-black text-sm text-[#2D1A12]">{new Date().toLocaleDateString()}</div>
               </div>
            </div>
          </div>

          <form onSubmit={handlePiSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FFFAF8] p-6 rounded-3xl border border-[#F3E5DC]">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Supplier Selection *</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search Supplier..." 
                    value={piSupplierSearch}
                    onChange={(e) => {
                      setPiSupplierSearch(e.target.value);
                      if(piForm.supplierId) setPiForm({...piForm, supplierId: ""});
                    }}
                    className="w-full bg-white border border-[#F3E5DC] rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-xs" 
                  />
                </div>
                {piSupplierSearch && !piForm.supplierId && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#F3E5DC] rounded-xl shadow-xl max-h-40 overflow-y-auto">
                    {piSuppliers?.map(s => (
                      <div key={s.id} onClick={() => { setPiForm({...piForm, supplierId: s.id}); setPiSupplierSearch(s.name); }} className="px-4 py-2 hover:bg-[#FFFAF8] cursor-pointer text-xs font-bold border-b border-[#F3E5DC] last:border-none">
                        {s.name} ({s.contact})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Document #</label>
                <input type="text" value={piForm.documentNo} onChange={e => setPiForm({...piForm, documentNo: e.target.value})} className="w-full bg-white border border-[#F3E5DC] rounded-xl py-2.5 px-4 outline-none font-bold text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Party Invoice #</label>
                <input type="text" value={piForm.partyInvoiceNo} onChange={e => setPiForm({...piForm, partyInvoiceNo: e.target.value})} className="w-full bg-white border border-[#F3E5DC] rounded-xl py-2.5 px-4 outline-none font-bold text-xs" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center px-2 gap-4">
                <div className="flex items-center gap-6">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Inventory Items</label>
                  <div className="flex bg-[#FFFAF8] p-1 rounded-full border border-[#F3E5DC]">
                    <button type="button" onClick={() => setPiType("")} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${piType === "" ? 'bg-[#E65100] text-white shadow-md' : 'text-[#8D7A71]'}`}>All</button>
                    <button type="button" onClick={() => setPiType("bike")} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${piType === "bike" ? 'bg-[#E65100] text-white shadow-md' : 'text-[#8D7A71]'}`}>Bikes</button>
                    <button type="button" onClick={() => setPiType("part")} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${piType === "part" ? 'bg-[#E65100] text-white shadow-md' : 'text-[#8D7A71]'}`}>Parts</button>
                  </div>
                </div>
                <div className="relative w-72">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={14} />
                  <input 
                    type="text" 
                    placeholder={`Search ${piType || 'all products'}...`} 
                    value={piSearch}
                    onChange={(e) => setPiSearch(e.target.value)}
                    className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-[10px]" 
                  />
                  {piSearch && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#F3E5DC] rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {piProducts?.data?.map(p => (
                        <div key={p.id} onClick={() => addItemToPi(p)} className="px-4 py-2 hover:bg-[#FFFAF8] cursor-pointer text-[10px] font-bold border-b border-[#F3E5DC] last:border-none flex justify-between">
                          <span>{p.name}</span>
                          <span className="text-[#E65100]">PKR {p.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-[#F3E5DC] bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FFFAF8] border-b border-[#F3E5DC]">
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest">Item / Brand</th>
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest">Engine #</th>
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest">Chassis #</th>
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest text-center">Type</th>
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest text-center">Qty</th>
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest text-right">Rate</th>
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest text-right">Amount</th>
                      <th className="px-4 py-3 text-[9px] font-black text-[#8D7A71] uppercase tracking-widest text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3E5DC]">
                    {piForm.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FFFAF8]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-black text-[#2D1A12] text-[10px] uppercase">{item.name}</div>
                          <div className="text-[8px] font-bold text-[#8D7A71] uppercase">{item.brand} • {item.model}</div>
                        </td>
                        <td className="px-4 py-3">
                          <input type="text" value={item.engineNo} onChange={e => updatePiItem(idx, 'engineNo', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-[#E65100] outline-none text-[10px] font-bold py-1" placeholder="Engine #" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="text" value={item.chassisNo} onChange={e => updatePiItem(idx, 'chassisNo', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-[#E65100] outline-none text-[10px] font-bold py-1" placeholder="Chassis #" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select value={item.stockType} onChange={e => updatePiItem(idx, 'stockType', e.target.value)} className="bg-transparent text-[9px] font-black uppercase outline-none">
                            <option value="New">New</option>
                            <option value="Old">Old</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input type="number" value={item.qty} onChange={e => updatePiItem(idx, 'qty', e.target.value)} className="w-12 bg-transparent text-center text-[10px] font-black outline-none" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input type="number" value={item.rate} onChange={e => updatePiItem(idx, 'rate', e.target.value)} className="w-20 bg-transparent text-right text-[10px] font-black outline-none" />
                        </td>
                        <td className="px-4 py-3 text-right font-black text-[10px] text-[#E65100]">
                          {(item.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button type="button" onClick={() => removePiItem(idx)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {piForm.items.length === 0 && (
                      <tr><td colSpan="8" className="px-4 py-12 text-center text-[10px] font-bold text-[#8D7A71] uppercase tracking-widest">No items added to invoice yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Remarks / Internal Notes</label>
                <textarea value={piForm.remarks} onChange={e => setPiForm({...piForm, remarks: e.target.value})} className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-xs min-h-[100px]" placeholder="Enter any specific details about this purchase..."></textarea>
              </div>
              <div className="bg-[#2D1A12] p-8 rounded-[2.5rem] text-white shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Total Items</span>
                  <span className="font-black">{piForm.items.reduce((s, i) => s + (Number(i.qty) || 0), 0)}</span>
                </div>
                <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Net Amount Payable</span>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#E65100] uppercase tracking-widest mb-1">Grand Total</div>
                    <div className="text-3xl font-black">PKR {piForm.items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#E65100] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#E65100]/20 flex items-center justify-center gap-3">
                  <Icon n="check" size={18} /> Save Purchase Invoice
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/walk-in-customers', { 
        ...custForm, 
        branchId: user?.branchId
      });
      alert("Walk-in customer registered successfully!");
      setShowAddForm(false);
      setCustForm({ first_name: "", last_name: "", cnic: "", phone: "", whatsapp: "", address: "", email: "" });
      refetchCustomers();
    } catch (err) {
      alert("Failed to register customer: " + (err.response?.data?.message || err.message));
    }
  };

  const renderCustomers = () => (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-[#F3E5DC] shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
            <input 
              type="text"
              placeholder="Search customers by name or phone..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#E65100]/20 outline-none font-bold text-sm"
            />
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#E65100] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-[#E65100]/20 hover:scale-105 transition-all"
        >
          <Plus size={18} /> Register Walk-in Customer
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-[#F3E5DC] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FFFAF8] border-b border-[#F3E5DC]">
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">Customer Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">Contact Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">Location</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E5DC]">
              {loadingCustomers ? (
                <tr><td colSpan="4" className="px-8 py-12 text-center animate-pulse text-[#8D7A71]">Loading database...</td></tr>
              ) : (customers?.data || []).length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-12 text-center text-[#8D7A71]">No customers found in record.</td></tr>
              ) : (customers.data.map(c => (
                <tr key={c.id} className="hover:bg-[#FFFAF8]/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl flex items-center justify-center text-[#E65100] font-black text-lg">
                        {c.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="font-black text-[#2D1A12] text-sm">{c.first_name} {c.last_name}</div>
                        <div className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-widest mt-0.5">ID: {c.id.slice(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#2D1A12] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {c.phone}
                      </div>
                      {c.whatsapp && (
                        <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-2">
                           WA: {c.whatsapp}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-[#8D7A71] uppercase tracking-widest">{c.address || "Walk-in"}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[10px] font-black text-[#E65100] hover:underline uppercase tracking-widest">Select to Invoice</button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <header className="px-12 py-8 border-b border-[#F3E5DC] flex justify-between items-center bg-[#FFFAF8]">
              <div>
                <h2 className="text-2xl font-black text-[#2D1A12]">REGISTER CUSTOMER</h2>
                <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.2em] mt-1">Walk-in Customer Profile</p>
              </div>
              <button className="w-10 h-10 bg-white border border-[#F3E5DC] rounded-full flex items-center justify-center text-[#8D7A71]" onClick={() => setShowAddForm(false)}>
                <Icon n="close" size={20} />
              </button>
            </header>
            
            <form onSubmit={handleAddCustomer} className="p-12 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">First Name *</label>
                  <input 
                    required
                    type="text" 
                    value={custForm.first_name} 
                    onChange={e => setCustForm({...custForm, first_name: e.target.value})}
                    placeholder="Enter first name"
                    className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Last Name (Surname) *</label>
                  <input 
                    required
                    type="text" 
                    value={custForm.last_name} 
                    onChange={e => setCustForm({...custForm, last_name: e.target.value})}
                    placeholder="Enter last name"
                    className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">CNIC (Identity Card) *</label>
                <input 
                  required
                  type="text" 
                  value={custForm.cnic} 
                  onChange={e => setCustForm({...custForm, cnic: e.target.value})}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Phone Number *</label>
                  <input 
                    required
                    type="text" 
                    value={custForm.phone} 
                    onChange={e => setCustForm({...custForm, phone: e.target.value})}
                    placeholder="03XX-XXXXXXX"
                    className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={custForm.whatsapp} 
                    onChange={e => setCustForm({...custForm, whatsapp: e.target.value})}
                    placeholder="Optional"
                    className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Current Address *</label>
                <textarea 
                  required
                  value={custForm.address} 
                  onChange={e => setCustForm({...custForm, address: e.target.value})}
                  placeholder="Enter full residential address"
                  className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm min-h-[100px]"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#E65100] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-[#E65100]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Complete Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderSaleInvoices = () => {
    const handleSiSubmit = async (e) => {
      e.preventDefault();
      if (siForm.items.length === 0) return alert("Please add at least one product");
      if (!siForm.customerId) return alert("Please select a customer");
      if (!siForm.amount || siForm.amount <= 0) return alert("Please enter a valid amount");

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
        setGeneratedInvoice(res.data);
        setSiForm({ ...siForm, items: [], amount: '', bankId: '', customerId: '' });
        setSiItemSearch("");
        setSiCustomerSearch("");
        
        // Refresh inventory and customer data
        queryClient.invalidateQueries(['si-items']);
        queryClient.invalidateQueries(['si-customers']);
      } catch (err) {
        alert("Failed to generate invoice: " + (err.response?.data?.message || err.message));
      }
    };

    const addItemToSi = (product) => {
      setSiForm(prev => {
        const exists = prev.items.find(i => i.id === product.id);
        if (exists) {
          const newItems = prev.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
          const newTotal = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
          return { ...prev, items: newItems, amount: newTotal };
        }
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          stock: product.stock_qty,
          model: product.partDetail?.model || product.bikeDetail?.motor_type || "N/A",
          description: product.partDetail?.description || product.bikeDetail?.battery_type || ""
        };
        const newItems = [...prev.items, newItem];
        const newTotal = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
        return { ...prev, items: newItems, amount: newTotal };
      });
      setSiItemSearch("");
    };

    const updateItemQty = (id, delta) => {
      setSiForm(prev => {
        const newItems = prev.items.map(i => {
          if (i.id === id) {
            const newQty = Math.max(1, Math.min(i.stock, i.qty + delta));
            return { ...i, qty: newQty };
          }
          return i;
        });
        const newTotal = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
        return { ...prev, items: newItems, amount: newTotal };
      });
    };

    const removeItemFromSi = (id) => {
      setSiForm(prev => {
        const newItems = prev.items.filter(i => i.id !== id);
        const newTotal = newItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
        return { ...prev, items: newItems, amount: newTotal };
      });
    };

    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#F3E5DC] shadow-sm max-w-5xl mx-auto w-full">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-[#2D1A12] uppercase tracking-tight">Generate Sale Invoice</h2>
            <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.3em] mt-2">Professional Billing Terminal</p>
          </div>

          <form onSubmit={handleSiSubmit} className="space-y-10">
            {/* 1. Category Toggle */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Product Category</label>
              <div className="flex gap-4 p-2 bg-[#FFFAF8] border border-[#F3E5DC] rounded-[2rem] w-fit">
                <button 
                  type="button"
                  onClick={() => setSiForm({...siForm, type: 'bike'})}
                  className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${siForm.type === 'bike' ? 'bg-[#E65100] text-white shadow-lg shadow-[#E65100]/20' : 'text-[#8D7A71] hover:bg-white'}`}
                >
                  <Icon n="dashboard" size={16} /> Electric Bikes
                </button>
                <button 
                  type="button"
                  onClick={() => setSiForm({...siForm, type: 'part'})}
                  className={`px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${siForm.type === 'part' ? 'bg-[#E65100] text-white shadow-lg shadow-[#E65100]/20' : 'text-[#8D7A71] hover:bg-white'}`}
                >
                  <Icon n="inventory" size={16} /> Spare Parts
                </button>
              </div>
            </div>

            {/* 2. Searchable Item Select */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Quick Add {siForm.type === 'bike' ? 'Bike' : 'Part'}</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
                  <input 
                    type="text"
                    placeholder={`Search ${siForm.type} by name, model or description...`}
                    value={siItemSearch}
                    onChange={(e) => setSiItemSearch(e.target.value)}
                    className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-5 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                  />
                </div>
                {siItemSearch && (
                  <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-[#F3E5DC] rounded-3xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar">
                    {loadingSiItems ? (
                      <div className="p-6 text-center animate-pulse text-[#8D7A71] text-xs font-bold uppercase">Searching database...</div>
                    ) : siItems?.data?.length === 0 ? (
                      <div className="p-6 text-center text-[#8D7A71] text-xs font-bold uppercase">No matching items found</div>
                    ) : (
                      siItems.data.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => addItemToSi(item)}
                          className="px-6 py-4 hover:bg-[#FFFAF8] cursor-pointer border-b border-[#F3E5DC] last:border-none group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-black text-[#2D1A12] text-sm uppercase group-hover:text-[#E65100] transition-colors">{item.name}</div>
                            <div className="text-[#E65100] font-black text-xs">PKR {item.price.toLocaleString()}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-tighter">
                              Model: <span className="text-[#2D1A12]">{item.partDetail?.model || item.bikeDetail?.motor_type || "Standard"}</span> • 
                              Stock: <span className={item.stock_qty > 0 ? "text-emerald-600" : "text-red-600"}>{item.stock_qty} Units</span>
                            </div>
                            <div className="text-[9px] text-[#8D7A71] italic truncate max-w-[200px]">
                              {item.partDetail?.description || item.bikeDetail?.battery_type || ""}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Selected Items Table */}
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
                              <button type="button" onClick={() => updateItemQty(item.id, -1)} className="w-6 h-6 rounded-full bg-white border border-[#F3E5DC] flex items-center justify-center text-xs font-black hover:bg-[#F3E5DC] transition-colors">−</button>
                              <span className="font-black text-xs w-6 text-center">{item.qty}</span>
                              <button type="button" onClick={() => updateItemQty(item.id, 1)} className="w-6 h-6 rounded-full bg-white border border-[#F3E5DC] flex items-center justify-center text-xs font-black hover:bg-[#F3E5DC] transition-colors">+</button>
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
              {/* 4. Customer Select */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Assign Customer</label>
                <div className="relative">
                  <div className="relative">
                    <Icon n="user" className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search name or phone..."
                      value={siCustomerSearch}
                      onChange={(e) => {
                        setSiCustomerSearch(e.target.value);
                        if (siForm.customerId) setSiForm({ ...siForm, customerId: '' });
                      }}
                      className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl py-5 pl-16 pr-6 outline-none focus:ring-2 focus:ring-[#E65100]/20 font-bold text-sm"
                    />
                  </div>
                  {siCustomerSearch && !siForm.customerId && (
                    <div className="absolute z-10 left-0 right-0 mt-2 bg-white border border-[#F3E5DC] rounded-3xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                      {loadingSiCustomers ? (
                        <div className="p-6 text-center animate-pulse text-[#8D7A71] text-xs font-bold uppercase">Fetching records...</div>
                      ) : siCustomers?.data?.length === 0 ? (
                        <div className="p-6 text-center text-[#8D7A71] text-xs font-bold uppercase">Customer not found</div>
                      ) : (
                        siCustomers.data.map(cust => (
                          <div 
                            key={cust.id}
                            onClick={() => {
                              setSiForm({...siForm, customerId: cust.id});
                              setSiCustomerSearch(`${cust.first_name} ${cust.last_name} (${cust.phone})`);
                            }}
                            className="px-6 py-4 hover:bg-[#FFFAF8] cursor-pointer border-b border-[#F3E5DC] last:border-none"
                          >
                            <div className="font-black text-[#2D1A12] text-sm uppercase">{cust.first_name} {cust.last_name}</div>
                            <div className="text-[10px] font-bold text-[#8D7A71] tracking-widest">{cust.phone}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Total Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em] ml-2">Invoice Summary</label>
                  <div className="text-[10px] font-black text-[#E65100] uppercase tracking-widest">
                    Payable Amount
                  </div>
                </div>
                <div className="bg-[#E65100] p-8 rounded-[2rem] text-white shadow-xl shadow-[#E65100]/20">
                  <div className="text-[10px] font-bold text-[#FFFAF8]/80 uppercase tracking-[0.2em] mb-2">Total Bill Amount</div>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80 font-black text-xl">PKR</span>
                    <input 
                      type="number"
                      value={siForm.amount}
                      onChange={(e) => setSiForm({...siForm, amount: e.target.value})}
                      placeholder="0"
                      className="w-full bg-transparent border-b-2 border-white/30 py-2 pl-12 pr-4 outline-none focus:border-white font-black text-4xl text-white placeholder-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#2D1A12] text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-[#E65100] hover:scale-[1.01] active:scale-95 transition-all mt-6 flex items-center justify-center gap-4"
            >
              <Icon n="check" size={20} /> Complete Sale & Print Invoice
            </button>
          </form>
        </div>
      </div>
    );
  };

  const menuGroups = [
    {
      title: "GENERAL",
      items: [
        { id: "add-customer", label: "Add Customer", icon: "user" },
        { id: "add-bank", label: "Add Bank", icon: "dollar" },
      ]
    },
    {
      title: "VOUCHERS",
      items: [
        { id: "payment-voucher", label: "Payment Voucher", icon: "orders" },
        { id: "receipt-voucher", label: "Receipt Voucher", icon: "plus" },
        { id: "journal-voucher", label: "Journal Voucher", icon: "settings" },
      ]
    },
    {
      title: "INVOICES",
      items: [
        { id: "sale-invoices", label: "Sale Invoices", icon: "tag" },
        { id: "purchase-invoices", label: "Purchase Invoices", icon: "inventory" },
      ]
    },
    {
      title: "REPORTS",
      items: [
        { id: "account-ledger", label: "Account Ledger", icon: "reports" },
        { id: "debit-trail", label: "Debit Trail Balance", icon: "reports" },
      ]
    }
  ];

  const { data: products, isLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['pos-products-list', debouncedSearch, type, page],
    queryFn: () => api.get('/products', {
      params: { branchId: user?.branchId, search: debouncedSearch, product_type: type, limit: 20, page }
    }).then(r => r.data),
    enabled: activeMenu === 'products'
  });

  const addToCart = (e, product) => {
    e.stopPropagation(); // Prevent detail modal from opening
    if (product.stock_qty <= 0) {
      return alert("Insufficient stock! This product is currently out of stock.");
    }
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        if (exists.qty >= product.stock_qty) {
          alert("Cannot add more than available stock!");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) return alert("Please select a customer");
    if (paymentMode === "BANK" && !selectedBank) return alert("Please select a bank account");

    try {
      const payload = {
        branchId: user?.branchId,
        walkInCustomerId: selectedCustomer,
        bankId: paymentMode === "BANK" ? selectedBank : null,
        payment_method: paymentMode,
        total: cartTotal,
        type: 'POS',
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
          price: item.price
        }))
      };

      const res = await api.post('/orders', payload);
      setGeneratedInvoice(res.data);
      refetchProducts();
      setCart([]);
      setSelectedCustomer("");
      setSelectedBank("");
      setPaymentMode("CASH");
    } catch (err) {
      alert("Failed to generate invoice: " + (err.response?.data?.message || err.message));
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const renderInvoiceModal = () => {
    if (!generatedInvoice) return null;
    const inv = generatedInvoice;
    const cust = (customersData?.data || []).find(c => c.id === inv.walkInCustomerId);

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 print:p-0 print:static">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md print:hidden" onClick={() => setGeneratedInvoice(null)} />
        <div className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] print:shadow-none print:rounded-none print:max-h-none print:w-full">
          <header className="px-12 py-8 border-b border-[#F3E5DC] flex justify-between items-center bg-[#FFFAF8] print:hidden">
            <div>
              <h2 className="text-2xl font-black text-[#2D1A12]">INVOICE GENERATED</h2>
              <p className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.2em] mt-1">Transaction Success</p>
            </div>
            <div className="flex gap-4">
              <button onClick={printInvoice} className="bg-white border border-[#F3E5DC] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#FFFAF8]">
                 Print Invoice
              </button>
              <button className="w-10 h-10 bg-white border border-[#F3E5DC] rounded-full flex items-center justify-center text-[#8D7A71]" onClick={() => setGeneratedInvoice(null)}>
                <Icon n="close" size={20} />
              </button>
            </div>
          </header>

          <div id="printable-invoice" className="p-12 overflow-y-auto space-y-10 custom-scrollbar print:p-8 print:overflow-visible">
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-2xl font-black text-[#E65100]">CROWN EVE</div>
                <div className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-[0.2em]">Branch Terminal Invoice</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm font-black text-[#2D1A12]">INV #{inv.id.toString().padStart(6, '0')}</div>
                <div className="text-[10px] font-bold text-[#8D7A71] uppercase">{new Date(inv.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 py-8 border-y border-[#F3E5DC]">
              <div className="space-y-4">
                <div className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Bill To:</div>
                <div className="space-y-1">
                  <div className="font-black text-[#2D1A12]">{cust ? `${cust.first_name} ${cust.last_name}` : "Walk-in Customer"}</div>
                  <div className="text-xs text-[#8D7A71]">{cust?.phone || "N/A"}</div>
                  <div className="text-[10px] text-[#8D7A71] uppercase max-w-[200px]">{cust?.address || "Store Sale"}</div>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <div className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest">Payment Info:</div>
                <div className="space-y-1">
                  <div className="font-black text-[#E65100] uppercase text-xs">{inv.payment_method}</div>
                  <div className="text-[10px] text-[#8D7A71] uppercase">Status: PAID / COMPLETED</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F3E5DC]">
                  <th className="py-4 text-[10px] font-black text-[#8D7A71] uppercase">Item Description</th>
                  <th className="py-4 text-[10px] font-black text-[#8D7A71] uppercase text-center">Qty</th>
                  <th className="py-4 text-[10px] font-black text-[#8D7A71] uppercase text-right">Price</th>
                  <th className="py-4 text-[10px] font-black text-[#8D7A71] uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E5DC]">
                {inv.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 text-xs font-black text-[#2D1A12] uppercase tracking-tight">{item.product?.name || "Product"}</td>
                    <td className="py-4 text-xs font-bold text-[#8D7A71] text-center">{item.quantity}</td>
                    <td className="py-4 text-xs font-bold text-[#8D7A71] text-right">{item.price.toLocaleString()}</td>
                    <td className="py-4 text-xs font-black text-[#2D1A12] text-right">{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="pt-8 flex flex-col items-end space-y-2">
              <div className="flex justify-between w-48 text-[10px] font-black text-[#8D7A71] uppercase">
                <span>Subtotal</span>
                <span>PKR {inv.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-48 pt-4 border-t border-[#F3E5DC] text-[#E65100]">
                <span className="text-[10px] font-black uppercase">Grand Total</span>
                <span className="text-xl font-black">PKR {inv.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-12 text-center">
              <div className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.3em]">Thank you for shopping with us!</div>
              <div className="text-[8px] text-[#8D7A71] mt-2 font-bold uppercase">This is a computer generated invoice and does not require a signature.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const renderProducts = () => (
    <div className="flex h-full gap-6 overflow-hidden">
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-[#F3E5DC] shadow-sm">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7A71]" size={18} />
            <input 
              type="text"
              placeholder="Search by name, model or item code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFAF8] border border-[#F3E5DC] rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[#E65100]/20 outline-none font-bold text-sm"
            />
          </div>
          <div className="flex bg-[#FFFAF8] p-1 rounded-2xl border border-[#F3E5DC]">
            <button 
              onClick={() => setType("")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === "" ? 'bg-[#E65100] text-white shadow-lg' : 'text-[#8D7A71] hover:text-[#E65100]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setType("bike")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === "bike" ? 'bg-[#E65100] text-white shadow-lg' : 'text-[#8D7A71] hover:text-[#E65100]'}`}
            >
              Bikes
            </button>
            <button 
              onClick={() => setType("part")}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === "part" ? 'bg-[#E65100] text-white shadow-lg' : 'text-[#8D7A71] hover:text-[#E65100]'}`}
            >
              Parts
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#8D7A71] font-bold text-xs uppercase tracking-widest">
          <Filter size={14} /> <span>{products?.data?.length || 0} Products</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pr-2 custom-scrollbar">
        {isLoading ? [...Array(8)].map((_, i) => <div key={i} className="h-72 bg-white/50 animate-pulse rounded-[2.5rem] border border-[#F3E5DC]" />) : (
          (products?.data || [])
            .map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProduct(p)}
              className="bg-white border border-[#F3E5DC] p-4 rounded-[2.5rem] hover:border-[#E65100] transition-all group shadow-sm hover:shadow-xl cursor-pointer relative flex flex-col"
            >
              <div className="w-full h-44 bg-[#FFFAF8] rounded-[2rem] overflow-hidden relative mb-4">
                {p.images?.[0] ? (
                  <img 
                    src={p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`} 
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20"><Package size={48} /></div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-[#F3E5DC]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#E65100]">{p.product_type}</span>
                </div>
              </div>
              <div className="px-2 flex-1">
                <h4 className="font-bold text-sm text-[#2D1A12] line-clamp-1 mb-1">{p.name}</h4>
                <div className="flex items-center justify-between mb-4">
                  {p.category && (
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-[#8D7A71]" />
                      <span className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-widest">{p.category?.name}</span>
                    </div>
                  )}
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-md ${p.stock_qty > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    QTY: {p.stock_qty || 0}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#F3E5DC] mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#8D7A71] uppercase">Price</span>
                    <span className="font-black text-[#E65100]">PKR {p.price.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={(e) => addToCart(e, p)}
                    className="w-10 h-10 bg-[#E65100] text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-lg shadow-[#E65100]/20"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

        {/* Pagination Controls */}
        {products?.meta?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 py-6 border-t border-[#F3E5DC] mt-4">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-6 py-2.5 bg-white border border-[#F3E5DC] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#FFFAF8] disabled:opacity-30 transition-all">Previous</button>
            <div className="text-[11px] font-black text-[#8D7A71] uppercase tracking-widest">Page <span className="text-[#E65100]">{page}</span> of {products.meta.totalPages}</div>
            <button disabled={page === products.meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-6 py-2.5 bg-white border border-[#F3E5DC] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#FFFAF8] disabled:opacity-30 transition-all">Next</button>
          </div>
        )}
      </div>

      {/* POS Cart Sidebar */}
      <div className="w-[400px] bg-white border border-[#F3E5DC] rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden">
        <div className="p-8 border-b border-[#F3E5DC] flex justify-between items-center bg-[#FFFAF8]">
          <div>
            <h3 className="font-black text-[#2D1A12] text-lg uppercase tracking-tight">Current Order</h3>
            <div className="text-[10px] font-bold text-[#8D7A71] uppercase tracking-widest mt-0.5">{cart.length} Items Selected</div>
          </div>
          <div className="w-10 h-10 bg-[#E65100]/10 rounded-2xl flex items-center justify-center text-[#E65100]">
            <ShoppingCart size={20} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="w-20 h-20 bg-[#F3E5DC] rounded-full flex items-center justify-center mb-4">
                <Package size={32} />
              </div>
              <p className="text-xs font-black text-[#2D1A12] uppercase tracking-widest">Cart is empty</p>
              <p className="text-[10px] font-bold text-[#8D7A71] uppercase mt-2">Add products to start an invoice</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-[#FFFAF8] border border-[#F3E5DC] rounded-3xl p-4 flex gap-4 group">
                <div className="w-16 h-16 bg-white rounded-2xl border border-[#F3E5DC] p-2 flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0].url.startsWith('http') ? item.images[0].url : `http://localhost:5000${item.images[0].url}`} className="w-full h-full object-contain" />
                  ) : <Package className="w-full h-full opacity-20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-[11px] text-[#2D1A12] uppercase truncate pr-2">{item.name}</h4>
                    <button onClick={() => removeFromCart(item.id)} className="text-[#8D7A71] hover:text-red-500 transition-colors">
                      <Icon n="close" size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] font-black text-[#E65100] mb-3">PKR {item.price.toLocaleString()}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-white border border-[#F3E5DC] rounded-xl p-1 gap-3">
                      <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-[#8D7A71] hover:text-[#E65100]">-</button>
                      <span className="text-[10px] font-black text-[#2D1A12] w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-[#8D7A71] hover:text-[#E65100]">+</button>
                    </div>
                    <div className="text-xs font-black text-[#2D1A12]">PKR {(item.price * item.qty).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-[#FFFAF8] border-t border-[#F3E5DC] space-y-5">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Assign Customer</label>
            <select 
              value={selectedCustomer} 
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full bg-white border border-[#F3E5DC] rounded-2xl py-3 px-4 outline-none font-bold text-xs appearance-none"
            >
              <option value="">Select Walk-in Customer</option>
              {(customersData?.data || []).map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.phone})</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Payment Method</label>
            <div className="flex gap-2 p-1 bg-white border border-[#F3E5DC] rounded-2xl">
              <button 
                onClick={() => setPaymentMode("CASH")}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMode === "CASH" ? 'bg-[#E65100] text-white shadow-md' : 'text-[#8D7A71]'}`}
              >
                Cash
              </button>
              <button 
                onClick={() => setPaymentMode("BANK")}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMode === "BANK" ? 'bg-[#E65100] text-white shadow-md' : 'text-[#8D7A71]'}`}
              >
                Bank / Account
              </button>
            </div>
          </div>

          {/* Bank Selection (Conditional) */}
          {paymentMode === "BANK" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-[#8D7A71] uppercase tracking-widest ml-1">Select Bank Account</label>
              <select 
                value={selectedBank} 
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full bg-white border border-[#F3E5DC] rounded-2xl py-3 px-4 outline-none font-bold text-xs appearance-none"
              >
                <option value="">Choose Bank...</option>
                {(banksData?.data || []).map(b => (
                  <option key={b.id} value={b.id}>{b.name} - {b.account_number}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-[#F3E5DC] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-[#8D7A71] uppercase tracking-[0.2em]">Subtotal</span>
              <span className="font-black text-[#2D1A12]">PKR {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[#E65100]">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Grand Total</span>
              <span className="text-xl font-black">PKR {cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedCustomer || (paymentMode === "BANK" && !selectedBank)}
              className="w-full bg-[#E65100] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#E65100]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3 mt-4"
            >
              Generate Invoice & Sell <Icon n="tag" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <button className="absolute top-6 right-6 z-10 w-10 h-10 bg-[#FFFAF8] rounded-full flex items-center justify-center text-[#8D7A71]" onClick={() => setSelectedProduct(null)}>
              <Icon n="close" size={24} />
            </button>
            
            <div className="w-full md:w-1/2 bg-[#FFFAF8] p-12 flex items-center justify-center">
              {selectedProduct.images?.[0] ? (
                <img src={selectedProduct.images[0].url.startsWith('http') ? selectedProduct.images[0].url : `http://localhost:5000${selectedProduct.images[0].url}`} className="w-full h-full object-contain" />
              ) : <Package size={120} className="opacity-10" />}
            </div>

            <div className="flex-1 p-12 overflow-y-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E65100] bg-[#E65100]/5 px-4 py-1.5 rounded-full mb-6 inline-block">Product Details</span>
              <h2 className="text-3xl font-black text-[#2D1A12] mb-2">{selectedProduct.name}</h2>
              {selectedProduct.category && (
                <div className="flex items-center gap-3 text-[#8D7A71] mb-8 font-bold text-sm">
                  <Tag size={16} /> {selectedProduct.category?.name} • {selectedProduct.product_type}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#FFFAF8] p-6 rounded-3xl border border-[#F3E5DC]">
                  <span className="block text-[10px] font-bold text-[#8D7A71] uppercase mb-1">Retail Price</span>
                  <span className="text-2xl font-black text-[#E65100]">PKR {selectedProduct.price.toLocaleString()}</span>
                </div>
                <div className="bg-[#FFFAF8] p-6 rounded-3xl border border-[#F3E5DC]">
                  <span className="block text-[10px] font-bold text-[#8D7A71] uppercase mb-1">Stock Status</span>
                  <span className={`text-lg font-black ${selectedProduct.stock_qty > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedProduct.stock_qty || 0} Units Available
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-3 border-b border-[#F3E5DC]">
                  <span className="text-xs font-bold text-[#8D7A71] uppercase">Category</span>
                  <span className="text-xs font-black text-[#2D1A12]">{selectedProduct.category?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#F3E5DC]">
                  <span className="text-xs font-bold text-[#8D7A71] uppercase">Product Type</span>
                  <span className="text-xs font-black text-[#2D1A12]">{selectedProduct.product_type || "N/A"}</span>
                </div>
              </div>

              <button 
                onClick={(e) => { addToCart(e, selectedProduct); setSelectedProduct(null); }}
                className="w-full bg-[#E65100] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-[#E65100]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingCart size={18} /> Add to Order Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "add-customer":
        return renderCustomers();
      case "add-bank":
        return renderBanks();
      case "purchase-invoices":
        return renderPurchaseInvoices();
      default:
        return <div className="card ci"><h2>{activeMenu.replace("-", " ").toUpperCase()}</h2><p>Feature coming soon...</p></div>;
    }
  };

  return (
    <div className="pos-shell">
      {/* Mobile Sidebar Overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen && window.innerWidth <= 1024 ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* POS Sidebar */}
      <div className={`pos-sidebar ${isSidebarOpen ? "open" : ""}`} style={{ width: isSidebarOpen ? 280 : 0, minWidth: isSidebarOpen ? 280 : 0 }}>
        <div className="pos-brand">
          <div className="pos-logo-box">CE</div>
          <div className="pos-brand-text">
            <div className="pos-brand-name">
              <span className="dark">CROWN</span>
              <span className="orange">EVE</span>
            </div>
            <div className="pos-brand-sub">BRANCH TERMINAL</div>
          </div>
          {/* Mobile Close Button */}
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
            <Icon n="close" size={20} />
          </button>
        </div>

        <div className="pos-menu-scroll">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="pos-menu-group">
              <div className="pos-menu-group-title">{group.title}</div>
              {group.items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { setActiveMenu(item.id); if(window.innerWidth <= 1024) setSidebarOpen(false); }}
                  className={`pos-menu-item ${activeMenu === item.id ? "active" : ""}`}
                >
                  <Icon n={item.icon} size={16} className="icon" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="pos-user-card">
          <div className="user-avatar">B</div>
          <div className="user-info">
            <span className="user-name">Branch Owner</span>
            <span className="user-role">Local Station</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pos-main">
        <header className="pos-header">
          <div className="pos-header-left">
            <button className="btn-ico" onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'inherit' }}>
              <Icon n="menu" size={20} />
            </button>
            <div className="pos-header-title">
              {activeMenu.replace("-", " ")}
            </div>
          </div>
          
          <div className="pos-header-actions">
            <div className="status-pill">
              <span className="status-dot" /> <span>Live Status</span>
            </div>
            <button className="btn-quick-pos">
              <Icon n="plus" size={14} /> <span>Quick POS</span>
            </button>
            <div className="station-badge">
              <span className="status-dot" style={{ color: '#4CAF50' }} /> <span>Station Active</span>
            </div>
          </div>
        </header>

        <main className="pos-content">
          {renderContent()}
        </main>
      </div>
      {renderInvoiceModal()}
    </div>
  );
};

export default POS;
