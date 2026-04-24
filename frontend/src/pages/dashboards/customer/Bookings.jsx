// frontend/src/pages/dashboards/customer/Bookings.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch, Badge, Modal } from "../../../components/customer/CustomerShared";

const BookingsPage = () => {
  const navigate = useNavigate();
  const { data: bookingData, loading } = useFetch("/bookings/my");
  const [filter, setFilter] = useState("All");
  const [cancelId, setCancelId] = useState(null);

  const bookings = bookingData?.data || [
    { id: "BK-0042", service: "Full Tune-Up", branch: "Crown Eve Gulberg", date: "Apr 24, 2025", time: "10:00 AM", status: "Upcoming", tech: "Ahmed Kamran", price: 2500 },
    { id: "BK-0039", service: "Oil & Filter Change", branch: "Crown Eve Gulberg", date: "Apr 10, 2025", time: "09:00 AM", status: "Completed", tech: "Bilal Hassan", price: 800 },
  ];

  const filters = ["All", "Upcoming", "Completed", "Cancelled"];
  const filtered = filter === "All" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <div className="pg-hd">
        <div><h1>My Bookings</h1><p>All your service appointments</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/appointments")}>+ Book New Service</button>
      </div>
      <div className="fbar">
        {filters.map(f => (
          <button 
            key={f} 
            className={`fpill ${filter === f ? "on" : ""}`} 
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading your appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ei">📅</div>
            <h3>No bookings yet</h3>
            <p>You have no {filter.toLowerCase()} appointments.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/appointments")}>Book a Service</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(b => (
              <div 
                key={b.id} 
                style={{ 
                  background: "var(--black3)", 
                  border: `1px solid ${b.status === "Upcoming" ? "rgba(255,77,0,0.2)" : "var(--border)"}`, 
                  borderRadius: 7, padding: "18px 20px" 
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 46, height: 46, background: "rgba(255,77,0,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔧</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--white)", marginBottom: 3 }}>{b.service}</div>
                      <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 6 }}>{b.branch}</div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--white2)" }}>📅 {b.date}</span>
                        <span style={{ fontSize: 12, color: "var(--orange)", fontWeight: 600 }}>🕐 {b.time}</span>
                        {b.tech !== "—" && <span style={{ fontSize: 12, color: "var(--white2)" }}>👨‍🔧 {b.tech}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <Badge status={b.status} />
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20, fontWeight: 700, color: "var(--orange)" }}>
                      PKR {b.price?.toLocaleString()}
                    </div>
                    {b.status === "Upcoming" && (
                      <button className="btn btn-danger btn-xs" onClick={() => setCancelId(b.id)}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cancelId && (
        <Modal title="Cancel Booking" onClose={() => setCancelId(null)}>
          <div className="alert alert-w">⚠ Cancellations made less than 2 hours before the appointment may incur a fee.</div>
          <p style={{ fontSize: 13, color: "var(--white2)", lineHeight: 1.7, marginBottom: 20 }}>
            Are you sure you want to cancel this booking? Your slot will be released and you can rebook anytime.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setCancelId(null)}>Yes, Cancel Booking</button>
            <button className="btn btn-ghost" onClick={() => setCancelId(null)}>Keep Booking</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BookingsPage;
