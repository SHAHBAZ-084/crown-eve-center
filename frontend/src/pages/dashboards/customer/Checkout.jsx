// frontend/src/pages/dashboards/customer/Checkout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({ name: "", phone: "", address: "", city: "", zip: "" });
  const [payment, setPayment] = useState("jazzcash");
  const [placed, setPlaced] = useState(false);

  // Mock cart data
  const cart = [
    { id: 5, name: "Chain 21sp Heavy Duty", price: 2800, qty: 2 },
    { id: 6, name: "Brake Pads Pro", price: 1200, qty: 1 }
  ];
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (placed) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ width: 80, height: 80, background: "var(--gbg)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 24px" }}>✓</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, letterSpacing: -1, marginBottom: 8 }}>Order <span style={{ color: "var(--orange)" }}>Placed!</span></div>
      <div style={{ fontSize: 14, color: "var(--white2)", maxWidth: 380, margin: "0 auto 8px", lineHeight: 1.7 }}>Your order has been confirmed. We'll notify you when it's on its way.</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, color: "var(--orange)", margin: "16px 0 32px" }}>#CE-4822</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/my/orders")}>View My Orders</button>
        <button className="btn btn-primary" onClick={() => navigate("/shop")}>Shop More</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="pg-hd"><div><h1>Checkout</h1><p>Complete your order</p></div></div>
      <div className="step-bar" style={{ marginBottom: 28 }}>
        {[{ n: 1, l: "Address" }, { n: 2, l: "Payment" }, { n: 3, l: "Confirm" }].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
            <div className={`step ${step === s.n ? "on" : step > s.n ? "done" : ""}`}>
              <div className="step-num">{step > s.n ? "✓" : s.n}</div>{s.l}
            </div>
            {i < 2 && <div className="step-conn" />}
          </div>
        ))}
      </div>
      <div className="g64" style={{ alignItems: "start" }}>
        <div>
          {step === 1 && (
            <div className="card">
              <div className="ch"><div className="ct">Delivery Address</div></div>
              <div className="fgrid">
                <div className="fg"><label>Full Name</label><input className="fi" value={addr.name} onChange={e => setAddr(p => ({ ...p, name: e.target.value }))} placeholder="Your name" /></div>
                <div className="fg"><label>Phone</label><input className="fi" value={addr.phone} onChange={e => setAddr(p => ({ ...p, phone: e.target.value }))} placeholder="+92 300 0000000" /></div>
              </div>
              <div className="fg"><label>Street Address</label><input className="fi" value={addr.address} onChange={e => setAddr(p => ({ ...p, address: e.target.value }))} placeholder="Street, block, area" /></div>
              <div className="fgrid">
                <div className="fg"><label>City</label><select className="fs" value={addr.city} onChange={e => setAddr(p => ({ ...p, city: e.target.value }))}><option value="">Select city</option><option>Lahore</option><option>Karachi</option><option>Islamabad</option><option>Faisalabad</option></select></div>
                <div className="fg"><label>Branch for Pickup</label><select className="fs"><option>Home Delivery</option><option>Crown Eve Gulberg</option><option>Crown Eve DHA</option></select></div>
              </div>
              <button 
                className="btn btn-primary" 
                disabled={!addr.name || !addr.phone || !addr.address || !addr.city} 
                style={{ opacity: (addr.name && addr.phone && addr.address && addr.city) ? 1 : 0.4 }} 
                onClick={() => setStep(2)}
              >
                Continue to Payment →
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="card">
              <div className="ch"><div className="ct">Payment Method</div></div>
              {[
                { id: "jazzcash", label: "JazzCash", icon: "📱" }, 
                { id: "easypaisa", label: "EasyPaisa", icon: "📱" }, 
                { id: "card", label: "Debit / Credit Card", icon: "💳" }, 
                { id: "bank", label: "Bank Transfer", icon: "🏦" }, 
                { id: "cod", label: "Cash on Delivery", icon: "💵" }
              ].map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setPayment(m.id)} 
                  style={{ 
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", 
                    background: payment === m.id ? "rgba(255,77,0,0.06)" : "var(--black3)", 
                    border: `1px solid ${payment === m.id ? "var(--orange)" : "var(--border)"}`, 
                    borderRadius: 6, marginBottom: 8, cursor: "pointer", transition: "all .2s" 
                  }}
                >
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: payment === m.id ? "var(--white)" : "var(--white2)" }}>{m.label}</span>
                  {payment === m.id && <span style={{ marginLeft: "auto", color: "var(--orange)", fontSize: 16 }}>✓</span>}
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="card">
              <div className="ch"><div className="ct">Confirm Order</div></div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 10 }}>Items</div>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--white2)" }}>{item.name} ×{item.qty}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>PKR {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="trow"><span style={{ fontSize: 12, color: "var(--muted2)" }}>Delivery To</span><span style={{ fontSize: 12, fontWeight: 600 }}>{addr.address}, {addr.city}</span></div>
              <div className="trow"><span style={{ fontSize: 12, color: "var(--muted2)" }}>Payment</span><span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{payment}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "var(--orange)" }}>PKR {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setPlaced(true)}>Place Order ✓</button>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ position: "sticky", top: 80 }}>
          <div className="ch"><div className="ct">Order Summary</div></div>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--white2)" }}>{item.name} ×{item.qty}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>PKR {(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="divider" />
          <div className="trow"><span style={{ fontSize: 12, color: "var(--muted2)" }}>Subtotal</span><span style={{ fontSize: 13, fontWeight: 600 }}>PKR {subtotal.toLocaleString()}</span></div>
          <div className="trow"><span style={{ fontSize: 12, color: "var(--muted2)" }}>Shipping</span><span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>Free</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16, fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "var(--orange)" }}>PKR {subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
