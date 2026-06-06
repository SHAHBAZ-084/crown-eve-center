// Shared spare-parts / sale invoice receipt (POS walk-in, online customer, branch orders)
import React from 'react';
import { X } from 'lucide-react';
import './SaleInvoiceReceipt.css';

export const normalizeSaleOrder = (order, customerMeta = null) => {
  if (!order) return null;

  const meta = customerMeta || order.customerMeta || {};
  const walkIn = order.walkInCustomer;
  const online = order.customer;

  let name = meta.name;
  let sub = meta.phone || meta.email || meta.sub;
  let tag = meta.label || meta.tag;

  if (!name && walkIn) {
    name = `${walkIn.first_name || ''} ${walkIn.last_name || ''}`.trim();
    sub = walkIn.phone || walkIn.cnic;
    tag = tag || 'Store Sale';
  }

  if (!name && online) {
    name = online.name;
    sub = online.email;
    tag = tag || 'Online Customer';
  }

  if (!name && order.customer_name) {
    name = order.customer_name;
    sub = order.customer_phone;
  }

  if (!tag) {
    tag = order.customerId ? 'Online Customer' : 'Store Sale';
  }

  const paymentStatus =
    order.payment_status === 'PAID' || order.status === 'COMPLETED'
      ? 'PAID / COMPLETED'
      : (order.payment_status || order.status || 'PENDING').toUpperCase();

  return {
    ...order,
    billTo: {
      name: name || 'Customer',
      sub: sub || 'N/A',
      tag,
    },
    paymentStatus,
  };
};

export const SaleInvoiceReceiptBody = ({ order }) => {
  const inv = normalizeSaleOrder(order);
  if (!inv) return null;

  return (
    <div id="printable-invoice" className="sale-invoice-body-inner">
      <div className="sale-invoice-brand-row">
        <div>
          <div className="sale-invoice-brand">CROWN EVE</div>
          <div className="sale-invoice-brand-sub">Branch Terminal Invoice</div>
        </div>
        <div className="sale-invoice-meta">
          <div className="sale-invoice-meta-id">INV #{String(inv.id).padStart(6, '0')}</div>
          <div className="sale-invoice-meta-date">
            {new Date(inv.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="sale-invoice-parties">
        <div>
          <div className="sale-invoice-party-label">Bill To:</div>
          <div className="sale-invoice-party-name">{inv.billTo.name}</div>
          <div className="sale-invoice-party-sub">{inv.billTo.sub}</div>
          <div className="sale-invoice-party-tag">{inv.billTo.tag}</div>
        </div>
        <div className="sale-invoice-party-right">
          <div className="sale-invoice-party-label">Payment Info:</div>
          <div className="sale-invoice-payment">{inv.payment_method || 'CASH'}</div>
          <div className="sale-invoice-status">Status: {inv.paymentStatus}</div>
        </div>
      </div>

      <table className="sale-invoice-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {(inv.items || []).map((item, idx) => (
            <tr key={idx}>
              <td>{item.product?.name || item.name || 'Product'}</td>
              <td>{item.quantity}</td>
              <td>{Number(item.price).toLocaleString()}</td>
              <td>{(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sale-invoice-totals">
        <div className="sale-invoice-subtotal">
          <span>Subtotal</span>
          <span>PKR {Number(inv.total).toLocaleString()}</span>
        </div>
        <div className="sale-invoice-grand">
          <span className="sale-invoice-grand-label">Grand Total</span>
          <span className="sale-invoice-grand-value">PKR {Number(inv.total).toLocaleString()}</span>
        </div>
      </div>

      <div className="sale-invoice-footer">
        <div className="sale-invoice-thanks">Thank you for shopping with us!</div>
        <div className="sale-invoice-disclaimer">
          This is a computer generated invoice and does not require a signature.
        </div>
      </div>
    </div>
  );
};

const SaleInvoiceReceipt = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div
      className="sale-invoice-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label="Sale invoice receipt"
    >
      <div className="sale-invoice-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="sale-invoice-header">
          <div>
            <div className="sale-invoice-title">INVOICE GENERATED</div>
            <div className="sale-invoice-subtitle">Transaction Success</div>
          </div>
          <div className="sale-invoice-header-actions">
            <button
              type="button"
              className="sale-invoice-print-btn"
              onClick={() => window.print()}
            >
              Print Invoice
            </button>
            <button
              type="button"
              className="sale-invoice-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="sale-invoice-body">
          <SaleInvoiceReceiptBody order={order} />
        </div>
      </div>
    </div>
  );
};

export default SaleInvoiceReceipt;
