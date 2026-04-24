// frontend/src/components/customer/CustomerLayout.jsx
import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/customer.css";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", path: "/my/dashboard" },
  { id: "shop",     label: "Shop",     path: "/shop" },
  { id: "orders",   label: "My Orders", path: "/my/orders" },
  { id: "bookings", label: "My Bookings", path: "/my/bookings" },
  { id: "profile",  label: "Profile",   path: "/my/profile" },
];

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div id="customer-dashboard-shell">
      <nav className="cnav">
        <div className="cnav-logo" onClick={() => navigate("/my/dashboard")}>
          <div className="logo-hex">CE</div>
          <span className="logo-txt">Crown <em>Eve</em></span>
        </div>
        <div className="cnav-links">
          {NAV_ITEMS.map(n => (
            <button 
              key={n.id} 
              className={`cnl ${location.pathname === n.path ? "active" : ""}`} 
              onClick={() => navigate(n.path)}
            >
              {n.label}
            </button>
          ))}
        </div>
        <div className="cnav-right">
          <button className="cart-btn" onClick={() => navigate("/cart")}>
            🛒 Cart
          </button>
          <div className="user-pill" onClick={() => navigate("/my/profile")}>
            <div className="ua">
              {user?.name?.substring(0, 2).toUpperCase() || "AK"}
            </div>
            <span className="user-name-pill">{user?.name || "Ali Kamran"}</span>
          </div>
          <button 
            className="btn btn-ghost btn-xs" 
            onClick={handleLogout}
            style={{ marginLeft: 10, color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            Logout
          </button>
        </div>
      </nav>
      
      <div className="main-wrap">
        <div className="page-wrap">
          <Outlet context={{ user }} />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
