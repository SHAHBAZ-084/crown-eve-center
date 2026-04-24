// frontend/src/pages/public/Cart.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/customer.css';

const PublicCart = () => {
  const navigate = useNavigate();

  // Mock cart data - in real app, use a CartContext
  const cart = [
    { id: 1, name: "Crown GT 390", price: 485000, qty: 1, emoji: "🏍️", cat: "Sport" },
    { id: 5, name: "Chain 21sp Heavy Duty", price: 2800, qty: 2, emoji: "🔗", cat: "Drivetrain" },
  ];

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.17;
  const total = subtotal + tax;

  return (
    <div id="customer-dashboard-shell">
      <div className="page-wrap">
        <div className="pg-hd">
          <div>
            <h1>Your Cart</h1>
            <p>Review your items before proceeding to checkout.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/shop")}>← Continue Shopping</button>
        </div>

        {cart.length > 0 ? (
          <div className="g64">
            <div className="card">
              <div className="ch"><div className="ct">Cart Items</div></div>
              {cart.map(item => (
                <div key={item.id} className="ci">
                  <div className="ci-img">{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div className="ci-name">{item.name}</div>
                    <div className="ci-sub">{item.cat} · PKR {item.price.toLocaleString()} each</div>
                  </div>
                  <div className="qty-ctrl">
                    <button className="qty-btn">−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn">+</button>
                  </div>
                  <div style={{ minWidth: 100, textAlign: "right" }}>
                    <div className="mono" style={{ fontWeight: 700, color: "var(--orange)" }}>PKR {(item.price * item.qty).toLocaleString()}</div>
                    <button className="ca" style={{ fontSize: 9, color: "var(--red)" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="card" style={{ position: "sticky", top: "100px" }}>
                <div className="ch"><div className="ct">Order Summary</div></div>
                <div className="trow">
                  <span style={{ fontSize: 13, color: "var(--muted2)" }}>Subtotal</span>
                  <span className="mono" style={{ fontWeight: 600 }}>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="trow">
                  <span style={{ fontSize: 13, color: "var(--muted2)" }}>Sales Tax (17%)</span>
                  <span className="mono" style={{ fontWeight: 600 }}>PKR {tax.toLocaleString()}</span>
                </div>
                <div className="trow">
                  <span style={{ fontSize: 13, color: "var(--muted2)" }}>Shipping</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)" }}>FREE</span>
                </div>
                <div className="divider" />
                <div className="trow" style={{ padding: "10px 0" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Total Amount</span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "var(--orange)" }}>PKR {total.toLocaleString()}</span>
                </div>
                <button className="btn btn-primary" style={{ width: "100%", marginTop: 20, height: 48 }} onClick={() => navigate("/checkout")}>
                  Proceed to Checkout →
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginTop: 20, opacity: 0.5 }}>
                  <span style={{ fontSize: 18 }}>🛡️</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Secure SSL Checkout</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="ei">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button className="btn btn-primary" onClick={() => navigate("/shop")}>Start Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCart;
