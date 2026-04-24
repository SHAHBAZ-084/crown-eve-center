// frontend/src/pages/dashboards/customer/Orders.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";

const Orders = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");

  const ORDERS = [
    { id: "CE-4821", date: "Apr 23, 2025", items: [{ name: "Chain 21sp", qty: 2, price: 2800 }, { name: "Brake Pads Pro", qty: 1, price: 1200 }], total: 6800, status: "Processing", type: "Online", branch: "Lahore — Gulberg" },
    { id: "CE-4790", date: "Apr 15, 2025", items: [{ name: "Crown GT 390", qty: 1, price: 485000 }], total: 485000, status: "Completed", type: "Online", branch: "Islamabad — Blue Area" },
    { id: "CE-4754", date: "Apr 2, 2025", items: [{ name: "Oil Filter 17mm", qty: 3, price: 450 }, { name: "Engine Oil 1L", qty: 2, price: 850 }], total: 3050, status: "Completed", type: "Online", branch: "Lahore — Gulberg" },
    { id: "CE-4710", date: "Mar 20, 2025", items: [{ name: "LED Headlight H4", qty: 1, price: 3500 }], total: 3500, status: "Cancelled", type: "Online", branch: "Karachi — Clifton" },
  ];

  const filtered = ORDERS.filter(o => {
    if (tab === "All") return true;
    if (tab === "Active") return ["Processing", "Pending", "Preparing", "Delivery"].includes(o.status);
    return o.status === tab;
  });

  return (
    <div>
      <div className="pg-hd">
        <div>
          <h1>My Orders</h1>
          <p>Track, manage and view your purchase history.</p>
        </div>
        <button className="btn btn-ghost btn-sm">Download History (CSV)</button>
      </div>

      <div className="tabs">
        {["All", "Active", "Completed", "Cancelled"].map(t => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card">
        <div className="ch"><div className="ct">Recent Transactions</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{filtered.length} Orders found</div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Branch</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="mono" style={{ color: "var(--orange)" }}>{o.id}</td>
                  <td>{o.date}</td>
                  <td>
                    <div className="tm">{o.items.length} {o.items.length > 1 ? "Items" : "Item"}</div>
                    <div className="ts">{o.items[0].name}{o.items.length > 1 ? "..." : ""}</div>
                  </td>
                  <td>{o.branch.split(" — ")[0]}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>PKR {o.total.toLocaleString()}</td>
                  <td><Badge status={o.status} /></td>
                  <td>
                    <button className="ca" onClick={() => navigate(`/track/${o.id}`)}>Track →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
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
