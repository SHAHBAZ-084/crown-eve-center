// frontend/src/pages/dashboards/customer/Orders.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch, Badge, Icon } from "../../../components/customer/CustomerShared";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { data: orderData, loading } = useFetch("/orders/my"); // Assume this endpoint exists
  const [filter, setFilter] = useState("All");
  
  const orders = orderData?.data || [
    { id: "CE-4821", date: "Apr 23, 2025", items: [{ name: "Chain 21sp", qty: 2, price: 2800 }, { name: "Brake Pads Pro", qty: 1, price: 1200 }], total: 6800, status: "Processing", type: "Online", branch: "Lahore — Gulberg", payment: "JazzCash" },
    { id: "CE-4790", date: "Apr 15, 2025", items: [{ name: "Crown GT 390", qty: 1, price: 485000 }], total: 485000, status: "Completed", type: "Online", branch: "Islamabad — Blue Area", payment: "Bank Transfer" },
  ];

  const filters = ["All", "Processing", "Completed", "Cancelled"];
  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="pg-hd">
        <div><h1>My Orders</h1><p>Your complete order history</p></div>
        <button className="btn btn-ghost btn-sm">⬇ Download History</button>
      </div>
      <div className="fbar">
        {filters.map(f => (
          <button 
            key={f} 
            className={`fpill ${filter === f ? "on" : ""}`} 
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <div className="fsearch">
          <Icon name="search" size={12} />
          <input placeholder="Search order ID..." />
        </div>
      </div>
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading your orders...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ei">📦</div>
            <h3>No orders found</h3>
            <p>You have no {filter.toLowerCase()} orders yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Type</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td><span className="mono" style={{ color: "var(--orange)", fontSize: 12 }}>#{o.id}</span></td>
                    <td>
                      <div className="tm">{o.items?.[0]?.name || 'Item'}{o.items?.length > 1 && ` +${o.items.length - 1} more`}</div>
                      <div className="ts">{o.items?.length || 0} item{o.items?.length > 1 ? "s" : ""}</div>
                    </td>
                    <td style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--orange)" }}>
                      PKR {o.total?.toLocaleString()}
                    </td>
                    <td><span className="badge bg-b" style={{ fontSize: 9 }}>{o.type}</span></td>
                    <td className="ts">{o.branch}</td>
                    <td><Badge status={o.status} /></td>
                    <td className="ts">{o.date}</td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button 
                          className="btn btn-ghost btn-xs" 
                          onClick={() => navigate(`/track/${o.id}`)}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
