// frontend/src/pages/dashboards/customer/Profile.jsx
import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [pass, setPass] = useState("");

  return (
    <div>
      <div className="pg-hd" style={{ paddingTop: '40px' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', letterSpacing: '-1px' }}>My Profile</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted2)' }}>Manage your account settings, security and preferences.</p>
        </div>
      </div>

      <div className="g73">
        <div>
          <div className="card" style={{ marginBottom: 24, borderTop: '2px solid var(--orange)' }}>
            <div className="ch"><div className="ct">Personal Information</div></div>
            <div className="fgrid">
              <div className="fg">
                <label>Full Name</label>
                <input className="fi" defaultValue={user?.name} style={{ background: 'var(--black2)' }} />
              </div>
              <div className="fg">
                <label>Email Address</label>
                <input className="fi" defaultValue={user?.email} disabled style={{ background: 'var(--black2)', opacity: 0.6 }} />
              </div>
            </div>
            <div className="fgrid">
              <div className="fg">
                <label>Phone Number</label>
                <input className="fi" defaultValue="+92 300 1234567" style={{ background: 'var(--black2)' }} />
              </div>
              <div className="fg">
                <label>City</label>
                <select className="fs" defaultValue="Lahore" style={{ background: 'var(--black2)' }}>
                  <option>Lahore</option>
                  <option>Karachi</option>
                  <option>Islamabad</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }}>Update Profile</button>
          </div>

          <div className="card" style={{ borderTop: '2px solid var(--border)' }}>
            <div className="ch"><div className="ct">Security & Password</div></div>
            <div className="fg">
              <label>Current Password</label>
              <input className="fi" type="password" placeholder="••••••••" style={{ background: 'var(--black2)' }} />
            </div>
            <div className="fgrid">
              <div className="fg">
                <label>New Password</label>
                <input className="fi" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={{ background: 'var(--black2)' }} />
              </div>
              <div className="fg">
                <label>Confirm New Password</label>
                <input className="fi" type="password" placeholder="••••••••" style={{ background: 'var(--black2)' }} />
              </div>
            </div>
            <button className="btn btn-ghost" style={{ marginTop: 16 }}>Change Password</button>
          </div>
        </div>

        <div>
          <div className="card" style={{ textAlign: "center", padding: "40px 24px", marginBottom: 24, background: 'linear-gradient(135deg, var(--card) 0%, var(--black3) 100%)' }}>
            <div style={{ 
              width: 90, height: 90, background: "var(--orange)", 
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'Bebas Neue', sans-serif"
            }}>
              {user?.name ? user.name[0].toUpperCase() : "C"}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif", marginBottom: 4, letterSpacing: '1px', textTransform: 'uppercase' }}>{user?.name || "Customer"}</div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: "var(--muted2)", letterSpacing: '2px', marginBottom: 24 }}>Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="trow" style={{ background: "rgba(255,77,0,0.05)", padding: "14px", borderRadius: 4, border: '1px solid rgba(255,77,0,0.1)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: "var(--muted2)", letterSpacing: '1px' }}>Loyalty Tier</span>
                <span className="badge bg-o" style={{ fontSize: 10 }}>Gold Member</span>
              </div>
              <div className="trow" style={{ background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: 4, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: "var(--muted2)", letterSpacing: '1px' }}>Crown Points</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "var(--orange)" }}>1,240</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="ch"><div className="ct">Dashboard Preferences</div></div>
            <div className="trow" style={{ padding: '12px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Email Notifications</span>
              <div style={{ width: 40, height: 20, background: 'var(--orange)', borderRadius: 20, position: 'relative' }}>
                <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, right: 3 }} />
              </div>
            </div>
            <div className="trow" style={{ padding: '12px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Order SMS Updates</span>
              <div style={{ width: 40, height: 20, background: 'var(--orange)', borderRadius: 20, position: 'relative' }}>
                <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, right: 3 }} />
              </div>
            </div>
            <div className="trow" style={{ padding: '12px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Marketing Alerts</span>
              <div style={{ width: 40, height: 20, background: 'var(--black3)', border: '1px solid var(--border)', borderRadius: 20, position: 'relative' }}>
                <div style={{ width: 14, height: 14, background: 'var(--muted)', borderRadius: '50%', position: 'absolute', top: 2, left: 3 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
