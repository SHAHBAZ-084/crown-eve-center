// frontend/src/pages/dashboards/customer/TrackOrder.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const STEPS = [
    { label: "Order Placed", date: "Apr 23, 09:14 AM", done: true },
    { label: "Payment Confirmed", date: "Apr 23, 09:16 AM", done: true },
    { label: "Being Prepared", date: "Apr 23, 11:30 AM", done: true, active: true },
    { label: "Out for Delivery", date: "Expected by 3:00 PM", done: false },
    { label: "Delivered", date: "—", done: false },
  ];

  return (
    <div>
      <div className="pg-hd">
        <div>
          <button className="ca" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>← Back to Orders</button>
          <h1>Track Order <span style={{ color: "var(--orange)" }}>#{id || "CE-4821"}</span></h1>
          <p>Real-time updates for your Crown Eve purchase.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Current Status</div>
          <div className="badge bg-b" style={{ fontSize: 12, padding: "6px 16px" }}>In Transit</div>
        </div>
      </div>

      <div className="g73">
        <div className="card">
          <div className="ch"><div className="ct">Live Timeline</div></div>
          <div className="timeline" style={{ padding: "10px 0" }}>
            {STEPS.map((s, i) => (
              <div key={s.label} className="tl-item">
                <div className="tl-left">
                  <div className={`tl-dot ${s.done ? "done" : ""} ${s.active ? "active" : ""}`} />
                  {i < STEPS.length - 1 && <div className={`tl-line ${s.done ? "done" : ""}`} />}
                </div>
                <div className="tl-content">
                  <div className="tl-title">{s.label}</div>
                  <div className="tl-date">{s.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="ch"><div className="ct">Order Summary</div></div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, background: "var(--black3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏍️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Crown GT 390</div>
                <div style={{ fontSize: 11, color: "var(--muted2)" }}>#PT-0001 · Qty: 1</div>
              </div>
            </div>
            <div className="divider" />
            <div className="trow">
              <span style={{ fontSize: 12, color: "var(--muted2)" }}>Payment</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>JazzCash</span>
            </div>
            <div className="trow">
              <span style={{ fontSize: 12, color: "var(--muted2)" }}>Shipping</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Standard Delivery</span>
            </div>
            <div className="trow" style={{ marginTop: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Total Paid</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "var(--orange)" }}>PKR 485,000</span>
            </div>
          </div>

          <div className="card">
            <div className="ch"><div className="ct">Delivery Address</div></div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--white2)" }}>
              Ali Kamran<br />
              Apartment 4B, Gulberg Heights<br />
              Gulberg III, Lahore, 54000<br />
              Pakistan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
