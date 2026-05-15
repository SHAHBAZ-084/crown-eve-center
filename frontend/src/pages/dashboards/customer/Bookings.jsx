// frontend/src/pages/dashboards/customer/Bookings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";
import api from "../../../services/api";

const SERVICE_ICON = (name = "") => {
  if (name.toLowerCase().includes("oil")) return "🛢";
  if (name.toLowerCase().includes("brake")) return "🛞";
  return "🔧";
};

const normalizeStatus = (s = "") => {
  const m = { 
    scheduled: "Upcoming", 
    completed: "Completed", 
    cancelled: "Cancelled", 
    pending: "Upcoming",
    in_progress: "In Progress" 
  };
  return m[s.toLowerCase()] || s;
};

const Bookings = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/bookings")
      .then(res => { const d = res?.data?.data ?? res?.data; setBookings(Array.isArray(d) ? d : []); })
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (Array.isArray(bookings) ? bookings : []).filter(b => {
    if (!b) return false;
    const status = normalizeStatus(b.status);
    return tab === "All" || status === tab;
  });

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
        {["All", "Upcoming", "In Progress", "Completed", "Cancelled"].map(t => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {loading && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted2)" }}>Loading bookings…</div>}
      {error && <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--red)" }}>{error}</div>}

      {!loading && !error && (
        <div className="g2">
          {filtered.map(b => {
            const status = normalizeStatus(b.status);
            const serviceName = b.service?.name || "Service";
            const branchName = b.branch?.name || "—";
            const bookingDate = b.booking_date ? new Date(b.booking_date) : null;
            const dateStr = bookingDate ? bookingDate.toLocaleDateString("en-PK", { dateStyle: "medium" }) : "—";
            const timeStr = b.booking_time || "—";

            return (
              <div key={b.id} className="card" style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: 22, right: 22 }}>
                  <Badge status={status} />
                </div>
                <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, background: "var(--black3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                    {SERVICE_ICON(serviceName)}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--orange)", marginBottom: 4 }}>
                      Booking #{b.id.split('-')[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif" }}>{serviceName}</div>
                    <div style={{ fontSize: 13, color: "var(--muted2)" }}>{branchName}</div>
                  </div>
                </div>

                <div className="g2" style={{ marginBottom: 20 }}>
                  <div style={{ background: "var(--black3)", padding: "14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Date & Time</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{dateStr} · {timeStr}</div>
                  </div>
                  <div style={{ background: "var(--black3)", padding: "14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Status</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{status}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Branch Contact</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, background: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.994 9.994 0 004.773 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.935 9.935 0 0012.012 2zM6.869 16.907l-.288-.454a8.255 8.255 0 01-1.265-4.467c0-4.547 3.702-8.249 8.253-8.249a8.196 8.196 0 015.835 2.419 8.196 8.196 0 012.422 5.835c0 4.547-3.702 8.249-8.253 8.249h-.003a8.223 8.223 0 01-4.215-1.164l-.304-.18-3.132.741.75-3.03z"/></svg>
                      </div>
                      <a 
                        href={`https://wa.me/${b.branch?.whatsapp?.replace(/\D/g, '') || '923000000000'}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: 16, fontWeight: 700, color: '#25D366', textDecoration: 'none' }}
                      >
                        {b.branch?.whatsapp || 'Connect on WhatsApp'}
                      </a>
                    </div>
                  </div>
                  {status === "Upcoming" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost btn-sm">Reschedule</button>
                      <button className="btn btn-danger btn-sm">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
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
