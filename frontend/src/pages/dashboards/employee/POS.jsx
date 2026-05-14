// frontend/src/pages/dashboards/employee/POS.jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from "../../../components/branch/BranchShared";
import "../../../styles/pos.css";

const POS = () => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState("sale-invoices");
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  // POS State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [transactionId, setTransactionId] = useState('');
  const debouncedSearch = useDebounce(search, 300);

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

  // Queries & Mutations
  const { data: products, isLoading } = useQuery({
    queryKey: ['pos-products', debouncedSearch, category, type, page],
    queryFn: () => api.get('/products', {
      params: { branchId: user?.branchId, search: debouncedSearch, category, product_type: type, limit: 50, page }
    }).then(r => r.data),
    enabled: activeMenu === 'pos-terminal'
  });

  const { data: dynamicCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products').then(r => {
      const items = r.data?.data || r.data || [];
      const catNames = items.map(p => typeof p.category === 'object' ? p.category?.name : p.category).filter(Boolean);
      return [...new Set(catNames)];
    })
  });
  const categories = ['', ...dynamicCategories];

  const completeSale = useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData),
    onSuccess: () => {
      setCart([]); setCustomerName(''); setCustomerPhone(''); setPaymentMethod('CASH'); setTransactionId('');
      alert('Sale Completed Successfully!');
    },
    onError: (err) => alert(err.response?.data?.message || 'Failed to complete sale.')
  });

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const renderPOSTerminal = () => (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-white border border-[#F3E5DC] rounded-xl py-3 px-4 focus:ring-1 focus:ring-[#E65100] outline-none font-semibold text-sm"
          />
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="bg-white border border-[#F3E5DC] rounded-xl px-4 text-xs font-bold text-[#8D7A71] outline-none"
          >
            <option value="">All Types</option>
            <option value="bike">Bikes</option>
            <option value="part">Parts</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 xl:grid-cols-3 gap-4 pr-2 custom-scrollbar">
          {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-white/50 animate-pulse rounded-2xl border border-[#F3E5DC]" />) : (
            (products?.data || []).map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white border border-[#F3E5DC] p-3 rounded-2xl text-left hover:border-[#E65100] transition-all group flex flex-col"
              >
                <div className="w-full h-32 bg-[#FFFAF8] rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0].url.startsWith('http') ? p.images[0].url : `http://localhost:5000${p.images[0].url}`} className="w-full h-full object-contain" /> : <Package className="opacity-10" />}
                </div>
                <h4 className="font-bold text-xs text-[#2D1A12] line-clamp-1">{p.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[#E65100] font-black text-xs">PKR {p.price.toLocaleString()}</span>
                  <div className="w-6 h-6 bg-[#E65100] text-white rounded-lg flex items-center justify-center"><Plus size={14} /></div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 bg-white border border-[#F3E5DC] rounded-3xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#F3E5DC] flex items-center justify-between">
          <h3 className="font-black text-sm flex items-center gap-2"><ShoppingCart size={18} className="text-[#E65100]" /> CART</h3>
          <span className="bg-[#E65100] text-white text-[10px] px-2 py-0.5 rounded-full">{cart.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-[#FFFAF8] rounded-xl border border-[#F3E5DC]">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-bold text-[11px] truncate">{item.name}</p>
                <p className="text-[#E65100] font-black text-[10px]">{item.qty} x PKR {item.price.toLocaleString()}</p>
              </div>
              <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="p-5 bg-[#FFFAF8] border-t border-[#F3E5DC]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-[#8D7A71] uppercase">Total Amount</span>
            <span className="text-lg font-black text-[#E65100]">PKR {subtotal.toLocaleString()}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => completeSale.mutate({
              branchId: user.branchId, type: 'POS', payment_method: paymentMethod, items: cart.map(i => ({ productId: i.id, quantity: i.qty, price: i.price })), total: subtotal
            })}
            className="w-full bg-[#E65100] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#D35400] transition-colors"
          >
            {completeSale.isPending ? 'PROCESSING...' : 'COMPLETE SALE'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pos-shell">
      <div className={`sidebar-overlay ${isSidebarOpen && window.innerWidth <= 1024 ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className={`pos-sidebar ${isSidebarOpen ? "open" : ""}`} style={{ width: isSidebarOpen ? 280 : 0, minWidth: isSidebarOpen ? 280 : 0 }}>
        <div className="pos-brand">
          <div className="pos-logo-box">CE</div>
          <div className="pos-brand-text">
            <div className="pos-brand-name"><span className="dark">CROWN</span><span className="orange">EVE</span></div>
            <div className="pos-brand-sub">BRANCH TERMINAL</div>
          </div>
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}><Icon n="close" size={20} /></button>
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
          <div className="user-avatar">{user?.name?.[0] || 'E'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Employee'}</span>
            <span className="user-role">{user?.role || 'Staff'}</span>
          </div>
        </div>
      </div>

      <div className="pos-main">
        <header className="pos-header">
          <div className="pos-header-left">
            <button className="btn-ico" onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'inherit' }}>
              <Icon n="menu" size={20} />
            </button>
            <div className="pos-header-title">{activeMenu.replace("-", " ")}</div>
          </div>
          <div className="pos-header-actions">
            <div className="status-pill"><span className="status-dot" /> <span>Live Status</span></div>
            <div className="station-badge"><span className="status-dot" style={{ color: '#4CAF50' }} /> <span>Station Active</span></div>
          </div>
        </header>

        <main className="pos-content h-full">
          {activeMenu === 'sale-invoices' ? renderPOSTerminal() : (
            <div className="card ci"><h2>{activeMenu.replace("-", " ").toUpperCase()}</h2><p>Feature coming soon...</p></div>
          )}
        </main>
      </div>
    </div>
  );
};

export default POS;
