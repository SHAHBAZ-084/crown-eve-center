// frontend/src/pages/dashboards/branch/POS.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { Icon } from "../../../components/branch/BranchShared";
import { Package, Search, Filter, Tag, Plus, ShoppingCart } from "lucide-react";
import "../../../styles/pos.css";

const POS = () => {
  const { user } = useAuth();
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
  const debouncedSearch = useDebounce(search, 300);

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

  const menuGroups = [
    {
      title: "GENERAL",
      items: [
        { id: "add-customer", label: "Add Customer", icon: "user" },
        { id: "add-bank", label: "Add Bank", icon: "dollar" },
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        { id: "products", label: "Products", icon: "tag" },
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

  const { data: products, isLoading } = useQuery({
    queryKey: ['pos-products-list', debouncedSearch, type, page],
    queryFn: () => api.get('/products', {
      params: { branchId: user?.branchId, search: debouncedSearch, product_type: type, limit: 20, page }
    }).then(r => r.data),
    enabled: activeMenu === 'products'
  });

  const addToCart = (e, product) => {
    e.stopPropagation(); // Prevent detail modal from opening
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    alert(`${product.name} added to cart!`);
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
              disabled={cart.length === 0 || !selectedCustomer || (paymentMode === "BANK" && !selectedBank)}
              className="w-full bg-[#E65100] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#E65100]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3 mt-4"
            >
              Generate Invoice <Icon n="tag" size={16} />
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
      case "products":
        return renderProducts();
      case "sale-invoices":
        return <div className="card ci"><h2>Sale Terminal</h2><p>POS functionality is being integrated...</p></div>;
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
    </div>
  );
};

export default POS;
