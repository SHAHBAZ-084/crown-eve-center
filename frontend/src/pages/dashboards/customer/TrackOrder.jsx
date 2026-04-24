// frontend/src/pages/dashboards/customer/TrackOrder.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";

const TRACKING_STEPS = [
  { label: "Order Placed", date: "Apr 23, 09:14 AM", done: true },
  { label: "Payment Confirmed", date: "Apr 23, 09:16 AM", done: true },
  { label: "Being Prepared", date: "Apr 23, 11:30 AM", done: true, active: true },
  { label: "Out for Delivery", date: "Expected by 3:00 PM", done: false },
  { label: "Delivered", date: "—", done: false },
];

const TrackOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock order data
  const order = {
    id: id || "CE-4821",
    date: "Apr 23, 2025",
    branch: "Lahore — Gulberg",
    type: "Online",
    payment: "JazzCash",
    status: "Processing",
    total: 6800,
    items: [
      { name: "Chain 21sp", qty: 2, price: 2800 },
      { name: "Brake Pads Pro", qty: 1, price: 1200 }
    ]
  };

  return (
    <div>
      <div className="pg-hd">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>← Back</button>
          <h1>Track Order</h1>
          <p>Order <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--orange)" }}>#{order.id}</span> · {order.date}</p>
        </div>
        <Badge status={order.status} />
      </div>

      <div className="g64">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="ch"><div className="ct">Tracking Timeline</div></div>
            <div className="timeline">
              {TRACKING_STEPS.map((step, i) => (
                <div className="tl-item" key={step.label}>
                  <div className="tl-left">
                    <div style={{ 
                      width: 10, height: 10, borderRadius: "50%", 
                      background: step.done ? "var(--orange)" : "var(--card2)", 
                      border: step.active ? "none" : "1.5px solid var(--border)", 
                      boxShadow: step.active ? "0 0 0 4px rgba(255,77,0,0.2)" : "none", 
                      flexShrink: 0, zIndex: 1, position: "relative" 
                    }} />
                    {i < TRACKING_STEPS.length - 1 && (
                      <div style={{ flex: 1, width: 1, background: step.done && !step.active ? "var(--orange)" : "var(--border)", marginTop: 3 }} />
                    )}
                  </div>
                  <div className="tl-content">
                    <div className="tl-title" style={{ color: step.done ? "var(--white)" : "var(--muted2)" }}>{step.label}</div>
                    <div className="tl-date" style={{ color: step.active ? "var(--orange)" : "var(--muted2)" }}>{step.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="ch"><div className="ct">Order Items</div></div>
            {order.items.map(item => (
              <div key={item.name} className="ci">
                <div className="ci-img">📦</div>
                <div style={{ flex: 1 }}>
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-sub">Qty: {item.qty} · PKR {item.price.toLocaleString()} each</div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--orange)" }}>
                  PKR {(item.qty * item.price).toLocaleString()}
                </div>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "var(--white2)" }}>Total</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "var(--orange)" }}>
                PKR {order.total.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="ch"><div className="ct">Order Details</div></div>
            {[
              ["Order ID", `#${order.id}`], 
              ["Date", order.date], 
              ["Branch", order.branch], 
              ["Type", order.type], 
              ["Payment", order.payment], 
              ["Status", order.status]
            ].map(([label, val]) => (
              <div key={label} className="trow">
                <span style={{ fontSize: 12, color: "var(--muted2)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: label === "Status" ? "var(--orange)" : "var(--white)" }}>{val}</span>
              </div>
            ))}
          </div>
          {order.status === "Processing" && (
            <div className="card" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
              <div className="ch"><div className="ct">Actions</div></div>
              <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.7, marginBottom: 14 }}>
                You can cancel this order while it is still being prepared. Once dispatched, cancellation is not available.
              </div>
              <button className="btn btn-danger" style={{ width: "100%" }}>Cancel Order</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
