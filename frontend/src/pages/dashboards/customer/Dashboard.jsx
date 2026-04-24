// frontend/src/pages/dashboards/customer/Dashboard.jsx
import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Badge, Icon } from "../../../components/customer/CustomerShared";

const CustomerDashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: "linear-gradient(135deg,var(--card) 0%,var(--black3) 100%)", border: "1px solid var(--border)", borderRadius: 12, padding: "40px 48px", marginBottom: 32, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(to right,transparent,var(--orange),transparent)" }} />
        <div style={{ position: "absolute", top: -40, right: -20, width: 300, height: 300, background: "radial-gradient(circle,rgba(255,77,0,0.1),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, position: 'relative', zIndex: 2 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "var(--orange)", marginBottom: 12 }}>Customer Portal</div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 0.9, letterSpacing: -2, marginBottom: 12 }}>
              Welcome Back, <span style={{ color: "var(--orange)" }}>{user?.name?.split(' ')[0] || "Customer"}</span>
            </h1>
            <div style={{ fontSize: 14, color: "var(--white2)", maxWidth: 480, lineHeight: 1.7 }}>
              {user?.email} · Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => navigate("/shop")} style={{ padding: '12px 24px' }}>Browse Shop</button>
            <button className="btn btn-primary" onClick={() => navigate("/appointments")} style={{ padding: '12px 24px' }}>Book Service</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat"><div className="si">◫</div><div className="sl">Active Orders</div><div className="sv">1</div><span className="sc neu">CE-4821 · Processing</span></div>
        <div className="stat"><div className="si">📅</div><div className="sl">Upcoming Booking</div><div className="sv">1</div><span className="sc up">↑ Tomorrow 10:00 AM</span></div>
        <div className="stat"><div className="si">₨</div><div className="sl">Total Spent</div><div className="sv" style={{ color: "var(--orange)" }}>497K</div><span className="sc neu">4 orders lifetime</span></div>
        <div className="stat"><div className="si">🏍️</div><div className="sl">Services Done</div><div className="sv">3</div><span className="sc up">↑ Last: Apr 10</span></div>
      </div>

      {/* Active Order + Upcoming Booking */}
      <div className="g2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="ch"><div className="ct">Active Order</div><button className="ca" onClick={() => navigate("/my/orders")}>View all →</button></div>
          <div style={{ background: "var(--black3)", border: "1px solid var(--border)", borderRadius: 6, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="mono" style={{ color: "var(--orange)", fontSize: 13 }}>#CE-4821</span>
              <Badge status="Processing" />
            </div>
            <div style={{ fontSize: 13, color: "var(--white2)", marginBottom: 12 }}>Chain 21sp (×2) + Brake Pads Pro (×1)</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 700, color: "var(--orange)" }}>PKR 6,800</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/track/CE-4821")}>Track Order →</button>
            </div>
          </div>
          {/* Mini Timeline */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {["Placed", "Confirmed", "Preparing", "Delivery", "Done"].map((s, i) => (
              <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  {i > 0 && <div style={{ flex: 1, height: 2, background: i < 3 ? "var(--orange)" : "var(--border)" }} />}
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: i < 3 ? "var(--orange)" : i === 3 ? "rgba(255,77,0,0.3)" : "var(--border)", flexShrink: 0 }} />
                  {i < 4 && <div style={{ flex: 1, height: 2, background: i < 2 ? "var(--orange)" : "var(--border)" }} />}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: i < 3 ? "var(--orange)" : "var(--muted)", textAlign: "center" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="ch"><div className="ct">Upcoming Booking</div><button className="ca" onClick={() => navigate("/my/bookings")}>View all →</button></div>
          <div style={{ background: "var(--black3)", border: "1px solid rgba(255,77,0,0.15)", borderRadius: 6, padding: "18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, background: "rgba(255,77,0,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔧</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--white)", marginBottom: 3 }}>Full Tune-Up</div>
                <div style={{ fontSize: 12, color: "var(--muted2)" }}>Crown Eve Gulberg, Lahore</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ background: "var(--card2)", borderRadius: 4, padding: "10px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 3 }}>Date</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Apr 24, 2025</div>
              </div>
              <div style={{ background: "var(--card2)", borderRadius: 4, padding: "10px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 3 }}>Time</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--orange)" }}>10:00 AM</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 12 }}>Technician: <span style={{ color: "var(--white)" }}>Ahmed Kamran</span></div>
            <button className="btn btn-danger btn-sm" style={{ width: "100%" }}>Cancel Booking</button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="ch"><div className="ct">Quick Actions</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { ico: "🛒", label: "Browse Shop", path: "/shop" }, 
            { ico: "📋", label: "My Orders", path: "/my/orders" }, 
            { ico: "📅", label: "My Bookings", path: "/my/bookings" }, 
            { ico: "🔧", label: "Book Service", path: "/appointments" }
          ].map(a => (
            <div 
              key={a.label} 
              onClick={() => navigate(a.path)} 
              style={{ 
                background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 10, 
                padding: "32px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 16
              }}
            >
              <div style={{ fontSize: 32 }}>{a.ico}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: 'var(--white)' }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
