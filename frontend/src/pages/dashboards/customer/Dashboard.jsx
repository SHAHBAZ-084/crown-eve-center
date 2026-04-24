// frontend/src/pages/dashboards/customer/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
      {/* Welcome Banner */}
      <div style={{ 
        background: "linear-gradient(135deg, var(--surf) 0%, var(--surf3) 100%)", 
        border: "1px solid var(--border2)", 
        borderRadius: 14, padding: "32px", marginBottom: 24, 
        position: "relative", overflow: "hidden",
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right, transparent, var(--orange), transparent)" }} />
        <div style={{ position: "absolute", top: -40, right: -20, width: 240, height: 240, background: "radial-gradient(circle, rgba(255,77,0,0.1), transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--orange)", marginBottom: 8 }}>Member Dashboard</div>
            <h1 style={{ fontFamily: "var(--font-d)", fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 0.9, letterSpacing: 1, marginBottom: 12 }}>
              Welcome, <span style={{ color: "var(--orange)" }}>{user?.name?.split(' ')[0] || "Rider"}</span>
            </h1>
            <div style={{ fontSize: 13, color: "var(--white2)", display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ color: 'var(--orange)' }}>#{user?.id?.slice(-6).toUpperCase()}</span>
              <span>·</span>
              <span>Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => navigate("/shop")}>Explore Inventory</button>
            <button className="btn btn-primary" style={{ boxShadow: '0 4px 15px rgba(255,77,0,0.3)' }} onClick={() => navigate("/appointments")}>Book Service</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat">
          <div className="si" style={{ color: 'var(--orange)' }}>◫</div>
          <div className="sl">Active Orders</div>
          <div className="sv">01</div>
          <div style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 600 }}>#CE-4821 · PROCESSING</div>
        </div>
        <div className="stat">
          <div className="si" style={{ color: 'var(--blue)' }}>📅</div>
          <div className="sl">Upcoming Booking</div>
          <div className="sv">01</div>
          <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 700 }}>TOMORROW · 10:00 AM</div>
        </div>
        <div className="stat">
          <div className="si" style={{ color: 'var(--green)' }}>₨</div>
          <div className="sl">Total Spent</div>
          <div className="sv" style={{ color: "var(--orange)" }}>497K</div>
          <div style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 600 }}>LIFETIME ACCUMULATED</div>
        </div>
        <div className="stat">
          <div className="si" style={{ color: 'var(--orange2)' }}>🏍️</div>
          <div className="sl">Service History</div>
          <div className="sv">03</div>
          <div style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 600 }}>LAST: APR 10, 2025</div>
        </div>
      </div>

      {/* Active Order + Upcoming Booking */}
      <div className="g2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ borderTop: '2px solid var(--orange)' }}>
          <div className="ch"><div className="ct">Active Build Status</div><button className="ca" onClick={() => navigate("/my/orders")}>Details</button></div>
          <div style={{ background: "var(--surf2)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="mono" style={{ color: "var(--orange)", fontSize: 13, fontWeight: 700 }}>#CE-4821</span>
              <span className="badge bg-b" style={{ fontSize: 9 }}>In Assembly</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--white)", marginBottom: 4 }}>Crown GT 390 · Sport Edition</div>
            <div style={{ fontSize: 11, color: "var(--muted2)", marginBottom: 20 }}>Custom Exhaust + Pro Brake System</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 32, color: "var(--orange)" }}>PKR 485,000</div>
              <button className="ca" onClick={() => navigate("/track/CE-4821")} style={{ fontSize: 10, borderBottom: '1px solid var(--orange)' }}>Track Build</button>
            </div>
          </div>
          {/* mini timeline */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, padding: '0 4px' }}>
            {[1, 1, 1, 0, 0].map((v, i) => (
              <React.Fragment key={i}>
                <div style={{ 
                  width: 12, height: 12, borderRadius: "50%", 
                  background: v ? "var(--orange)" : "transparent", 
                  border: v ? "none" : "2px solid var(--border2)",
                  boxShadow: v ? '0 0 10px var(--orange)' : 'none'
                }} />
                {i < 4 && <div style={{ flex: 1, height: 2, background: (v && [1,1,1,1,1][i+1]) ? "var(--orange)" : "var(--border2)" }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted2)" }}>
            <span>Order</span>
            <span>Paid</span>
            <span>Build</span>
            <span>Ship</span>
            <span>Done</span>
          </div>
        </div>

        <div className="card" style={{ borderTop: '2px solid var(--blue)' }}>
          <div className="ch"><div className="ct">Next Service</div><button className="ca" onClick={() => navigate("/my/bookings")}>Manage</button></div>
          <div style={{ background: "var(--surf2)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px", display: "flex", gap: 18, alignItems: "center", marginBottom: 20 }}>
            <div style={{ 
              width: 54, height: 54, background: "rgba(59,130,246,0.1)", borderRadius: 10, 
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              border: '1px solid rgba(59,130,246,0.2)'
            }}>🔧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Full Performance Tune-Up</div>
              <div style={{ fontSize: 12, color: "var(--muted2)" }}>Crown Eve Terminal · Gulberg III</div>
            </div>
          </div>
          <div className="g2">
            <div style={{ background: "var(--surf2)", padding: "16px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", color: "var(--muted2)", marginBottom: 6, letterSpacing: 1 }}>Appointment Date</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-m)' }}>APR 25, 2025</div>
            </div>
            <div style={{ background: "var(--surf2)", padding: "16px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", color: "var(--muted2)", marginBottom: 6, letterSpacing: 1 }}>Scheduled Time</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-m)' }}>10:00 AM</div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" style={{ width: "100%", marginTop: 20, height: 44 }}>Cancel Appointment</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ch" style={{ marginTop: 40 }}><div className="ct">Terminal Shortcuts</div></div>
      <div className="g4">
        {[
          { ico: "🛒", label: "Shop Inventory", path: "/shop", color: 'var(--orange)' }, 
          { ico: "📋", label: "Build Orders", path: "/my/orders", color: 'var(--blue)' }, 
          { ico: "📅", label: "Service Logs", path: "/my/bookings", color: 'var(--green)' }, 
          { ico: "🔧", label: "Book Support", path: "/appointments", color: 'var(--orange2)' }
        ].map(a => (
          <div 
            key={a.label} 
            onClick={() => navigate(a.path)} 
            className="card"
            style={{ 
              padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "all .3s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              position: 'relative', overflow: 'hidden'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = a.color}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{a.ico}</div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 18, fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" }}>{a.label}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: a.color, opacity: 0.6 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
