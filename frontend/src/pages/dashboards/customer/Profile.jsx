// frontend/src/pages/dashboards/customer/Profile.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";

const ProfilePage = () => {
  const { user } = useOutletContext();
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({ 
    first: user?.name?.split(' ')[0] || "Ali", 
    last: user?.name?.split(' ')[1] || "Kamran", 
    email: user?.email || "", 
    phone: "+92 300 1234567", 
    city: "Lahore", 
    bike: "KTM Duke 390 2022" 
  });
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ orders: true, bookings: true, promo: false, sms: true });

  const tabs = [
    { id: "info", label: "Personal Info" }, 
    { id: "password", label: "Change Password" }, 
    { id: "addresses", label: "Addresses" }, 
    { id: "notifications", label: "Notifications" }
  ];

  return (
    <div>
      <div className="pg-hd"><div><h1>My Profile</h1><p>Manage your account, preferences and security</p></div></div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(to right,transparent,var(--orange),transparent)" }} />
        <div style={{ width: 68, height: 68, background: "var(--orange)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "#fff", flexShrink: 0 }}>
          {user?.name?.substring(0, 2).toUpperCase() || "AK"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: ".5px", marginBottom: 3 }}>{user?.name || "Ali Kamran"}</div>
          <div style={{ fontSize: 12, color: "var(--muted2)" }}>{user?.email} · Verified</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <Badge status="Active" />
            <span className="badge bg-b">Customer</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button 
            key={t.id} 
            className={`tab ${tab === t.id ? "on" : ""}`} 
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="card">
          <div className="ch"><div className="ct">Personal Information</div></div>
          {saved && <div className="alert alert-ok" style={{ marginBottom: 16, color: 'var(--green)' }}>✓ Profile updated successfully</div>}
          <div className="fgrid">
            <div className="fg"><label>First Name</label><input className="fi" value={form.first} onChange={e => setForm(p => ({ ...p, first: e.target.value }))} /></div>
            <div className="fg"><label>Last Name</label><input className="fi" value={form.last} onChange={e => setForm(p => ({ ...p, last: e.target.value }))} /></div>
            <div className="fg"><label>Email Address</label><input type="email" className="fi" value={form.email} disabled /></div>
            <div className="fg"><label>Phone Number</label><input type="tel" className="fi" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Save Changes</button>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="card">
          <div className="ch"><div className="ct">Notification Preferences</div></div>
          {[
            { key: "orders", label: "Order Updates", desc: "Shipping confirmations, status changes, delivery alerts" }, 
            { key: "bookings", label: "Booking Reminders", desc: "Appointment confirmations and 1-hour reminders" }
          ].map(n => (
            <div className="trow" key={n.key}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted2)" }}>{n.desc}</div>
              </div>
              <button 
                className={`tgl ${notifs[n.key] ? "on" : ""}`} 
                onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
