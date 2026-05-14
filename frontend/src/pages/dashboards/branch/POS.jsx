// frontend/src/pages/dashboards/branch/POS.jsx
import React, { useState } from "react";
import { Icon } from "../../../components/branch/BranchShared";
import "../../../styles/pos.css";

const POS = () => {
  const [activeMenu, setActiveMenu] = useState("sale-invoices");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

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

  const renderContent = () => {
    switch (activeMenu) {
      case "sale-invoices":
        return <div className="card ci"><h2>Sale Invoices</h2><p>Process your sales here...</p></div>;
      case "purchase-invoices":
        return <div className="card ci"><h2>Purchase Invoices</h2><p>Manage inventory purchases...</p></div>;
      case "add-customer":
        return <div className="card ci"><h2>Add Customer</h2><p>Customer management module...</p></div>;
      default:
        return <div className="card ci"><h2>{activeMenu.replace("-", " ").toUpperCase()}</h2><p>Feature coming soon...</p></div>;
    }
  };

  return (
    <div className="pos-shell">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* POS Sidebar */}
      <div className={`pos-sidebar ${isSidebarOpen ? "open" : ""}`} style={{ width: isSidebarOpen ? 260 : 0, minWidth: isSidebarOpen ? 260 : 0 }}>
        <div className="pos-brand">
          <div className="pos-brand-name">POS TERMINAL</div>
          <div className="pos-brand-sub">PREMIUM SALES MODULE</div>
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
                  <Icon n={item.icon} size={16} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pos-main">
        <header className="pos-header">
          <div className="pos-header-left">
            <button className="btn-ico" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <Icon n="menu" size={18} />
            </button>
            <div className="pos-header-title">
              {activeMenu.replace("-", " ")}
            </div>
          </div>
          <div className="live-pill"><span className="live-dot" /> Terminal Linked</div>
        </header>

        <main className="pos-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default POS;
