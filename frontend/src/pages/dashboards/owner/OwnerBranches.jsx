import React, { useState } from 'react';
import { useFetch, api, toast, Modal, Confirm, Sk, Icon } from '../../../components/owner/OwnerShared';

const OwnerBranches = () => {
  const { data: branchData, loading, refetch } = useFetch("/branches?limit=50");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name: "", location: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({ name: "", location: "" }); setEditTarget(null); setShowModal(true); };
  const openEdit = b => { setForm({ name: b.name, location: b.location }); setEditTarget(b); setShowModal(true); };

  const submit = async () => {
    if (!form.name || !form.location) return toast("Name and location required", "error");
    setSaving(true);
    try {
      if (editTarget) {
        await api(`/branches/${editTarget.id}`, { method: "PUT", body: form });
        toast("Branch updated");
      } else {
        await api("/branches", { method: "POST", body: form });
        toast("Branch created");
      }
      setShowModal(false);
      refetch();
    } catch (e) { toast(e.message, "error"); }
    setSaving(false);
  };

  const remove = async (id) => {
    try {
      await api(`/branches/${id}`, { method: "DELETE" });
      toast("Branch deleted");
      refetch();
    } catch (e) { toast(e.message, "error"); }
    setConfirmId(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Network</div>
          <div className="page-title">BRANCHES</div>
          <div className="page-sub">Manage all global branch locations — {branchData?.meta?.total || 0} total</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" /> New Branch</button>
        </div>
      </div>

      {loading ? <div className="branch-grid">{[1,2,3,4].map(i=><div key={i} className="branch-card"><Sk h={24} mb={12}/><Sk h={14} w="60%" mb={20}/><Sk h={80}/></div>)}</div> : (
        <div className="branch-grid">
          {branchData?.data?.map(b => (
            <div key={b.id} className="branch-card">
              <div className="branch-card-accent" style={{ background: "var(--accent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,77,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                    <Icon name="branches" size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.location}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-icon" onClick={() => openEdit(b)}><Icon name="edit" size={15} /></button>
                  <button className="btn-icon danger" onClick={() => setConfirmId(b.id)}><Icon name="trash" size={15} /></button>
                </div>
              </div>
              <div className="branch-stats">
                <div className="branch-stat">
                  <div className="branch-stat-label">Staff</div>
                  <div className="branch-stat-val">{b._count?.users || 0}</div>
                </div>
                <div className="branch-stat">
                  <div className="branch-stat-label">Products</div>
                  <div className="branch-stat-val">{b._count?.products || 0}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Created {new Date(b.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? "EDIT BRANCH" : "NEW BRANCH"} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Branch"}</button>
          </>}
        >
          <div className="form-group"><label>Branch Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Downtown Main" /></div>
          <div className="form-group"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. 123 Main St, New York" /></div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Permanently delete this branch? This cannot be undone." onConfirm={() => remove(confirmId)} onCancel={() => setConfirmId(null)} />}
    </div>
  );
};

export default OwnerBranches;
