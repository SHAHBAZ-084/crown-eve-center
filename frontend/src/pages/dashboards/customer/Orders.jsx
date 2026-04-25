// frontend/src/pages/dashboards/customer/Orders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";
import api from "../../../services/api";

const Orders = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my")
      .then(r => { const d = r?.data?.data ?? r?.data; setOrders(Array.isArray(d) ? d : []); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (Array.isArray(orders) ? orders : []).filter(o => {
    if (!o) return false;
    if (tab === "All") return true;
    if (tab === "Active") return ["PENDING", "PROCESSING", "PREPARING"].includes(String(o.status).toUpperCase());
    if (tab === "Completed") return String(o.status).toUpperCase() === "COMPLETED";
    if (tab === "Cancelled") return String(o.status).toUpperCase() === "CANCELLED";
    return true;
  });

  return (
    <div>
      <div className="pg-hd">
        <div>
          <h1>My Orders</h1>
          <p>Track, manage and view your purchase history.</p>
        </div>
      </div>

      <div className="tabs">
        {["All", "Active", "Completed", "Cancelled"].map(t => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card">
        <div className="ch">
          <div className="ct">Recent Transactions</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{filtered.length} Orders found</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading orders...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td className="mono" style={{ color: "var(--orange)" }}>#{o.id}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <div className="tm">{o.items?.length || 0} Item{o.items?.length !== 1 ? "s" : ""}</div>
                      <div className="ts">{o.items?.[0]?.product?.name || "—"}{o.items?.length > 1 ? "..." : ""}</div>
                    </td>
                    <td className="mono" style={{ fontWeight: 600 }}>PKR {Number(o.total).toLocaleString()}</td>
                    <td><Badge status={o.status} /></td>
                    <td>
                      <button className="ca" onClick={() => navigate(`/track/${o.id}`)}>Track →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="ei">📦</div>
            <h3>No orders found</h3>
            <p>You don't have any orders in this category yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/shop")}>Start Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
