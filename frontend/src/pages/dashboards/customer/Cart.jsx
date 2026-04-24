// frontend/src/pages/dashboards/customer/Cart.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/customer/CustomerShared";

const CartPage = () => {
  const navigate = useNavigate();
  // Mock cart data for demonstration
  const [cart, setCart] = useState([
    { id: 5, name: "Chain 21sp Heavy Duty", cat: "Drivetrain", price: 2800, qty: 2, emoji: "🔗" },
    { id: 6, name: "Brake Pads Pro", cat: "Brakes", price: 1200, qty: 1, emoji: "🛞" }
  ]);

  const updateQty = (id, newQty) => {
    if (newQty < 1) return removeItem(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cart.length === 0) return (
    <div>
      <div className="pg-hd"><div><h1>My Cart</h1><p>Your selected items</p></div></div>
      <div className="empty-state">
        <div className="ei">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Browse our shop and add items to your cart.</p>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/shop")}>Browse Shop</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="pg-hd">
        <div><h1>My Cart</h1><p>{cart.length} item{cart.length > 1 ? "s" : ""} in your cart</p></div>
      </div>
      <div className="g73" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="ch">
            <div className="ct">Cart Items</div>
            <button className="ca" onClick={() => setCart([])}>Clear All</button>
          </div>
          {cart.map(item => (
            <div className="ci" key={item.id}>
              <div className="ci-img">{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="ci-name">{item.name}</div>
                <div className="ci-sub">{item.cat} · PKR {item.price.toLocaleString()} each</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--orange)", minWidth: 80, textAlign: "right" }}>
                  PKR {(item.price * item.qty).toLocaleString()}
                </div>
                <button 
                  style={{ background: "none", border: "none", color: "var(--muted2)", fontSize: 16, cursor: "pointer", padding: "0 4px" }} 
                  onClick={() => removeItem(item.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="card" style={{ position: "sticky", top: 80 }}>
          <div className="ch"><div className="ct">Order Summary</div></div>
          <div className="trow"><span style={{ fontSize: 12, color: "var(--muted2)" }}>Subtotal ({cart.length} items)</span><span style={{ fontSize: 14, fontWeight: 600 }}>PKR {subtotal.toLocaleString()}</span></div>
          <div className="trow"><span style={{ fontSize: 12, color: "var(--muted2)" }}>Shipping</span><span style={{ fontSize: 14, fontWeight: 600, color: "var(--green)" }}>Free</span></div>
          <div className="trow"><span style={{ fontSize: 12, color: "var(--muted2)" }}>Tax</span><span style={{ fontSize: 14, fontWeight: 600 }}>PKR 0</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid var(--border)", marginTop: 4 }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "var(--orange)" }}>PKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="fg">
            <label>Promo Code</label>
            <div style={{ display: "flex", gap: 0 }}>
              <input type="text" className="fi" placeholder="Enter code" style={{ borderRadius: "4px 0 0 4px" }} />
              <button className="btn btn-ghost" style={{ borderRadius: "0 4px 4px 0", flexShrink: 0 }}>Apply</button>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} onClick={() => navigate("/checkout")}>
            Proceed to Checkout →
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => navigate("/shop")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
