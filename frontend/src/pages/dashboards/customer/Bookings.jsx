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
  const m = { scheduled: "Upcoming", completed: "Completed", cancelled: "Cancelled", pending: "Upcoming" };
  return m[s.toLowerCase()] || s;
};

const Bookings = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/appointments/my")
      .then(res => { const d = res?.data?.data ?? res?.data; setBookings(Array.isArray(d) ? d : []); })
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
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
        {["Upcoming", "Completed", "Cancelled", "All"].map(t => (
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
            const scheduledAt = b.scheduledAt ? new Date(b.scheduledAt) : null;
            const dateStr = scheduledAt ? scheduledAt.toLocaleDateString("en-PK", { dateStyle: "medium" }) : "—";
            const timeStr = scheduledAt ? scheduledAt.toLocaleTimeString("en-PK", { timeStyle: "short" }) : "—";

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
                      Booking #{String(b.id).padStart(6, '0')}
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
                    {b.service?.price != null && (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Estimated Cost</div>
                        <div style={{ fontSize: 20, fontFamily: "'Bebas Neue',sans-serif", color: "var(--white)" }}>PKR {b.service.price.toLocaleString()}</div>
                      </>
                    )}
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
