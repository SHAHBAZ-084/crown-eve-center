// frontend/src/pages/dashboards/customer/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";
import api from "../../../services/api";
import { useCart } from "../../../context/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, category: product.category }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}>Loading...</div>;
  if (!product) return (
    <div className="empty-state">
      <div className="ei">❌</div>
      <h3>Product not found</h3>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate("/shop")}>Back to Shop</button>
    </div>
  );

  const stockStatus = product.stock > 5 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock";

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>
      <div className="g64">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ aspectRatio: "16/9", background: "var(--black3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, marginBottom: 16 }}>
              📦
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--orange)" }}>{product.category || "Product"}</span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, letterSpacing: -1, lineHeight: 0.95, marginBottom: 12 }}>{product.name}</h2>
            <div style={{ marginBottom: 16 }}><Badge status={stockStatus} /></div>
            <p style={{ fontSize: 13, color: "var(--white2)", lineHeight: 1.7, marginBottom: 20 }}>{product.description || "No description available."}</p>

            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: "var(--orange)", marginBottom: 20 }}>
              PKR {Number(product.price).toLocaleString()}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-num">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted2)" }}>{product.stock} in stock</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {added ? "✓ Added!" : "Add to Cart"}
              </button>
              <button className="btn btn-ghost" onClick={() => { handleAddToCart(); navigate("/cart"); }}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
