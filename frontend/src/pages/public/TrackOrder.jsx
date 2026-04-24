// frontend/src/pages/public/TrackOrder.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/customer.css';

const PublicTrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(id || "");
  const [showResults, setShowResults] = useState(!!id);

  const STEPS = [
    { label: "Order Placed", date: "Apr 23, 09:14 AM", done: true },
    { label: "Payment Confirmed", date: "Apr 23, 09:16 AM", done: true },
    { label: "Being Prepared", date: "Apr 23, 11:30 AM", done: true, active: true },
    { label: "Out for Delivery", date: "Expected by 3:00 PM", done: false },
    { label: "Delivered", date: "Processing", done: false },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId) setShowResults(true);
  };

  return (
    <div id="customer-dashboard-shell">
      <div className="main-wrap">
        <div className="page-wrap">
          <div className="pg-hd" style={{ textAlign: 'center', display: 'block', marginBottom: '40px', paddingTop: '60px' }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '56px', letterSpacing: '-1px', marginBottom: '8px' }}>
              Track Your Build
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted2)', maxWidth: '500px', margin: '0 auto' }}>
              Enter your order reference ID below to see live progress and delivery updates.
            </p>
          </div>

          <div className="card" style={{ maxWidth: '600px', margin: '0 auto 40px', padding: '24px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  className="fi" 
                  placeholder="e.g. CEB-123456" 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  style={{ height: '48px', paddingLeft: '40px' }}
                />
              </div>
              <button className="btn btn-primary" type="submit" style={{ height: '48px', padding: '0 24px' }}>
                Track Progress
              </button>
            </form>
          </div>

          {showResults && (
            <div className="g73">
              <div className="card">
                <div className="ch">
                  <div className="ct">Live Build Status</div>
                  <div className="badge bg-b">In Assembly</div>
                </div>
                <div className="timeline" style={{ padding: "10px 0" }}>
                  {STEPS.map((s, i) => (
                    <div key={s.label} className="tl-item">
                      <div className="tl-left">
                        <div className={`tl-dot ${s.done ? "done" : ""} ${s.active ? "active" : ""}`} />
                        {i < STEPS.length - 1 && <div className={`tl-line ${s.done ? "done" : ""}`} />}
                      </div>
                      <div className="tl-content">
                        <div className="tl-title" style={{ fontSize: '14px', fontWeight: 700 }}>{s.label}</div>
                        <div className="tl-date" style={{ fontSize: '11px' }}>{s.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="card" style={{ marginBottom: '20px' }}>
                  <div className="ch"><div className="ct">Build Summary</div></div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, background: "var(--black3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>Build</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Crown GT 390</div>
                      <div style={{ fontSize: 11, color: "var(--muted2)" }}>Sport Edition</div>
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="trow">
                    <span style={{ fontSize: 12, color: "var(--muted2)" }}>Order ID</span>
                    <span className="mono" style={{ fontWeight: 600 }}>#{searchId}</span>
                  </div>
                </div>

                <div className="card">
                  <div className="ch"><div className="ct">Need Help?</div></div>
                  <p style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.6, marginBottom: '16px' }}>
                    Contact our support team for help.
                  </p>
                  <button className="btn btn-ghost btn-xs" style={{ width: '100%' }}>Contact Support</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicTrackOrder;
