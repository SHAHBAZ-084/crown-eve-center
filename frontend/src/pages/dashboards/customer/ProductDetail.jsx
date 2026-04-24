// frontend/src/pages/dashboards/customer/ProductDetail.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  // Mock product data (In real app, fetch this via useFetch(`/products/${id}`))
  const p = { 
    id: id || 1, 
    name: "Crown GT 390", 
    cat: "Sport", 
    spec: "450cc · Fuel Injected · ABS. High performance sport bike designed for both track and street. Features advanced aerodynamics and a high-revving engine.", 
    price: 485000, 
    stock: 6, 
    emoji: "🏍️", 
    badge: "In Stock" 
  };

  const addToCart = () => {
    alert(`${qty}x ${p.name} added to cart`);
    navigate("/cart");
  };

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>
      <div className="g64">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ aspectRatio: "16/9", background: "var(--black3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, marginBottom: 16 }}>
              {p.emoji || "📦"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  style={{ 
                    width: 60, height: 60, background: "var(--card2)", borderRadius: 5, 
                    border: i === 1 ? "1px solid var(--orange)" : "1px solid var(--border)", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer" 
                  }}
                >
                  {p.emoji || "📦"}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <Badge status={p.badge} />
            <span className="mono" style={{ color: "var(--muted2)", fontSize: 11 }}>#PT-{String(p.id).padStart(4, "0")}</span>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--orange)", marginBottom: 6 }}>{p.cat}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, lineHeight: 0.95, letterSpacing: -1, marginBottom: 10 }}>{p.name}</div>
          <div style={{ fontSize: 14, color: "var(--white2)", marginBottom: 16, lineHeight: 1.6 }}>{p.spec}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color: "var(--orange)", letterSpacing: 1, marginBottom: 6 }}>PKR {p.price.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 24 }}>{p.stock} units in stock at Crown Eve Gulberg</div>
          <div className="divider" />
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 10 }}>Quantity</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-num">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(p.stock, q + 1))}>+</button>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted2)" }}>Max Available: {p.stock}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={addToCart}>
              Add {qty > 1 ? `${qty}x ` : ""}to Cart
            </button>
            <button className="btn btn-ghost">♡ Wishlist</button>
          </div>
          <div className="card" style={{ background: "var(--black3)" }}>
            <div className="ch"><div className="ct">Specifications</div></div>
            {[
              ["Category", p.cat], 
              ["Warranty", "1 Year Official"], 
              ["Availability", "Immediate"], 
              ["Shipping", "Across Pakistan"]
            ].map(([k, v]) => (
              <div className="trow" key={k}>
                <span style={{ fontSize: 12, color: "var(--muted2)" }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
