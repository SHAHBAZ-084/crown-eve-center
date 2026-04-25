// frontend/src/pages/dashboards/customer/Shop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";
import api from "../../../services/api";
import { useCart } from "../../../context/CartContext";

const Shop = () => {
  const navigate = useNavigate();
  const { addItem, count } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/products")
      .then(r => setProducts(r.data.data || r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p =>
    (cat === "All" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e, p) => {
    e.stopPropagation();
    addItem({ id: p.id, name: p.name, price: p.price, category: p.category }, 1);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="pg-hd">
        <div>
          <h1>Browse Shop</h1>
          <p>Authentic Crown Eve bikes, parts and accessories.</p>
        </div>
        <div className="pg-actions">
          <div className="fsearch">
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/my/cart")} style={{ position: "relative" }}>
            🛒 Cart {count > 0 && <span style={{ background: "var(--orange)", color: "#000", borderRadius: "50%", padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{count}</span>}
          </button>
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
              📦
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <Badge status={p.stock > 5 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock"} />
              </div>
            </div>
            <div className="prod-body">
              <div className="prod-cat">{p.category || "Product"}</div>
              <div className="prod-name">{p.name}</div>
              <div className="prod-spec">{p.description || ""}</div>
              <div className="prod-footer">
                <div className="prod-price">PKR {Number(p.price).toLocaleString()}</div>
                <button className="ca" style={{ fontSize: 10 }} onClick={e => handleAdd(e, p)}>Add to Cart +</button>
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
          <button className="btn btn-ghost btn-sm" onClick={() => { setCat("All"); setSearch(""); }}>Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default Shop;
