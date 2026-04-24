// frontend/src/pages/dashboards/customer/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: "linear-gradient(135deg,var(--card) 0%,var(--black3) 100%)", border: "1px solid var(--border)", borderRadius: 8, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right,transparent,var(--orange),transparent)" }} />
        <div style={{ position: "absolute", top: -40, right: -20, width: 200, height: 200, background: "radial-gradient(circle,rgba(255,77,0,0.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--orange)", marginBottom: 6 }}>Welcome back</div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 0.9, letterSpacing: -2, marginBottom: 8 }}>
              {user?.name?.split(' ')[0] || "Customer"} <span style={{ color: "var(--orange)" }}>Terminal</span>
            </h1>
            <div style={{ fontSize: 13, color: "var(--white2)" }}>{user?.email} · Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/shop")}>Browse Shop</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/appointments")}>Book Service</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat"><div className="si">◫</div><div className="sl">Active Orders</div><div className="sv">1</div><span className="sc neu">#CE-4821 · Processing</span></div>
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
              <span className="badge bg-b" style={{ fontSize: 9 }}>Processing</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--white2)", marginBottom: 16 }}>Chain 21sp (×2) + Brake Pads Pro (×1)</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "var(--orange)" }}>PKR 6,800</div>
              <button className="ca" onClick={() => navigate("/track/CE-4821")} style={{ fontSize: 10 }}>Track Order →</button>
            </div>
          </div>
          {/* mini timeline */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {[1, 2, 3, 0, 0].map((v, i) => (
              <React.Fragment key={i}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: v ? "var(--orange)" : "var(--card2)", border: v ? "none" : "2px solid var(--border)" }} />
                {i < 4 && <div style={{ flex: 1, height: 2, background: v === 3 ? "var(--border)" : v ? "var(--orange)" : "var(--border)" }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted)" }}>
            <span>Placed</span>
            <span>Confirmed</span>
            <span>Preparing</span>
            <span>Delivery</span>
            <span>Done</span>
          </div>
        </div>

        <div className="card">
          <div className="ch"><div className="ct">Upcoming Booking</div><button className="ca" onClick={() => navigate("/my/bookings")}>View all →</button></div>
          <div style={{ background: "var(--black3)", border: "1px solid var(--border)", borderRadius: 6, padding: "20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, background: "var(--card2)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Full Tune-Up</div>
              <div style={{ fontSize: 12, color: "var(--muted2)" }}>Crown Eve Gulberg, Lahore</div>
            </div>
          </div>
          <div className="g2" style={{ marginTop: 14 }}>
            <div style={{ background: "var(--black3)", padding: "12px", borderRadius: 4, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Date</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Apr 24, 2025</div>
            </div>
            <div style={{ background: "var(--black3)", padding: "12px", borderRadius: 4, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Time</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>10:00 AM</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 14 }}>Technician: <span style={{ color: "var(--white2)" }}>Ahmed Kamran</span></div>
          <button className="btn btn-danger btn-sm" style={{ width: "100%", marginTop: 16 }}>Cancel Booking</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ch" style={{ marginTop: 32 }}><div className="ct">Quick Actions</div></div>
      <div className="g4">
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
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, 
              padding: "24px 20px", textAlign: "center", cursor: "pointer", transition: "all .2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12
            }}
          >
            <div style={{ fontSize: 28 }}>{a.ico}</div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>{a.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
