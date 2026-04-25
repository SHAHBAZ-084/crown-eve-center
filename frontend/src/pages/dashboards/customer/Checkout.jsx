// frontend/src/pages/dashboards/customer/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import api from "../../../services/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({ name: "", phone: "", address: "", city: "" });
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");

  const tax = total * 0.17;
  const grandTotal = total + tax;

  useEffect(() => {
    api.get("/branches").then(r => setBranches(r.data.data || r.data || [])).catch(() => {});
  }, []);

  if (!items.length && !placedOrder) return (
    <div className="empty-state">
      <div className="ei">🛒</div>
      <h3>Your cart is empty</h3>
      <button className="btn btn-primary" onClick={() => navigate("/shop")}>Start Shopping</button>
    </div>
  );

  if (placedOrder) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ width: 80, height: 80, background: "var(--gbg)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 24px" }}>✓</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, letterSpacing: -1, marginBottom: 8 }}>Order <span style={{ color: "var(--orange)" }}>Placed!</span></div>
      <div style={{ fontSize: 14, color: "var(--white2)", maxWidth: 380, margin: "0 auto 8px", lineHeight: 1.7 }}>Your order has been confirmed. We'll notify you when it's ready.</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, color: "var(--orange)", margin: "16px 0 32px" }}>#{placedOrder.id}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/my/orders")}>View My Orders</button>
        <button className="btn btn-primary" onClick={() => navigate("/shop")}>Shop More</button>
      </div>
    </div>
  );

  const handlePlaceOrder = async () => {
    if (!branchId) { setError("Please select a branch."); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        branchId: Number(branchId),
        total: grandTotal,
        type: "ONLINE",
        items: items.map(i => ({ productId: i.id, quantity: i.qty, price: i.price }))
      };
      const res = await api.post("/orders", payload);
      clearCart();
      setPlacedOrder(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pg-hd"><div><h1>Checkout</h1><p>Complete your order</p></div></div>

      <div className="step-bar" style={{ marginBottom: 28 }}>
        {[{ n: 1, l: "Address" }, { n: 2, l: "Branch" }, { n: 3, l: "Confirm" }].map((s, i) => (
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
              <div className="fg">
                <label>City</label>
                <select className="fs" value={addr.city} onChange={e => setAddr(p => ({ ...p, city: e.target.value }))}>
                  <option value="">Select city</option>
                  {["Lahore", "Karachi", "Islamabad", "Faisalabad", "Rawalpindi"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 20 }} disabled={!addr.name || !addr.phone || !addr.city} onClick={() => setStep(2)}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <div className="ch"><div className="ct">Select Branch</div></div>
              <p style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 16 }}>Choose which branch will fulfill your order.</p>
              {branches.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Loading branches...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {branches.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setBranchId(b.id)}
                      style={{
                        padding: "14px 16px",
                        border: `1px solid ${branchId == b.id ? "var(--orange)" : "var(--border)"}`,
                        borderRadius: 6,
                        cursor: "pointer",
                        background: branchId == b.id ? "rgba(255,77,0,0.05)" : "var(--black3)"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 2 }}>{b.address || b.city || ""}</div>
                    </div>
                  ))}
                </div>
              )}
              {error && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 10 }}>{error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" disabled={!branchId} onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <div className="ch"><div className="ct">Order Confirmation</div></div>
              <div style={{ marginBottom: 16 }}>
                {items.map(i => (
                  <div key={i.id} className="trow">
                    <span style={{ fontSize: 13 }}>{i.name} × {i.qty}</span>
                    <span className="mono" style={{ fontSize: 13 }}>PKR {(i.price * i.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div className="divider" />
                <div className="trow"><span style={{ fontSize: 13, color: "var(--muted2)" }}>Tax (17%)</span><span className="mono">PKR {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                <div className="trow" style={{ padding: "10px 0" }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "var(--orange)" }}>PKR {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
              <div style={{ background: "var(--black3)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Delivery to: {addr.name}</div>
                <div style={{ color: "var(--muted2)" }}>{addr.address}, {addr.city} · {addr.phone}</div>
                <div style={{ color: "var(--muted2)", marginTop: 4 }}>Branch: {branches.find(b => b.id == branchId)?.name || branchId}</div>
              </div>
              {error && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>{error}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? "Placing..." : "Place Order →"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card" style={{ position: "sticky", top: "calc(var(--nav) + 20px)" }}>
          <div className="ch"><div className="ct">Your Order</div></div>
          {items.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span>{i.name} × {i.qty}</span>
              <span className="mono">PKR {(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 700 }}>
            <span>Grand Total</span>
            <span style={{ color: "var(--orange)" }}>PKR {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
