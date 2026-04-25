// frontend/src/pages/dashboards/branch/Products.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, apiFetch, toast, Icon, Modal, Confirm } from "../../../components/branch/BranchShared";

const Products = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;

  const params = `branchId=${branchId}&limit=20&page=1`;
  const { data, loading, refetch } = useFetch(`/products?${params}`, [branchId]);
  const { data: partsData } = useFetch("/parts?limit=200");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [form, setForm]             = useState({ name: "", price: "", parts: [] });
  const [saving, setSaving]         = useState(false);

  const openAdd  = () => { setForm({ name: "", price: "", parts: [] }); setEditTarget(null); setShowModal(true); };
  const openEdit = p  => { setForm({ name: p.name, price: p.price, parts: p.parts?.map(pp => ({ partId: pp.partId, quantity: pp.quantity })) || [] }); setEditTarget(p); setShowModal(true); };

  const addPart = () => setForm(f => ({ ...f, parts: [...f.parts, { partId: "", quantity: 1 }] }));
  const removePart = i => setForm(f => ({ ...f, parts: f.parts.filter((_, j) => j !== i) }));
  const updatePart = (i, key, val) => setForm(f => ({ ...f, parts: f.parts.map((p, j) => j === i ? { ...p, [key]: val } : p) }));

  const submit = async () => {
    if (!form.name || !form.price) return toast("Name and price required", "e");
    setSaving(true);
    try {
      const body = { name: form.name, price: parseFloat(form.price), branchId: Number(branchId), parts: form.parts.filter(p => p.partId).map(p => ({ partId: Number(p.partId), quantity: Number(p.quantity) || 1 }) ) };
      if (editTarget) { await apiFetch(`/products/${editTarget.id}`, { method: "PUT", body }); toast("Product updated"); }
      else { await apiFetch("/products", { method: "POST", body }); toast("Product created"); }
      setShowModal(false); refetch();
    } catch (e) { toast(e.message, "e"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await apiFetch(`/products/${id}`, { method: "DELETE" }); toast("Product deleted"); refetch(); }
    catch (e) { toast(e.message, "e"); }
    setConfirmId(null);
  };

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Catalog</div>
          <div className="ptitle">MAINTENANCE KITS</div>
          <div className="psub">Branch products & spare bundles · {data?.meta?.total || 0} listed</div>
        </div>
        <div className="ph-r"><button className="btn btn-p" onClick={openAdd}><Icon n="plus" /> New Product</button></div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="sk" style={{ height: 200, borderRadius: 20 }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {(data?.data || []).map(p => (
            <div key={p.id} className="card ci" style={{ transition: "all .2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(14,165,233,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)" }}>
                  <Icon n="tag" size={18} />
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn-ico" onClick={() => openEdit(p)}><Icon n="edit" size={13} /></button>
                  <button className="btn-ico dng" onClick={() => setConfirmId(p.id)}><Icon n="trash" size={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 24, color: "var(--acc)", marginBottom: 8 }}>PKR {parseFloat(p.price).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>{p.parts?.length || 0} component parts</div>
            </div>
          ))}
          {(data?.data || []).length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}><Icon n="products" size={36} /><div className="empty-t">No products yet</div><div className="empty-s">Create your first maintenance kit</div></div>}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? "EDIT PRODUCT" : "NEW PRODUCT"} onClose={() => setShowModal(false)} wide
          footer={<>
            <button className="btn btn-s btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-p btn-sm" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
          </>}
        >
          <div className="fr">
            <div className="fg"><label>Product Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Elite Road Bundle" /></div>
            <div className="fg"><label>Price (USD) *</label><input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></div>
          </div>
          <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>Component Parts</div>
          {form.parts.map((p, i) => (
            <div key={i} className="fr" style={{ marginBottom: 8, alignItems: "center" }}>
              <select value={p.partId} onChange={e => updatePart(i, "partId", e.target.value)}>
                <option value="">— Select Part —</option>
                {partsData?.data?.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="number" min="1" value={p.quantity} onChange={e => updatePart(i, "quantity", e.target.value)} placeholder="Qty" style={{ width: 70 }} />
                <button className="btn-ico dng" onClick={() => removePart(i)}><Icon n="trash" size={13} /></button>
              </div>
            </div>
          ))}
          <button className="btn btn-s btn-sm" style={{ marginTop: 6 }} onClick={addPart}><Icon n="plus" /> Add Part</button>
        </Modal>
      )}
      {confirmId && <Confirm msg="Delete this product?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}
    </div>
  );
};

export default Products;
