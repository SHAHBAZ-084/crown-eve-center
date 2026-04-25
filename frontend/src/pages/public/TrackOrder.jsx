// frontend/src/pages/public/TrackOrder.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/customer.css';

const STATUS_TIMELINE = {
  PENDING:    [{ label: "Order Placed", done: true  }, { label: "Being Prepared", done: false }, { label: "Out for Delivery", done: false }, { label: "Delivered", done: false }],
  PROCESSING: [{ label: "Order Placed", done: true  }, { label: "Being Prepared", done: true, active: true }, { label: "Out for Delivery", done: false }, { label: "Delivered", done: false }],
  COMPLETED:  [{ label: "Order Placed", done: true  }, { label: "Being Prepared", done: true  }, { label: "Out for Delivery", done: true  }, { label: "Delivered", done: true  }],
  CANCELLED:  [{ label: "Order Placed", done: true  }, { label: "Cancelled", done: true }],
};

const STATUS_BADGE = {
  PENDING:    "Pending",
  PROCESSING: "In Assembly",
  COMPLETED:  "Delivered",
  CANCELLED:  "Cancelled",
};

const PublicTrackOrder = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(paramId || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback((orderId) => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    api.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .catch(() => setError("Order not found. Check your order ID."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (paramId) fetchOrder(paramId); }, [paramId, fetchOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) fetchOrder(searchId.trim());
  };

  const steps = order ? (STATUS_TIMELINE[order.status] || STATUS_TIMELINE.PENDING) : [];
  const total = order?.total ?? order?.items?.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0) ?? 0;

  return (
    <div id="customer-dashboard-shell">
      <div className="main-wrap">
        <div className="page-wrap">
          <div className="pg-hd" style={{ textAlign: 'center', display: 'block', marginBottom: '40px', paddingTop: '60px' }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '56px', letterSpacing: '-1px', marginBottom: '8px' }}>
              Track Your Build
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted2)', maxWidth: '500px', margin: '0 auto' }}>
              Enter your order reference ID below to see live progress and delivery updates.
            </p>
          </div>

          <div className="card" style={{ maxWidth: '600px', margin: '0 auto 40px', padding: '24px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <input
                  className="fi"
                  placeholder="Enter Order ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  style={{ height: '48px' }}
                />
              </div>
              <button className="btn btn-primary" type="submit" style={{ height: '48px', padding: '0 24px' }}>
                Track Progress
              </button>
            </form>
          </div>

          {loading && <div className="card" style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: 40, color: "var(--muted2)" }}>Fetching order…</div>}
          {error && <div className="card" style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: 40, color: "var(--red)" }}>{error}</div>}

          {order && (
            <div className="g73">
              <div className="card">
                <div className="ch">
                  <div className="ct">Live Build Status</div>
                  <div className="badge bg-b">{STATUS_BADGE[order.status] || order.status}</div>
                </div>
                <div className="timeline" style={{ padding: "10px 0" }}>
                  {steps.map((s, i) => (
                    <div key={s.label} className="tl-item">
                      <div className="tl-left">
                        <div className={`tl-dot ${s.done ? "done" : ""} ${s.active ? "active" : ""}`} />
                        {i < steps.length - 1 && <div className={`tl-line ${s.done ? "done" : ""}`} />}
                      </div>
                      <div className="tl-content">
                        <div className="tl-title" style={{ fontSize: '14px', fontWeight: 700 }}>{s.label}</div>
                        <div className="tl-date" style={{ fontSize: '11px' }}>
                          {s.done && i === 0
                            ? new Date(order.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })
                            : s.done ? "Completed" : "Pending"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="card" style={{ marginBottom: '20px' }}>
                  <div className="ch"><div className="ct">Build Summary</div></div>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, background: "var(--black3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏍️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{item.product?.name || item.name || "Product"}</div>
                        <div style={{ fontSize: 11, color: "var(--muted2)" }}>Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                  <div className="divider" />
                  <div className="trow">
                    <span style={{ fontSize: 12, color: "var(--muted2)" }}>Order ID</span>
                    <span className="mono" style={{ fontWeight: 600 }}>#{order._id || searchId}</span>
                  </div>
                  <div className="trow">
                    <span style={{ fontSize: 12, color: "var(--muted2)" }}>Placed</span>
                    <span style={{ fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</span>
                  </div>
                  <div className="trow" style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "var(--orange)" }}>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="card">
                  <div className="ch"><div className="ct">Need Help?</div></div>
                  <p style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.6, marginBottom: '16px' }}>
                    Contact our support team for help with your order.
                  </p>
                  <button className="btn btn-ghost btn-xs" style={{ width: '100%' }}>Contact Support</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicTrackOrder;
