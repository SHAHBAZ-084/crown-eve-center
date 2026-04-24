// frontend/src/pages/dashboards/customer/Bookings.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";

const Bookings = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Upcoming");

  const BOOKINGS = [
    { id: "BK-0042", service: "Full Tune-Up", branch: "Crown Eve Gulberg", date: "Apr 24, 2025", time: "10:00 AM", status: "Upcoming", tech: "Ahmed Kamran", price: 2500 },
    { id: "BK-0039", service: "Oil & Filter Change", branch: "Crown Eve Gulberg", date: "Apr 10, 2025", time: "09:00 AM", status: "Completed", tech: "Bilal Hassan", price: 800 },
    { id: "BK-0031", service: "Brake Overhaul", branch: "Crown Eve Islamabad", date: "Mar 28, 2025", time: "02:00 PM", status: "Completed", tech: "Umar Farooq", price: 3200 },
    { id: "BK-0025", service: "Engine Diagnostics", branch: "Crown Eve DHA", date: "Mar 15, 2025", time: "11:30 AM", status: "Cancelled", tech: "—", price: 1500 },
  ];

  const filtered = BOOKINGS.filter(b => tab === "All" || b.status === tab);

  return (
    <div>
      <div className="pg-hd">
        <div>
          <h1>My Bookings</h1>
          <p>View and manage your service appointments.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/appointments")}>Book New Service</button>
      </div>

      <div className="tabs">
        {["Upcoming", "Completed", "Cancelled", "All"].map(t => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="g2">
        {filtered.map(b => (
          <div key={b.id} className="card" style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 22, right: 22 }}>
              <Badge status={b.status} />
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, background: "var(--black3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {b.service.includes("Oil") ? "🛢" : b.service.includes("Brake") ? "🛞" : "🔧"}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--orange)", marginBottom: 4 }}>Booking {b.id}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>{b.service}</div>
                <div style={{ fontSize: 13, color: "var(--muted2)" }}>{b.branch}</div>
              </div>
            </div>
            
            <div className="g2" style={{ marginBottom: 20 }}>
              <div style={{ background: "var(--black3)", padding: "14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Date & Time</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{b.date} · {b.time}</div>
              </div>
              <div style={{ background: "var(--black3)", padding: "14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Technician</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{b.tech}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Estimated Cost</div>
                <div style={{ fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", color: "var(--white)" }}>PKR {b.price.toLocaleString()}</div>
              </div>
              {b.status === "Upcoming" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm">Reschedule</button>
                  <button className="btn btn-danger btn-sm">Cancel</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="ei">📅</div>
          <h3>No bookings found</h3>
          <p>You don't have any {tab.toLowerCase()} appointments at the moment.</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/appointments")}>Book Your First Service</button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
