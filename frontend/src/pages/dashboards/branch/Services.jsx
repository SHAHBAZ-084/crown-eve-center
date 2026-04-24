// frontend/src/pages/dashboards/branch/Services.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, apiFetch, toast, Icon, Modal, Confirm } from "../../../components/branch/BranchShared";

const Services = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;

  const { data: services, loading, refetch } = useFetch(`/services?branchId=${branchId}`, [branchId]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [form, setForm]             = useState({ name: "", description: "", price: "", branchId: "" });
  const [saving, setSaving]         = useState(false);

  const openAdd  = () => { setForm({ name: "", description: "", price: "", branchId }); setEditTarget(null); setShowModal(true); };
  const openEdit = s  => { setForm({ name: s.name, description: s.description || "", price: s.price, branchId }); setEditTarget(s); setShowModal(true); };

  const submit = async () => {
    if (!form.name || !form.price) return toast("Name and price required", "e");
    setSaving(true);
    try {
      const body = { name: form.name, description: form.description, price: parseFloat(form.price), branchId: Number(branchId) };
      if (editTarget) { await apiFetch(`/services/${editTarget.id}`, { method: "PUT", body }); toast("Service updated"); }
      else { await apiFetch("/services", { method: "POST", body }); toast("Service created"); }
      setShowModal(false); refetch();
    } catch (e) { toast(e.message, "e"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await apiFetch(`/services/${id}`, { method: "DELETE" }); toast("Service deleted"); refetch(); }
    catch (e) { toast(e.message, "e"); }
    setConfirmId(null);
  };

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Service Bay</div>
          <div className="ptitle">SERVICE PROTOCOLS</div>
          <div className="psub">Maintenance packages offered at this branch</div>
        </div>
        <div className="ph-r"><button className="btn btn-p" onClick={openAdd}><Icon n="plus" /> New Service</button></div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="sk" style={{ height: 160, borderRadius: 20 }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {(Array.isArray(services) ? services : []).map(s => (
            <div key={s.id} className="card ci" style={{ padding: 22, transition: "all .2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(14,165,233,.1)", display: "flex", alignItems: "center", justifyCenter: "center", color: "var(--acc)" }}>
                  <Icon n="wrench" size={18} />
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn-ico" onClick={() => openEdit(s)}><Icon n="edit" size={13} /></button>
                  <button className="btn-ico dng" onClick={() => setConfirmId(s.id)}><Icon n="trash" size={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{s.name}</div>
              {s.description && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>{s.description}</div>}
              <div style={{ fontFamily: "var(--font-d)", fontSize: 28, color: "var(--green)" }}>${parseFloat(s.price).toFixed(2)}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".15em", marginTop: 6 }}>Standard turnaround: 24h</div>
            </div>
          ))}
          {(Array.isArray(services) ? services : []).length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}><Icon n="wrench" size={36} /><div className="empty-t">No services defined</div></div>}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? "EDIT SERVICE" : "NEW SERVICE"} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-s btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-p btn-sm" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Service"}</button>
          </>}
        >
          <div className="fg"><label>Service Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Full Service Tune-Up" /></div>
          <div className="fg"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this service include?" /></div>
          <div className="fg"><label>Price (USD) *</label><input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Remove this service protocol?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}
    </div>
  );
};

export default Services;
