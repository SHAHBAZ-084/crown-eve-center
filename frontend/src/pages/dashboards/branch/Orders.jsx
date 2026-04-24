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
  const [updating, setUpdating] = useState(null);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await apiFetch(`/orders/${id}/status`, { method: "PUT", body: { status: newStatus } });
      toast("Order status updated");
      refetch();
    } catch (e) { toast(e.message, "e"); }
    setUpdating(null);
  };

  const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

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

      {/* Status tabs */}
      <div className="tabs">
        {["", ...STATUSES].map(s => (
          <div key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => { setStatus(s); setPage(1); }}>
            {s || "All"}
          </div>
        ))}
      </div>

      <div className="tw">
        {loading ? <TblSk rows={8} /> : (
          <table>
            <thead><tr><th>Ref</th><th>Type</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th style={{ textAlign: "right" }}>Update</th></tr></thead>
            <tbody>
              {data?.data?.map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700 }}>#{o.id}</span></td>
                  <td><span className={`badge ${o.type === "ONLINE" ? "bg-b" : "bg-p"}`}>{o.type}</span></td>
                  <td style={{ fontSize: 12 }}>{o.customer?.name || "—"}</td>
                  <td style={{ fontSize: 11, color: "var(--muted)" }}>{o.items?.length || 0} items</td>
                  <td style={{ fontWeight: 700, color: "var(--acc)" }}>${o.total?.toFixed(2)}</td>
                  <td><span className={`badge ${ORDER_BADGE[o.status] || "bg-b"}`}>{o.status}</span></td>
                  <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-m)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="tda">
                      <select
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        disabled={updating === o.id}
                        style={{ width: 130, padding: "5px 8px", fontSize: 11 }}
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
    </div>
  );
};

export default Orders;
