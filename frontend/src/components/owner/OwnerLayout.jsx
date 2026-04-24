import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon, ToastContainer } from './OwnerShared';
import './owner-theme.css';

const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"dashboard", section:"Overview", path:"/owner/dashboard" },
  { id:"branches",  label:"Branches",  icon:"branches",  section:"Network", path:"/owner/branches" },
  { id:"parts",     label:"Parts Catalog", icon:"parts", section:"Network", path:"/owner/parts" },
  { id:"orders",    label:"All Orders",    icon:"orders",section:"Operations", path:"/owner/orders" },
  { id:"purchases", label:"Purchases",     icon:"purchases",section:"Operations", path:"/owner/purchases" },
  { id:"users",     label:"Personnel",     icon:"users", section:"Admin", path:"/owner/users" },
  { id:"reports",   label:"Analytics",     icon:"reports",section:"Admin", path:"/owner/reports" },
  { id:"settings",  label:"Settings",      icon:"settings",section:"Admin", path:"/owner/settings" },
];

const OwnerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const sections = [...new Set(NAV.map(n => n.section))];
  const currentPage = NAV.find(n => location.pathname.includes(n.path)) || NAV[0];

  return (
    <div className="owner-theme">
      <div className="shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">CE</div>
            <div>
              <div className="logo-text">CROWN <span>EVE</span></div>
              <div className="logo-sub">Owner Panel</div>
            </div>
          </div>
          <nav style={{ flex:1 }}>
            {sections.map(sec => (
              <div key={sec}>
                <div className="nav-section-label">{sec}</div>
                {NAV.filter(n => n.section === sec).map(n => (
                  <div 
                    key={n.id} 
                    className={`nav-item ${location.pathname.includes(n.path) ? "active" : ""}`} 
                    onClick={() => navigate(n.path)}
                  >
                    <Icon name={n.icon} size={18} />
                    <span>{n.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div style={{ paddingTop:20, borderTop:"1px solid var(--border)" }}>
            <div className="nav-user" style={{ marginBottom:12 }}>
              <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || 'O'}</div>
              <div>
                <div className="nav-user-name">{user?.name || 'Owner'}</div>
                <div className="nav-user-role">Owner</div>
              </div>
            </div>
            <div className="nav-item" onClick={logout} style={{ color:"var(--red)" }}>
              <Icon name="logout" size={18} />
              <span>Logout</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{currentPage?.label?.toUpperCase()}</div>
            <div className="topbar-right">
              <div className="live-badge"><span className="live-dot" />Live</div>
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
