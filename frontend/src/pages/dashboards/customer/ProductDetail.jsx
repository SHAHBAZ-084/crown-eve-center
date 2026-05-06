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
            <div style={{ aspectRatio: "16/9", background: "var(--black3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {(() => {
                const mainImg = product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url;
                const imgSrc = mainImg 
                  ? (mainImg.startsWith('http') ? mainImg : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${mainImg}`)
                  : null;
                
                return imgSrc ? (
                  <img src={imgSrc} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ fontSize: 72 }}>📦</div>
                );
              })()}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#00a3ff" }}>{product.category || "Product"}</span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, letterSpacing: -1, lineHeight: 0.95, marginBottom: 12 }}>{product.name}</h2>
            <div style={{ marginBottom: 16 }}><Badge status={stockStatus} /></div>
            <p style={{ fontSize: 13, color: "var(--white2)", lineHeight: 1.7, marginBottom: 20 }}>{product.description || "No description available."}</p>

            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: "#00a3ff", marginBottom: 20 }}>
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
                disabled={product.stock_qty === 0}
              >
                {added ? "✓ Added!" : "Add to Cart"}
              </button>
              <button className="btn btn-ghost" onClick={() => { handleAddToCart(); navigate("/my/cart"); }}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Branch Availability Section */}
      {product.otherBranches?.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ padding: "0 0 15px 0", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Also Available at Other Branches</h3>
            <p style={{ fontSize: 12, color: "var(--muted2)" }}>This product is also in stock at the following Crown Eve locations.</p>
          </div>
          <div className="g4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {product.otherBranches.map(ob => (
              <div key={ob.id} className="card ci" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{ob.branch.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.5 }}>{ob.branch.location || "Pakistan"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--acc)" }}>PKR {Number(ob.sale_price || ob.price).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: ob.stock_qty > 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                    {ob.stock_qty > 0 ? `${ob.stock_qty} IN STOCK` : "OUT OF STOCK"}
                  </div>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ marginTop: 8, fontSize: 10, height: 28, padding: "0 12px" }}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/shop/${ob.id}`);
                    }}
                  >
                    View this Branch →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
