// frontend/src/pages/public/Cart.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/customer.css';

const Cart = () => {
  const navigate = useNavigate();

  // Mock data matching the screenshot
  const items = [
    { id: 1, name: 'Crown Eve Elite Road', price: 4200, qty: 1, emoji: "🚲" },
    { id: 2, name: 'Aerodynamic Wheelset', price: 1200, qty: 1, emoji: "🛞" },
  ];

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = subtotal; // Matching the screenshot's "Calculated at checkout" for shipping

  return (
    <div id="customer-dashboard-shell">
      <div className="page-wrap">
        {/* Header Section */}
        <div className="pg-hd">
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', letterSpacing: '-1px' }}>Your Cart</h1>
            <p style={{ fontSize: '14px', color: 'var(--muted2)' }}>{items.length} items currently in your selection.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/shop")}>
            ← Continue Shopping
          </button>
        </div>

        <div className="g64">
          {/* Items List */}
          <div className="card">
            <div className="ch">
              <div className="ct">Items Overview</div>
            </div>
            {items.map(item => (
              <div key={item.id} className="ci" style={{ padding: '20px 0' }}>
                <div className="ci-img" style={{ width: '80px', height: '80px', fontSize: '32px' }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div className="ci-name" style={{ fontSize: '18px', fontWeight: 700 }}>{item.name}</div>
                  <div className="ci-sub" style={{ fontSize: '13px', marginTop: '4px' }}>Unit Price: PKR {item.price.toLocaleString()}</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn">−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn">+</button>
                </div>
                <div style={{ minWidth: 140, textAlign: "right" }}>
                  <div className="mono" style={{ fontWeight: 700, color: "var(--orange)", fontSize: '16px' }}>
                    PKR {(item.price * item.qty).toLocaleString()}
                  </div>
                  <button className="ca" style={{ fontSize: '10px', color: "var(--red)", marginTop: '4px' }}>Remove Item</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div>
            <div className="card" style={{ position: "sticky", top: "100px" }}>
              <div className="ch">
                <div className="ct">Order Summary</div>
              </div>
              <div className="trow">
                <span style={{ fontSize: 14, color: "var(--muted2)" }}>Subtotal</span>
                <span className="mono" style={{ fontWeight: 600, fontSize: '15px' }}>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="trow">
                <span style={{ fontSize: 14, color: "var(--muted2)" }}>Shipping</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", textTransform: 'uppercase' }}>Calculated at checkout</span>
              </div>
              <div className="divider" style={{ margin: '20px 0' }} />
              <div className="trow" style={{ padding: "10px 0" }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Estimated Total</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '36px', color: "var(--orange)" }}>
                  PKR {total.toLocaleString()}
                </span>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: "100%", marginTop: 24, height: 52, fontSize: '14px', borderRadius: '6px' }} 
                onClick={() => navigate("/checkout")}
              >
                PROCEED TO CHECKOUT →
              </button>
              
              <div style={{ marginTop: 24, padding: '16px', background: 'var(--black3)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.8 }}>
                  <span style={{ fontSize: 20 }}>🛡️</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: '1px' }}>Secure Payment</div>
                    <div style={{ fontSize: 11, color: 'var(--muted2)' }}>SSL Encrypted Checkout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
