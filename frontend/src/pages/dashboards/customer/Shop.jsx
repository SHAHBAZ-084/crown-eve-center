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
      .then(r => { const d = r?.data?.data ?? r?.data; setProducts(Array.isArray(d) ? d : []); })
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
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/cart")} style={{ position: "relative" }}>
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
        {filtered.map(p => {
          const mainImg = p.images?.find(img => img.is_primary)?.url || p.images?.[0]?.url;
          const imgSrc = mainImg 
            ? (mainImg.startsWith('http') ? mainImg : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${mainImg}`)
            : null;

          return (
            <div key={p.id} className="card" style={{ cursor: "pointer", transition: "all .2s", padding: 12, background: "#0c0c0c", border: "1px solid #1a1a1a" }} onClick={() => navigate(`/shop/${p.id}`)}>
              <div style={{ position: "relative", height: 140, background: "#000", borderRadius: 4, marginBottom: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {imgSrc ? (
                  <img src={imgSrc} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ fontSize: 24, opacity: 0.1 }}>📦</div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: "#fff", textTransform: "uppercase" }}>{p.name}</div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 }}>
                  <div style={{ fontSize: 10, color: "#00a3ff", fontWeight: 700, textTransform: "uppercase" }}>
                    {p.partDetail?.model || p.slug?.split('_').pop().toUpperCase()}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: p.stock_qty > 0 ? "#ff4d4d" : "#ff4d4d", fontWeight: 700, marginBottom: 2 }}>QTY: {p.stock_qty}</div>
                    <div style={{ fontSize: 18, color: "#00a3ff", fontWeight: 800, fontFamily: "var(--font-m)" }}>PKR {Number(p.sale_price || p.price).toLocaleString()}</div>
                  </div>
                </div>

                <button 
                  className="ca" 
                  style={{ marginTop: 8, fontSize: 9, color: "var(--orange)", fontWeight: 700, textAlign: "right", background: "none", border: "none", padding: 0 }} 
                  onClick={e => { e.stopPropagation(); handleAdd(e, p); }}
                >
                  ADD TO CART +
                </button>
              </div>
            </div>
          );
        })}
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
