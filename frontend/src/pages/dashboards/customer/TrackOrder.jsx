// frontend/src/pages/dashboards/customer/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { STATUS_TIMELINE, STATUS_BADGE } from "../../../components/customer/CustomerShared";

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(() => setError("Order not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const steps = order ? (STATUS_TIMELINE[order.status] || STATUS_TIMELINE.PENDING) : [];
  const badge = order ? (STATUS_BADGE[order.status] || { label: order.status, cls: "bg-b" }) : null;
  const total = order?.total ?? order?.items?.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0) ?? 0;

  return (
    <div>
      <div className="pg-hd">
        <div>
          <button className="ca" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>← Back to Orders</button>
          <h1>Track Order <span style={{ color: "var(--orange)" }}>#{String(id).padStart(6, '0')}</span></h1>
          <p>Real-time updates for your Crown Eve purchase.</p>
        </div>
        {badge && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Current Status</div>
            <div className={`badge ${badge.cls}`} style={{ fontSize: 12, padding: "6px 16px" }}>{badge.label}</div>
          </div>
        )}
      </div>

      {loading && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted2)" }}>Loading order…</div>}
      {error && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--red)" }}>{error}</div>}

      {order && (
        <div className="g73">
          <div className="card">
            <div className="ch"><div className="ct">Live Timeline</div></div>
            <div className="timeline" style={{ padding: "10px 0" }}>
              {steps.map((s, i) => (
                <div key={s.label} className="tl-item">
                  <div className="tl-left">
                    <div className={`tl-dot ${s.done ? "done" : ""} ${s.active ? "active" : ""}`} />
                    {i < steps.length - 1 && <div className={`tl-line ${s.done ? "done" : ""}`} />}
                  </div>
                  <div className="tl-content">
                    <div className="tl-title">{s.label}</div>
                    <div className="tl-date">
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
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="ch"><div className="ct">Order Summary</div></div>
              {(order.items || []).map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, background: "var(--black3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏍️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{item.product?.name || item.name || "Product"}</div>
                    <div style={{ fontSize: 11, color: "var(--muted2)" }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>
                    PKR {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="divider" />
              <div className="trow">
                <span style={{ fontSize: 12, color: "var(--muted2)" }}>Order ID</span>
                <span className="mono" style={{ fontWeight: 600 }}>#{String(id).padStart(6, '0')}</span>
              </div>
              <div className="trow">
                <span style={{ fontSize: 12, color: "var(--muted2)" }}>Placed</span>
                <span style={{ fontSize: 12 }}>{new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</span>
              </div>
              {order.branch?.name && (
                <div className="trow">
                  <span style={{ fontSize: 12, color: "var(--muted2)" }}>Branch</span>
                  <span style={{ fontSize: 12 }}>{order.branch.name}</span>
                </div>
              )}
              <div className="trow" style={{ marginTop: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Total Paid</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "var(--orange)" }}>PKR {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="card">
              <div className="ch"><div className="ct">Need Help?</div></div>
              <p style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6, marginBottom: 16 }}>Contact our support team for help with your order.</p>
              <button className="btn btn-ghost btn-xs" style={{ width: "100%" }}>Contact Support</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
