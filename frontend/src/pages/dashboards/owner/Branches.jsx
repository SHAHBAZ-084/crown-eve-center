// frontend/src/pages/dashboards/owner/Branches.jsx
import React, { useState } from "react";
import { useFetch, api, toast, Icon, Sk, Modal, Confirm } from "../../../components/owner/OwnerShared";

/**
 * Branches Management Page
 * Allows Company Owner to manage global branch network.
 */
const BranchesPage = () => {
  // Fetch branches with a high limit to show all
  const { data: branchData, loading, refetch } = useFetch("/branches?limit=100");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name: "", location: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { 
    setForm({ name: "", location: "" }); 
    setEditTarget(null); 
    setShowModal(true); 
  };

  const openEdit = (b) => { 
    setForm({ name: b.name, location: b.location }); 
    setEditTarget(b); 
    setShowModal(true); 
  };

  const submit = async () => {
    if (!form.name || !form.location) return toast("Branch name and location are required", "error");
    setSaving(true);
    try {
      if (editTarget) {
        await api(`/branches/${editTarget.id}`, { method: "PUT", body: form });
        toast("Branch details updated successfully");
      } else {
        await api("/branches", { method: "POST", body: form });
        toast("New branch established in the network");
      }
      setShowModal(false);
      refetch();
    } catch (e) { 
      toast(e.message, "error"); 
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/branches/${id}`, { method: "DELETE" });
      toast("Branch decommissioned from network");
      refetch();
    } catch (e) { 
      toast(e.message, "error"); 
    }
    setConfirmId(null);
  };

  const branches = branchData?.data || [];

  return (
    <div className="page" id="branches-management-view">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Network Architecture</div>
          <div className="page-title">BRANCH NODES</div>
          <div className="page-sub">Global distribution and facility management — {branches.length} active nodes</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <Icon name="plus" /> New Branch
          </button>
        </div>
      </div>

      {loading ? (
        <div className="branch-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="branch-card skeleton-card">
              <Sk h={180} r={24} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {branches.length === 0 ? (
            <div className="empty-state-container">
              <div className="empty">
                <div className="empty-icon-wrap">
                  <Icon name="branches" size={48} />
                </div>
                <div className="empty-title">No Branch Nodes Found</div>
                <div className="empty-sub">Initialize your global network by adding your first branch location.</div>
                <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={openAdd}>
                  <Icon name="plus" /> Initialize First Branch
                </button>
              </div>
            </div>
          ) : (
            <div className="branch-grid">
              {branches.map(b => (
                <div key={b.id} className="branch-card premium-card">
                  <div className="branch-card-accent" style={{ background: "var(--accent)" }} />
                  
                  <div className="branch-card-header">
                    <div className="branch-icon-box">
                      <Icon name="branches" size={24} />
                    </div>
                    <div className="branch-main-info">
                      <h3 className="branch-name">{b.name}</h3>
                      <p className="branch-location">
                        <Icon name="search" size={12} /> {b.location}
                      </p>
                    </div>
                    <div className="branch-card-actions">
                      <button className="btn-icon" onClick={() => openEdit(b)} title="Edit Configuration">
                        <Icon name="edit" size={14} />
                      </button>
                      <button className="btn-icon danger" onClick={() => setConfirmId(b.id)} title="Decommission Branch">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="branch-metrics">
                    <div className="metric-box">
                      <span className="metric-label">Personnel</span>
                      <span className="metric-value">{b._count?.users || 0}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Assets</span>
                      <span className="metric-value">{b._count?.products || 0}</span>
                    </div>
                  </div>

                  <div className="branch-card-footer">
                    <span className="node-id">NODE_ID: #{b.id.toString().padStart(3, '0')}</span>
                    <span className="timestamp">Active since {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal 
          title={editTarget ? "CONFIGURE BRANCH" : "INITIALIZE BRANCH"} 
          onClose={() => !saving && setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? "Processing..." : (editTarget ? "Update Node" : "Initialize Node")}
            </button>
          </>}
        >
          <div className="premium-form">
            <div className="form-group">
              <label>Identifying Name</label>
              <input 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                placeholder="e.g. Manhattan Central" 
                autoFocus
              />
              <small>Choose a unique identifier for this facility.</small>
            </div>
            <div className="form-group">
              <label>Geographic Location</label>
              <input 
                value={form.location} 
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))} 
                placeholder="City, Region or Full Address" 
              />
              <small>The physical operational address of this node.</small>
            </div>
          </div>
        </Modal>
      )}

      {confirmId && (
        <Confirm 
          msg="Are you certain you want to decommission this branch node? This will impact all associated personnel and inventory records." 
          onConfirm={() => remove(confirmId)} 
          onCancel={() => setConfirmId(null)} 
        />
      )}
    </div>
  );
};

export default BranchesPage;
