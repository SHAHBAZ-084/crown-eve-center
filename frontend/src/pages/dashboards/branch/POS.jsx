// frontend/src/pages/dashboards/branch/POS.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Icon } from "../../../components/branch/BranchShared";
import { Package, Search, Plus, X, MessageCircle, Home, FileText, Calendar, Edit2, Trash2 } from "lucide-react";
import "../../../styles/pos.css";

// Import Modular Components
import AddCustomer from './pos/AddCustomer';
import AddAccount from './pos/AddAccount';
import PaymentVoucher from './pos/PaymentVoucher';
import ReceiptVoucher from './pos/ReceiptVoucher';
import JournalVoucher from './pos/JournalVoucher';
import ViewVoucher from './pos/ViewVoucher';
import SaleInvoices from './pos/SaleInvoices';
import PurchaseInvoices from './pos/PurchaseInvoices';
import ServiceInvoices from './pos/ServiceInvoices';
import AccountLedger from './pos/AccountLedger';
import DebitTrailBalance from './pos/DebitTrailBalance';
import ServiceThermalReceipt, { normalizeServiceBooking } from '../../../components/branch/ServiceThermalReceipt';

const MOBILE_BREAKPOINT = 1024;

const POS = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeMenu, setActiveMenu] = useState("sale-invoices");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > MOBILE_BREAKPOINT);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(mobile ? false : true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isSidebarOpen]);

  // Print/Receipt State
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [serviceReceiptData, setServiceReceiptData] = useState(null);

  // Customer dropdown data (used for printing receipt lookup)
  const { data: customersData } = useQuery({
    queryKey: ['pos-customers-dropdown'],
    queryFn: () => api.get('/walk-in-customers', { params: { branchId: user?.branchId } }).then(r => r.data),
    enabled: !!user?.branchId
  });

  const menuGroups = [
    {
      title: "GENERAL",
      items: [
        { id: "add-customer", label: "Add Customer", icon: "user" },
        { id: "add-account", label: "Add Account", icon: "dollar" },
      ]
    },
    {
      title: "VOUCHERS",
      items: [
        { id: "payment-voucher", label: "Payment Voucher", icon: "orders" },
        { id: "receipt-voucher", label: "Receipt Voucher", icon: "plus" },
        { id: "journal-voucher", label: "Journal Voucher", icon: "settings" },
        { id: "view-voucher", label: "View Voucher", icon: "search" },
      ]
    },
    {
      title: "INVOICES",
      items: [
        { id: "sale-invoices", label: "Sale Invoices", icon: "tag" },
        { id: "purchase-invoices", label: "Purchase Invoices", icon: "truck" },
        { id: "service-invoices", label: "Service Invoices", icon: "wrench" },
      ]
    },
    {
      title: "REPORTS",
      items: [
        { id: "account-ledger", label: "Account Ledger", icon: "reports" },
        { id: "debit-trail", label: "Detailed Trial Balance", icon: "reports" },
      ]
    }
  ];

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

  const renderContent = () => {
    switch (activeMenu) {
      case "add-customer":
        return <AddCustomer user={user} />;
      case "add-account":
        return <AddAccount user={user} />;
      case "payment-voucher":
        return <PaymentVoucher user={user} />;
      case "receipt-voucher":
        return <ReceiptVoucher user={user} />;
      case "journal-voucher":
        return <JournalVoucher user={user} />;
      case "view-voucher":
        return <ViewVoucher user={user} />;
      case "sale-invoices":
        return <SaleInvoices user={user} queryClient={queryClient} onInvoiceGenerated={setGeneratedInvoice} />;
      case "purchase-invoices":
        return <PurchaseInvoices user={user} queryClient={queryClient} />;
      case "service-invoices":
        return <ServiceInvoices user={user} queryClient={queryClient} onPrintReceipt={(item, type) => setServiceReceiptData({ item, type })} />;
      case "account-ledger":
        return <AccountLedger user={user} />;
      case "debit-trail":
        return <DebitTrailBalance user={user} />;
      default:
        return <div className="card ci"><h2>{activeMenu.replace("-", " ").toUpperCase()}</h2><p>Feature coming soon...</p></div>;
    }
  };

  const handleMenuSelect = (menuId) => {
    setActiveMenu(menuId);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="pos-shell">
      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!isSidebarOpen}
        />
      )}

      {/* POS Sidebar */}
      <div
        className={`pos-sidebar ${isMobile ? (isSidebarOpen ? "open" : "") : "pos-sidebar--desktop"}`}
        aria-hidden={isMobile && !isSidebarOpen}
      >
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
                  onClick={() => handleMenuSelect(item.id)}
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
            {isMobile && (
              <button
                type="button"
                className="btn-ico pos-menu-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Icon n="menu" size={20} />
              </button>
            )}
            <div className="pos-header-title">
              {activeMenu.replace(/-/g, " ")}
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
      {serviceReceiptData && (
        <ServiceThermalReceipt
          type={serviceReceiptData.type}
          booking={normalizeServiceBooking(serviceReceiptData.item, user)}
          onClose={() => setServiceReceiptData(null)}
        />
      )}
    </div>
  );
};

export default POS;
