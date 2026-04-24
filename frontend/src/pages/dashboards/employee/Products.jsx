// frontend/src/pages/dashboards/employee/Products.jsx
import React, { useState } from "react";
import { useFetch, useDebounce, api, Icon, Modal, Confirm, toast } from "./EmployeeShared";

export default function ProductsPage({ branchId }) {
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const ds = useDebounce(search);
  const params = new URLSearchParams({ branchId, page, limit: 16 }).toString();
  const { data, loading, refetch } = useFetch(`/products?${params}`, [branchId, page]);
  const { data: partsData }        = useFetch("/parts?limit=200");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [form, setForm]             = useState({ name: "", price: "", parts: [] });
  const [saving, setSaving]         = useState(false);

  const filtered = (data?.data || []).filter(p => !ds || p.name?.toLowerCase().includes(ds.toLowerCase()));

  const openAdd  = () => { setForm({ name: "", price: "", parts: [] }); setEditTarget(null); setShowModal(true); };
  const openEdit = p  => { setForm({ name: p.name, price: p.price, parts: p.parts?.map(pp => ({ partId: pp.partId, quantity: pp.quantity })) || [] }); setEditTarget(p); setShowModal(true); };

  const addPart    = () => setForm(f => ({ ...f, parts: [...f.parts, { partId: "", quantity: 1 }] }));
  const remPart    = i  => setForm(f => ({ ...f, parts: f.parts.filter((_, j) => j !== i) }));
  const updPart    = (i, k, v) => setForm(f => ({ ...f, parts: f.parts.map((p, j) => j === i ? { ...p, [k]: v } : p) }));

  const submit = async () => {
    if (!form.name?.trim() || !form.price) return toast("Name and price are required", "err");
    setSaving(true);
    try {
      const body = {
        name: form.name,
        price: parseFloat(form.price),
        branchId: Number(branchId),
        parts: form.parts.filter(p => p.partId).map(p => ({ partId: Number(p.partId), quantity: Number(p.quantity) || 1 })),
      };
      if (editTarget) { await api(`/products/${editTarget.id}`, { method: "PUT", body }); toast("Product updated"); }
      else            { await api("/products", { method: "POST", body }); toast("Product created"); }
      setShowModal(false); refetch();
    } catch (e) { toast(e.message, "err"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await api(`/products/${id}`, { method: "DELETE" }); toast("Product deleted"); refetch(); }
    catch (e) { toast(e.message, "err"); }
    setConfirmId(null);
  };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Product Catalog</div>
          <div className="ptitle">PRODUCTS</div>
          <div className="psub">Maintenance kits & bundles · {data?.meta?.total || 0} listed</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-acc" onClick={openAdd}><Icon n="plus" /> New Product</button>
        </div>
      </div>
      <div className="fbar">
        <div className="sw"><Icon n="search" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" /></div>
      </div>
      {loading ? (
        <div className="prod-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk" style={{ height: 185, borderRadius: 20 }} />)}</div>
      ) : (
        <div className="prod-grid">
          {filtered.map(p => (
            <div key={p.id} className="prod-card">
              <div className="prod-stripe" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, paddingTop: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(255,77,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)" }}><Icon n="tag" s={17} /></div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="ico-btn" onClick={() => openEdit(p)}><Icon n="edit" s={13} /></button>
                  <button className="ico-btn del" onClick={() => setConfirmId(p.id)}><Icon n="trash" s={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 26, color: "var(--acc)", marginBottom: 10 }}>${parseFloat(p.price).toFixed(2)}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>{p.parts?.length || 0} components</div>
            </div>
          ))}
        </div>
      )}
      {(data?.meta?.totalPages || 1) > 1 && (
        <div className="pag" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", borderRadius: "var(--r3)", marginTop: 14 }}>
          <div className="pag-info">Page {page} · {data?.meta?.total || 0} total</div>
          <div className="pag-ctrl">
            <button className="pb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className="pb" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
      {showModal && (
        <Modal title={editTarget ? "EDIT PRODUCT" : "NEW PRODUCT"} onClose={() => setShowModal(false)} wide
          footer={<>
            <button className="btn btn-sec btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-acc btn-sm" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
          </>}
        >
          <div className="fr">
            <div className="fg"><label>Product Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Elite Road Bundle" /></div>
            <div className="fg">
              <label>Price (USD) *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 12 }}>$</span>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" style={{ paddingLeft: 22 }} />
              </div>
            </div>
          </div>
          {form.parts.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select value={p.partId} onChange={e => updPart(i, "partId", e.target.value)}>
                <option value="">— Select Part —</option>
                {(partsData?.data || []).map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
              <input type="number" min="1" value={p.quantity} onChange={e => updPart(i, "quantity", e.target.value)} placeholder="Qty" />
              <button className="ico-btn del" onClick={() => remPart(i)}><Icon n="trash" s={13} /></button>
            </div>
          ))}
          <button className="btn btn-sec btn-sm" onClick={addPart}><Icon n="plus" /> Add Part</button>
        </Modal>
      )}
      {confirmId && <Confirm msg="Delete this product?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}
    </div>
  );
}
