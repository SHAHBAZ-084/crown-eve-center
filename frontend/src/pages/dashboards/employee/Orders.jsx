// frontend/src/pages/dashboards/employee/Orders.jsx
import { useState } from "react";
import { useFetch, api, Icon, TblSk, toast, ORDER_BADGE } from "./EmployeeShared";

export default function OrdersPage({ branchId }) {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("");
  const [tab, setTab]       = useState("list");
  const params = new URLSearchParams({ page, limit: 12, ...(status && { status }) }).toString();
  const { data, loading, refetch } = useFetch(`/orders?${params}`, [page, status]);

  const { data: prods } = useFetch(`/products?branchId=${branchId}&limit=100`);
  const [orderForm, setOrderForm] = useState({ type: "POS", items: [{ productId: "", quantity: 1, price: "" }] });
  const [creating, setCreating]   = useState(false);
  const [updatingId, setUpdId]    = useState(null);

  const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

  const addItem = () => setOrderForm(f => ({ ...f, items: [...f.items, { productId: "", quantity: 1, price: "" }] }));
  const removeItem = i => setOrderForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }));
  const updateItem = (i, k, v) => setOrderForm(f => ({ ...f, items: f.items.map((it, j) => j === i ? { ...it, [k]: v } : it) }));

  const pickProduct = (i, prodId) => {
    const prod = prods?.data?.find(p => String(p.id) === String(prodId));
    updateItem(i, "productId", prodId);
    if (prod) updateItem(i, "price", prod.price);
  };

  const calcTotal = () => orderForm.items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1), 0);

  const submitOrder = async () => {
    const items = orderForm.items.filter(i => i.productId && i.price);
    if (!items.length) return toast("Add at least one item with a product and price", "err");
    setCreating(true);
    try {
      await api("/orders", {
        method: "POST",
        body: {
          branchId: Number(branchId),
          type: orderForm.type,
          items: items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) || 1, price: parseFloat(i.price) })),
          total: calcTotal(),
        },
      });
      toast("Order created successfully");
      setOrderForm({ type: "POS", items: [{ productId: "", quantity: 1, price: "" }] });
      setTab("list"); refetch();
    } catch (e) { toast(e.message, "err"); }
    setCreating(false);
  };

  const updateStatus = async (id, newStatus) => {
    setUpdId(id);
    try {
      await api(`/orders/${id}/status`, { method: "PUT", body: { status: newStatus } });
      toast("Status updated");
      refetch();
    } catch (e) { toast(e.message, "err"); }
    setUpdId(null);
  };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Operations</div>
          <div className="ptitle">ORDER QUEUE</div>
          <div className="psub">Branch transactions · {data?.meta?.total || 0} total</div>
        </div>
        <div className="ph-r">
          <div className="tabs">
            <div className={`tab ${tab === "list" ? "on" : ""}`} onClick={() => setTab("list")}>All Orders</div>
            <div className={`tab ${tab === "create" ? "on" : ""}`} onClick={() => setTab("create")}>+ New Order</div>
          </div>
        </div>
      </div>

      {tab === "create" ? (
        <div className="card ci" style={{ maxWidth: 700 }}>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 22, letterSpacing: ".04em", marginBottom: 20 }}>CREATE NEW ORDER</div>
          <div className="fg">
            <label>Order Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["POS", "ONLINE"].map(t => (
                <button key={t} className={`btn btn-sm ${orderForm.type === t ? "btn-acc" : "btn-sec"}`}
                  onClick={() => setOrderForm(f => ({ ...f, type: t }))}>
                  {t === "POS" ? "POS / In-Store" : "Online"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>
            Line Items
          </div>
          {orderForm.items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select value={item.productId} onChange={e => pickProduct(i, e.target.value)}>
                <option value="">— Select Product —</option>
                {(prods?.data || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min="1" value={item.quantity}
                onChange={e => updateItem(i, "quantity", e.target.value)} placeholder="Qty" />
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 12 }}>$</span>
                <input type="number" min="0" step="0.01" value={item.price}
                  onChange={e => updateItem(i, "price", e.target.value)} placeholder="0.00"
                  style={{ paddingLeft: 22 }} />
              </div>
              <button className="ico-btn del" onClick={() => removeItem(i)} disabled={orderForm.items.length === 1}>
                <Icon n="trash" s={13} />
              </button>
            </div>
          ))}
          <button className="btn btn-sec btn-sm" style={{ marginBottom: 16 }} onClick={addItem}>
            <Icon n="plus" /> Add Item
          </button>
          {orderForm.items.some(i => i.price && i.quantity) && (
            <div style={{ padding: "12px 16px", background: "rgba(255,77,0,.08)", border: "1px solid rgba(255,77,0,.18)", borderRadius: 10, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Order Total</span>
              <span style={{ fontFamily: "var(--font-d)", fontSize: 26, color: "var(--acc)" }}>${calcTotal().toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sec" onClick={() => setTab("list")}>Cancel</button>
            <button className="btn btn-acc" onClick={submitOrder} disabled={creating}>
              {creating ? "Creating…" : "Create Order"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="fbar">
            <div className="tabs" style={{ marginBottom: 0 }}>
              {["", ...STATUSES].map(s => (
                <div key={s} className={`tab ${status === s ? "on" : ""}`}
                  onClick={() => { setStatus(s); setPage(1); }}>
                  {s || "All"}
                </div>
              ))}
            </div>
          </div>
          <div className="tw">
            {loading ? <TblSk rows={8} cols={6} /> : (
              <table>
                <thead>
                  <tr><th>Ref</th><th>Type</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th style={{ textAlign: "right" }}>Action</th></tr>
                </thead>
                <tbody>
                  {data?.data?.map(o => (
                    <tr key={o.id}>
                      <td><span style={{ fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700, color: "var(--acc)" }}>#{o.id}</span></td>
                      <td><span className={`badge ${o.type === "ONLINE" ? "b-b" : "b-p"}`}>{o.type}</span></td>
                      <td style={{ fontSize: 12 }}>{o.customer?.name || "—"}</td>
                      <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-m)" }}>{o.items?.length || 0}</td>
                      <td style={{ fontWeight: 700, color: "var(--acc)" }}>${o.total?.toFixed(2)}</td>
                      <td><span className={`badge ${ORDER_BADGE[o.status] || "b-b"}`}>{o.status}</span></td>
                      <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-m)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="td-act">
                          <select
                            value={o.status}
                            onChange={e => updateStatus(o.id, e.target.value)}
                            disabled={updatingId === o.id}
                            style={{ width: 130, padding: "5px 8px", fontSize: 11 }}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data?.length === 0 && (
                    <tr><td colSpan={8}><div className="empty"><Icon n="orders" s={34} /><div className="empty-t">No orders found</div></div></td></tr>
                  )}
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
        </>
      )}
    </div>
  );
}
