// frontend/src/pages/public/Shop.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/customer.css';

const PublicShop = () => {
  const navigate = useNavigate();
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const PRODUCTS = [
    { id: 1, name: "Crown GT 390", cat: "Sport", spec: "450cc · Fuel Injected · ABS", price: 485000, stock: 6, emoji: "🏍️", badge: "In Stock" },
    { id: 2, name: "Crown Duke R", cat: "Naked", spec: "250cc · Street Fighter · LED", price: 310000, stock: 4, emoji: "🏍️", badge: "New Arrival" },
    { id: 3, name: "Crown Trail X", cat: "Adventure", spec: "650cc · Dual Sport · Long Range", price: 720000, stock: 2, emoji: "🏍️", badge: "Low Stock" },
    { id: 4, name: "Crown 125 Pro", cat: "Commuter", spec: "125cc · Commuter · Economy", price: 185000, stock: 12, emoji: "🛵", badge: "In Stock" },
    { id: 5, name: "Chain 21sp Heavy Duty", cat: "Drivetrain", spec: "Compatible: Duke, GT series", price: 2800, stock: 842, emoji: "🔗", badge: "In Stock" },
    { id: 6, name: "Brake Pads Pro", cat: "Brakes", spec: "Front & Rear — Universal", price: 1200, stock: 240, emoji: "🛞", badge: "In Stock" },
    { id: 7, name: "LED Headlight H4", cat: "Electrical", spec: "6000K · 35W · IP67", price: 3500, stock: 315, emoji: "💡", badge: "In Stock" },
    { id: 8, name: "Oil Filter 17mm", cat: "Engine", spec: "Universal fitment · OEM grade", price: 450, stock: 12, emoji: "🔩", badge: "Low Stock" },
  ];

  const categories = ["All", "Sport", "Naked", "Adventure", "Commuter", "Drivetrain", "Brakes", "Electrical", "Engine"];
  const filtered = PRODUCTS.filter(p => (cat === "All" || p.cat === cat) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div id="customer-dashboard-shell">
      <div className="page-wrap">
        <div className="pg-hd">
          <div>
            <h1>Crown Eve Shop</h1>
            <p>Authentic Crown Eve bikes, parts and accessories.</p>
          </div>
          <div className="pg-actions">
            <div className="fsearch">
              <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="fbar">
          {categories.map(c => (
            <button key={c} className={`fpill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div className="g4">
          {filtered.map(p => (
            <div key={p.id} className="prod-card" onClick={() => navigate(`/shop/${p.id}`)}>
              <div className="prod-img">
                {p.emoji}
                <div style={{ position: "absolute", top: 12, right: 12, display: 'flex', gap: 5 }}>
                  <span className={`badge ${p.badge === 'In Stock' ? 'bg-g' : p.badge === 'Low Stock' ? 'bg-a' : 'bg-o'}`}>{p.badge}</span>
                </div>
              </div>
              <div className="prod-body">
                <div className="prod-cat">{p.cat}</div>
                <div className="prod-name">{p.name}</div>
                <div className="prod-spec">{p.spec}</div>
                <div className="prod-footer">
                  <div className="prod-price">PKR {p.price.toLocaleString()}</div>
                  <button className="ca" style={{ fontSize: 10 }}>View Details →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="ei">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicShop;
