// frontend/src/pages/dashboards/customer/Profile.jsx
import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [pass, setPass] = useState("");

  return (
    <div>
      <div className="pg-hd">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account settings, security and preferences.</p>
        </div>
      </div>

      <div className="g73">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="ch"><div className="ct">Personal Information</div></div>
            <div className="fgrid">
              <div className="fg">
                <label>Full Name</label>
                <input className="fi" defaultValue={user?.name} />
              </div>
              <div className="fg">
                <label>Email Address</label>
                <input className="fi" defaultValue={user?.email} disabled />
              </div>
            </div>
            <div className="fgrid">
              <div className="fg">
                <label>Phone Number</label>
                <input className="fi" defaultValue="+92 300 1234567" />
              </div>
              <div className="fg">
                <label>City</label>
                <select className="fs" defaultValue="Lahore">
                  <option>Lahore</option>
                  <option>Karachi</option>
                  <option>Islamabad</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 10 }}>Update Profile</button>
          </div>

          <div className="card">
            <div className="ch"><div className="ct">Security & Password</div></div>
            <div className="fg">
              <label>Current Password</label>
              <input className="fi" type="password" placeholder="••••••••" />
            </div>
            <div className="fgrid">
              <div className="fg">
                <label>New Password</label>
                <input className="fi" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="fg">
                <label>Confirm New Password</label>
                <input className="fi" type="password" placeholder="••••••••" />
              </div>
            </div>
            <button className="btn btn-ghost" style={{ marginTop: 10 }}>Change Password</button>
          </div>
        </div>

        <div>
          <div className="card" style={{ textAlign: "center", padding: "40px 20px", marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, background: "var(--orange)", borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff" }}>
              {user?.name ? user.name[0].toUpperCase() : "C"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif", marginBottom: 4 }}>{user?.name || "Customer"}</div>
            <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 24 }}>Customer since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="trow" style={{ background: "var(--black3)", padding: "12px", borderRadius: 6 }}>
                <span style={{ fontSize: 11, color: "var(--muted2)" }}>Loyalty Tier</span>
                <span className="badge bg-o">Gold Member</span>
              </div>
              <div className="trow" style={{ background: "var(--black3)", padding: "12px", borderRadius: 6 }}>
                <span style={{ fontSize: 11, color: "var(--muted2)" }}>Crown Points</span>
                <span style={{ fontWeight: 700, color: "var(--orange)" }}>1,240</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="ch"><div className="ct">Preferences</div></div>
            <div className="trow">
              <span style={{ fontSize: 13 }}>Email Notifications</span>
              <button className="tgl on" />
            </div>
            <div className="trow">
              <span style={{ fontSize: 13 }}>Order SMS Updates</span>
              <button className="tgl on" />
            </div>
            <div className="trow">
              <span style={{ fontSize: 13 }}>Two-Factor Auth</span>
              <button className="tgl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
