// frontend/src/pages/dashboards/customer/Shop.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Icon, useFetch } from "../../../components/customer/CustomerShared";

const ShopPage = () => {
  const navigate = useNavigate();
  const { data: productData, loading } = useFetch("/products"); // Assume this endpoint exists
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const products = productData?.data || [
    { id: 1, name: "Crown GT 390", cat: "Sport", spec: "450cc · Fuel Injected · ABS", price: 485000, stock: 6, emoji: "🏍️", badge: "In Stock" },
    { id: 2, name: "Crown Duke R", cat: "Naked", spec: "250cc · Street Fighter · LED", price: 310000, stock: 4, emoji: "🏍️", badge: "New Arrival" },
    { id: 5, name: "Chain 21sp Heavy Duty", cat: "Drivetrain", spec: "Compatible: Duke, GT series", price: 2800, stock: 842, emoji: "🔗", badge: "In Stock" },
  ];

  const cats = ["All", "Sport", "Naked", "Adventure", "Commuter", "Drivetrain", "Brakes", "Engine", "Electrical"];
  const filtered = products.filter(p => {
    const matchCat = filter === "All" || p.cat === filter;
    const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    // Basic cart logic for now
    alert(`${product.name} added to cart`);
  };

  return (
    <div>
      <div className="pg-hd">
        <div><h1>Shop</h1><p>Browse premium bikes, parts, and accessories</p></div>
      </div>
      <div className="fbar">
        {cats.map(c => (
          <button 
            key={c} 
            className={`fpill ${filter === c ? "on" : ""}`} 
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
        <div className="fsearch">
          <Icon name="search" size={12} />
          <input 
            placeholder="Search products..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="ei">🔍</div>
          <h3>No results</h3>
          <p>Try a different search or category filter.</p>
        </div>
      ) : (
        <div className="g4">
          {filtered.map(p => (
            <div className="prod-card" key={p.id}>
              <div className="prod-img" onClick={() => navigate(`/shop/${p.id}`)}>
                <span style={{ fontSize: 40 }}>{p.emoji || "📦"}</span>
              </div>
              <div className="prod-body">
                <div className="prod-cat">{p.cat}</div>
                <div className="prod-name">{p.name}</div>
                <div className="prod-spec">{p.spec}</div>
                <div className="prod-footer">
                  <div className="prod-price">PKR {p.price.toLocaleString()}</div>
                  <Badge status={p.badge} />
                </div>
                <button className="btn btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
