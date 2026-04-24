// frontend/src/components/owner/OwnerLayout.jsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icon, ToastContainer } from "./OwnerShared";
import "../../styles/owner.css";

const NAV = [
  { id: "dashboard", label: "Dashboard", path: "/owner/dashboard", icon: "dashboard", section: "Overview" },
  { id: "branches", label: "Branches", path: "/owner/branches", icon: "branches", section: "Network" },
  { id: "parts", label: "Parts Catalog", path: "/owner/parts", icon: "parts", section: "Network" },
  { id: "orders", label: "All Orders", path: "/owner/orders", icon: "orders", section: "Operations" },
  { id: "purchases", label: "Purchases", path: "/owner/purchases", icon: "purchases", section: "Operations" },
  { id: "users", label: "Personnel", path: "/owner/users", icon: "users", section: "Admin" },
  { id: "reports", label: "Analytics", path: "/owner/reports", icon: "reports", section: "Admin" },
  { id: "settings", label: "Settings", path: "/owner/settings", icon: "settings", section: "Admin" },
];

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sections = [...new Set(NAV.map(n => n.section))];
  const currentPage = NAV.find(n => n.path === location.pathname);
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="owner-dashboard-root">
      <div className="shell">
        {/* Sidebar */}
        <div id="owner-sidebar-fixed">
          <div className="sidebar-logo" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center' }}>
            <div className="logo-mark">CE</div>
            <div style={{ marginLeft: '12px' }}>
              <div className="logo-text">CROWN <span>EVE</span></div>
              <div className="logo-sub">Owner Panel</div>
            </div>
          </div>
          
          <div id="owner-nav-list" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {sections.map(sec => (
              <div key={sec} className="nav-section" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column' }}>
                <div className="nav-section-label">{sec}</div>
                <div className="nav-links-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {NAV.filter(n => n.section === sec).map(n => (
                    <Link key={n.id} to={n.path} className={`nav-item ${location.pathname === n.path ? "active" : ""}`}>
                      <Icon name={n.icon} size={18} />
                      <span>{n.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div id="owner-sidebar-footer" style={{ marginTop: 'auto', borderTop: "1px solid var(--border)", paddingTop: '20px' }}>
            <div className="nav-user" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || "O"}</div>
              <div style={{ marginLeft: '10px' }}>
                <div className="nav-user-name">{user?.name || "Owner"}</div>
                <div className="nav-user-role">Company Owner</div>
              </div>
            </div>
            <div className="nav-item" onClick={handleLogout} style={{ color: "var(--red)", marginTop: '12px', cursor: 'pointer' }}>
              <Icon name="logout" size={18} />
              <span>Logout</span>
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{currentPage?.label?.toUpperCase() || "DASHBOARD"}</div>
            <div className="topbar-right">
              <div className="live-badge"><span className="live-dot" />Live Control Panel</div>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default OwnerLayout;
