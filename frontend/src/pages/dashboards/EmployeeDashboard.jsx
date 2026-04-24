// frontend/src/pages/dashboards/EmployeeDashboard.jsx
import React, { useState, useEffect } from "react";
import { api, Icon, ToastHost, CSS, TOKEN_KEY } from "./employee/EmployeeShared";

// Import Page Components
import DashPage from "./employee/Dashboard";
import OrdersPage from "./employee/Orders";
import AppointmentsPage from "./employee/Appointments";
import InventoryPage from "./employee/Inventory";
import ProductsPage from "./employee/Products";

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",     icon: "dash",  section: "Overview" },
  { id: "orders",       label: "Orders",        icon: "orders",section: "Work" },
  { id: "appointments", label: "Appointments",  icon: "appt",  section: "Work" },
  { id: "inventory",    label: "Inventory",     icon: "inv",   section: "Work" },
  { id: "products",     label: "Products",      icon: "prod",  section: "Work" },
];

export default function EmployeeDashboard({ user: userProp }) {
  const [user, setUser]       = useState(userProp || null);
  const [checked, setChecked] = useState(!!userProp);
  const [page, setPage]       = useState("dashboard");

  useEffect(() => {
    if (userProp) { setUser(userProp); setChecked(true); return; }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setChecked(true); return; }
    api("/auth/me")
      .then(r => setUser(r.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecked(true));
  }, [userProp]);

  const logout = () => { 
    localStorage.removeItem(TOKEN_KEY); 
    setUser(null); 
    window.location.href = "/login"; 
  };

  if (!checked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080809" }}>
      <div style={{ width: 34, height: 34, border: "3px solid #FF4D00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  if (!user || user.role !== "EMPLOYEE") {
     return (
       <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080809", color: "#F0EFE9", flexDirection: "column", gap: "20px" }}>
         <h1 style={{ fontFamily: "Bebas Neue", fontSize: "48px", color: "#FF4D00" }}>Access Denied</h1>
         <p>This portal is reserved for employee accounts.</p>
         <button onClick={() => window.location.href = "/login"} style={{ padding: "10px 20px", background: "#FF4D00", border: "none", color: "white", borderRadius: "8px", cursor: "pointer" }}>Back to Login</button>
       </div>
     );
  }

  const branchId   = user.branchId;
  const branchName = user.branchName || `Branch #${branchId}`;
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  const current  = NAV_ITEMS.find(n => n.id === page) || NAV_ITEMS[0];

  const PAGES = {
    dashboard:    <DashPage         branchId={branchId} user={user} />,
    orders:       <OrdersPage       branchId={branchId} />,
    appointments: <AppointmentsPage branchId={branchId} />,
    inventory:    <InventoryPage    branchId={branchId} />,
    products:     <ProductsPage     branchId={branchId} />,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="emp-shell">
        {/* Sidebar */}
        <aside className="emp-sb">
          <div className="sb-logo">
            <div className="sb-mark">CE</div>
            <div>
              <div className="sb-wordmark">CROWN <span>EVE</span></div>
              <div className="sb-sub">Employee Portal</div>
            </div>
          </div>
          
          <nav style={{ flex: 1 }}>
            {sections.map(sec => (
              <div key={sec}>
                <div className="sb-group-label">{sec}</div>
                {NAV_ITEMS.filter(n => n.section === sec).map(n => (
                  <div key={n.id} className={`sb-link ${page === n.id ? "on" : ""}`} onClick={() => setPage(n.id)}>
                    <Icon n={n.icon} s={16} />
                    <span>{n.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </nav>

          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-av">{user.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="sb-uname">{user.name}</div>
                <div className="sb-urole">Employee</div>
              </div>
            </div>
            <div className="sb-logout" onClick={logout}>
              <Icon n="logout" s={15} /> Sign Out
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="emp-main">
          <div className="emp-topbar">
            <div className="topbar-left">
              <div className="topbar-pg">{current.label.toUpperCase()}</div>
              <div className="topbar-branch">{branchName}</div>
            </div>
            <div className="live-chip">
              <span className="live-dot" /> On Duty
            </div>
          </div>
          
          {PAGES[page] || PAGES.dashboard}
        </main>
      </div>
      <ToastHost />
    </>
  );
}
