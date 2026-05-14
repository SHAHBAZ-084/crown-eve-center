// frontend/src/pages/dashboards/branch/POS.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { Icon } from "../../../components/branch/BranchShared";
import { Package, Search, Filter, Tag, Plus } from "lucide-react";
import "../../../styles/pos.css";

const POS = () => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState("sale-invoices");
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  // Products State
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null); // Detail Modal
  const [cart, setCart] = useState([]);
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

  const renderProducts = () => (
    <div className="flex flex-col h-full space-y-6">
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
        <div className="flex items-center justify-center gap-6 py-6 border-t border-[#F3E5DC]">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-6 py-2.5 bg-white border border-[#F3E5DC] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#FFFAF8] disabled:opacity-30 transition-all">Previous</button>
          <div className="text-[11px] font-black text-[#8D7A71] uppercase tracking-widest">Page <span className="text-[#E65100]">{page}</span> of {products.meta.totalPages}</div>
          <button disabled={page === products.meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-6 py-2.5 bg-white border border-[#F3E5DC] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#FFFAF8] disabled:opacity-30 transition-all">Next</button>
        </div>
      )}

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
