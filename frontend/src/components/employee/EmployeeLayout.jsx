// frontend/src/components/employee/EmployeeLayout.jsx
import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CSS, Icon, ToastHost } from '../../pages/dashboards/employee/EmployeeShared';

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dash", section: "Overview", path: "/emp/dashboard" },
  { id: "pos", label: "POS", icon: "dollar", section: "Work", path: "/emp/pos" },
  { id: "orders", label: "Orders", icon: "orders", section: "Work", path: "/emp/orders" },
  { id: "services", label: "Services", icon: "wrench", section: "Work", path: "/emp/services" },
];

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const branchName = user?.branchName || `Branch #${user?.branchId || ''}`;
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  const current = NAV_ITEMS.find(n => location.pathname.startsWith(n.path)) || NAV_ITEMS[0];

  return (
    <>
      <style>{CSS}</style>
      <div className="emp-shell">

        {/* ── Sidebar ── */}
        <aside className="emp-sb">
          {/* Logo */}
          <div className="sb-logo">
            <div className="sb-mark">CE</div>
            <div>
              <div className="sb-wordmark">CROWN <span>EVE</span></div>
              <div className="sb-sub">Employee Portal</div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="emp-nav-container">
            {sections.map(sec => (
              <div key={sec}>
                <div className="sb-group-label">{sec}</div>
                {NAV_ITEMS.filter(n => n.section === sec).map(n => (
                  <NavLink
                    key={n.id}
                    to={n.path}
                    className={({ isActive }) => `sb-link ${isActive ? "on" : ""}`}
                  >
                    <Icon n={n.icon} s={16} />
                    <span>{n.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-av">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="sb-uname">{user?.name}</div>
                <div className="sb-urole">Employee</div>
              </div>
            </div>
            <div className="sb-logout" onClick={handleLogout}>
              <Icon n="logout" s={15} /> Sign Out
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="emp-main">
          {/* Topbar */}
          <div className="emp-topbar">
            <div className="topbar-left">
              <div className="topbar-pg">{current?.label.toUpperCase()}</div>
              {branchName && <div className="topbar-branch">{branchName}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="live-chip"><span className="live-dot" />On Duty</div>
            </div>
          </div>

          {/* Page content rendered here */}
          <Outlet />
        </main>

      </div>

      <ToastHost />
    </>
  );
}
