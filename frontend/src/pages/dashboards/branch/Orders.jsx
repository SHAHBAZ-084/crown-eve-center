// frontend/src/pages/dashboards/branch/Orders.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, apiFetch, toast, Icon, TblSk, ORDER_BADGE } from "../../../components/branch/BranchShared";

const Orders = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;

  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("");
  const params = new URLSearchParams({ branchId, page, limit: 12, ...(status && { status }) }).toString();
  const { data, loading, refetch } = useFetch(`/orders?${params}`, [page, status, branchId]);
  const [viewing, setViewing] = useState(null);
  const [trackId, setTrackId] = useState("");
  const [updating, setUpdating] = useState(null);

  const updateOrderData = async (id, payload) => {
    setUpdating(id);
    try {
      await apiFetch(`/orders/${id}/status`, { method: "PUT", body: payload });
      toast("Order updated");
      refetch();
      if (viewing?.id === id) setViewing(null);
    } catch (e) { toast(e.message, "e"); }
    setUpdating(null);
  };

  const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Operations</div>
          <div className="ptitle">ORDER QUEUE</div>
          <div className="psub">Live transaction stream · {data?.meta?.total || 0} total</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-s btn-sm" onClick={() => refetch()}><Icon n="refresh" /> Refresh</button>
        </div>
      </div>

      {/* Mobile filter dropdown */}
      <div className="mobile-filter">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Orders</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Status tabs (Desktop) */}
      <div className="tabs desktop-tabs">
        {["", ...STATUSES].map(s => (
          <div key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => { setStatus(s); setPage(1); }}>
            {s || "All"}
          </div>
        ))}
      </div>

      <div className="tw">
        {loading ? <TblSk rows={8} /> : (
          <table>
            <thead><tr><th>Ref</th><th>Type</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>
              {data?.data?.map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700 }}>#{o.id}</span></td>
                  <td><span className={`badge ${o.type === "ONLINE" ? "bg-b" : "bg-p"}`}>{o.type}</span></td>
                  <td style={{ fontSize: 12 }}>{o.customer?.name || o.customer_name || "—"}</td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{o.items?.length || 0} items</td>
                  <td style={{ fontWeight: 700, color: "var(--acc)" }}>Rs. {o.total?.toLocaleString()}</td>
                  <td><span className={`badge ${ORDER_BADGE[o.status] || "bg-b"}`}>{o.status}</span></td>
                  <td>
                    {o.type === "ONLINE" ? (
                      <span className={`badge ${o.payment_status === "PAID" ? "bg-s" : o.payment_status === "REJECTED" ? "bg-r" : "bg-p"}`}>
                        {o.payment_status}
                      </span>
                    ) : <span style={{ color: "var(--muted2)", fontSize: 11 }}>CASH</span>}
                  </td>
                  <td>
                    <div className="tda" style={{ justifyContent: "flex-end", gap: 8 }}>
                      {o.type === "ONLINE" && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setViewing(o); setTrackId(o.tracking_id || ""); }}>Verify</button>
                      )}
                      <select
                        value={o.status}
                        onChange={e => updateOrderData(o.id, { status: e.target.value })}
                        disabled={updating === o.id}
                        style={{ width: 110, padding: "5px 8px", fontSize: 11 }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && <tr><td colSpan={8}><div className="empty"><Icon n="orders" size={36} /><div className="empty-t">No orders found</div></div></td></tr>}
            </tbody>
          </table>
        )}
        <div className="pag">
          <div className="pag-info">Showing {data?.data?.length || 0} of {data?.meta?.total || 0}</div>
          <div className="pag-ctrl">
            <button className="pb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className="pb" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {viewing && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Verify Payment #{viewing.id}</h3>
              <button className="close-btn" onClick={() => setViewing(null)}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div className="fgrid" style={{ marginBottom: 20 }}>
                <div className="fg"><label>Transaction ID</label><div className="fi" style={{ background: "var(--black2)" }}>{viewing.transaction_id || "None"}</div></div>
                <div className="fg"><label>Payment Status</label><div style={{ fontWeight: 700, color: viewing.payment_status === 'PAID' ? '#22c55e' : '#eab308' }}>{viewing.payment_status}</div></div>
              </div>
              
              <label>Payment Proof</label>
              {viewing.payment_screenshot ? (
                <div style={{ margin: "10px 0", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${viewing.payment_screenshot}`} 
                    alt="Proof" 
                    style={{ width: "100%", display: "block" }} 
                  />
                </div>
              ) : <div style={{ padding: 20, textAlign: "center", background: "var(--black3)", borderRadius: 8, color: "var(--muted2)" }}>No screenshot uploaded</div>}

              <div className="fg" style={{ marginTop: 20 }}>
                <label>Tracking ID (Optional)</label>
                <input className="fi" placeholder="Enter tracking number" value={trackId} onChange={e => setTrackId(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => updateOrderData(viewing.id, { payment_status: "REJECTED" })} disabled={updating}>Reject Payment</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => updateOrderData(viewing.id, { payment_status: "PAID", tracking_id: trackId, status: trackId ? "SHIPPED" : viewing.status })} disabled={updating}>Approve & Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

