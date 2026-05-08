// frontend/src/pages/dashboards/branch/Services.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, apiFetch, toast, Icon, Modal, Confirm } from "../../../components/branch/BranchShared";

const Services = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;

  const { data: services, loading, refetch } = useFetch(`/services?branchId=${branchId}`, [branchId]);
  const { data: catData, refetch: refetchCats } = useFetch("/service-categories");

  const [activeTab, setActiveTab] = useState("services");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [saving, setSaving]         = useState(false);

  const [form, setForm] = useState({ 
    name: "", service_type: "maintenance", description: "", 
    base_price: "", duration_minutes: 30, is_active: true, serviceCategoryId: "",
    checklist: []
  });

  const [catForm, setCatForm] = useState({ name: "", description: "" });

  const initialForm = { 
    name: "", service_type: "maintenance", description: "", 
    base_price: "", duration_minutes: 30, is_active: true, serviceCategoryId: "",
    checklist: []
  };

  const openAdd  = () => { setForm(initialForm); setEditTarget(null); setShowModal(true); };
  const openEdit = s  => { 
    setForm({ 
      name: s.name, 
      service_type: s.service_type || "maintenance", 
      description: s.description || "", 
      base_price: s.base_price, 
      duration_minutes: s.duration_minutes || 30,
      is_active: s.is_active,
      serviceCategoryId: s.serviceCategoryId || "",
      checklist: Array.isArray(s.checklist) ? s.checklist : []
    }); 
    setEditTarget(s); 
    setShowModal(true); 
  };

  const submit = async () => {
    if (!form.name || !form.base_price) return toast("Name and price required", "e");
    setSaving(true);
    try {
      const { tempItem, ...cleanForm } = form;
      const body = { 
        ...cleanForm,
        base_price: parseFloat(form.base_price),
        duration_minutes: Number(form.duration_minutes),
        branchId: Number(branchId) 
      };
      if (editTarget) { await apiFetch(`/services/${editTarget.id}`, { method: "PUT", body }); toast("Service updated"); }
      else { await apiFetch("/services", { method: "POST", body }); toast("Service created"); }
      setShowModal(false); refetch();
    } catch (e) { toast(e.message, "e"); }
    setSaving(false);
  };

  const saveCat = async () => {
    if (!catForm.name) return toast("Category name required", "e");
    try {
      await apiFetch("/service-categories", { method: "POST", body: catForm });
      toast("Category created");
      setCatForm({ name: "", description: "" });
      refetchCats();
    } catch (e) { toast(e.message, "e"); }
  };

  const remove = async id => {
    try { await apiFetch(`/services/${id}`, { method: "DELETE" }); toast("Service deleted"); refetch(); }
    catch (e) { toast(e.message, "e"); }
    setConfirmId(null);
  };

  const removeCat = async id => {
    try { await apiFetch(`/service-categories/${id}`, { method: "DELETE" }); toast("Category deleted"); refetchCats(); }
    catch (e) { toast(e.message, "e"); }
  };

  const getSvcIcon = (type) => {
    if (type === "maintenance") return "wrench";
    if (type === "repair") return "settings";
    if (type === "installation") return "plus";
    return "wrench";
  };

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Service Lab</div>
          <div className="ptitle">SERVICE ARCHIVE</div>
          <div className="psub">Full control over protocols and category architecture</div>
        </div>
        <div className="ph-r" style={{ display: "flex", gap: 8 }}>
          <button className={`btn ${activeTab === "services" ? "btn-p" : "btn-s"}`} onClick={() => setActiveTab("services")}>
            <Icon n="inventory" /> Manage Protocols
          </button>
          <button className={`btn ${activeTab === "categories" ? "btn-p" : "btn-s"}`} onClick={() => setActiveTab("categories")}>
            <Icon n="settings" /> Manage Categories
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 30 }}>
        <div className={`tab ${activeTab === "services" ? "active" : ""}`} onClick={() => setActiveTab("services")}>
          <Icon n="wrench" size={14} /> Services List ({services?.length || 0})
        </div>
        <div className={`tab ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
          <Icon n="settings" size={14} /> Service Categories ({catData?.length || 0})
        </div>
      </div>

      {loading ? (
        <div className="g4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="sk" style={{ height: 200, borderRadius: 24 }} />)}
        </div>
      ) : (
        <div className="tab-content">
          {activeTab === "services" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Active Protocols</div>
                <button className="btn btn-p" onClick={openAdd}><Icon n="plus" /> New Protocol</button>
              </div>
              <div className="g4">
                {(Array.isArray(services) ? services : []).map(s => (
                  <div key={s.id} className="card ci" style={{ padding: 24, transition: "all .3s ease", border: "1px solid var(--border)", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "flex-start" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(14,165,233,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)" }}>
                        <Icon n={getSvcIcon(s.service_type)} size={22} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ico" onClick={() => openEdit(s)}><Icon n="edit" size={14} /></button>
                        <button className="btn-ico dng" onClick={() => setConfirmId(s.id)}><Icon n="trash" size={14} /></button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className={`badge badge-${s.service_type === "repair" ? "orange" : "blue"}`} style={{ fontSize: 9 }}>{s.service_type?.toUpperCase()}</span>
                        {s.serviceCategory && <span className="badge badge-s" style={{ fontSize: 9 }}>{s.serviceCategory.name}</span>}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{s.name}</div>
                    </div>
                    
                    <div style={{ fontFamily: "var(--font-d)", fontSize: 26, color: "var(--acc)", fontWeight: 700 }}>PKR {parseFloat(s.base_price).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>EST. TIME: {s.duration_minutes} MINS</div>
                  </div>
                ))}
                {(Array.isArray(services) ? services : []).length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}><Icon n="wrench" size={48} opacity={0.2} /><div className="empty-t">No service protocols defined yet</div></div>}
              </div>
            </>
          )}

          {activeTab === "categories" && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="ci" style={{ background: "var(--surf2)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Service Architecture</div>
              </div>
              <div className="ci" style={{ display: "flex", gap: 10, flexWrap: "wrap", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, display: "block" }}>CATEGORY NAME</label>
                  <input placeholder="e.g. Electrical Diagnostics" value={catForm.name} onChange={e => setCatForm(c => ({ ...c, name: e.target.value }))} />
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, display: "block" }}>DESCRIPTION</label>
                  <input placeholder="Short category description..." value={catForm.description} onChange={e => setCatForm(c => ({ ...c, description: e.target.value }))} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn btn-p" onClick={saveCat} style={{ height: 40 }}><Icon n="plus" /> Add Category</button>
                </div>
              </div>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Description</th>
                      <th>Services Linked</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catData?.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{c.description || "—"}</td>
                        <td><span className="badge badge-blue">{c._count?.services || 0} Protocols</span></td>
                        <td className="tda">
                          <button className="btn-ico dng" onClick={() => removeCat(c.id)}><Icon n="trash" size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? "EDIT PROTOCOL" : "NEW SERVICE PROTOCOL"} onClose={() => setShowModal(false)} wide
          footer={<>
            <button className="btn btn-s btn-sm" onClick={() => setShowModal(false)}>Discard</button>
            <button className="btn btn-p btn-sm" onClick={submit} disabled={saving}>{saving ? "Processing…" : "Save Protocol"}</button>
          </>}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label>Service Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Full Battery Diagnostics" />
            </div>
            
            <div className="fg">
              <label>Service Type</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="installation">Installation</option>
              </select>
            </div>

            <div className="fg">
              <label>Assigned Category</label>
              <select value={form.serviceCategoryId} onChange={e => setForm(f => ({ ...f, serviceCategoryId: e.target.value }))}>
                <option value="">— Uncategorized —</option>
                {catData?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="fg">
              <label>Estimated Duration (Minutes)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
            </div>

            <div className="fg">
              <label>Base Price (PKR) *</label>
              <input type="number" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} />
            </div>

            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label>Detailed Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ height: 100 }} />
            </div>

            {/* Checklist Section */}
            <div className="fg" style={{ gridColumn: "1/-1", borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <label style={{ color: "var(--acc)", fontWeight: 700 }}>SERVICE CHECKLIST / PROTOCOL ITEMS</label>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input 
                  placeholder="e.g. Engine Oil Flush..." 
                  value={form.tempItem || ""} 
                  onChange={e => setForm(f => ({ ...f, tempItem: e.target.value }))}
                  onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); setForm(f => { if(!f.tempItem) return f; const items = Array.isArray(f.checklist) ? f.checklist : []; return { ...f, checklist: [...items, f.tempItem], tempItem: "" }; }); }}}
                />
                <button className="btn btn-p" style={{ height: 44 }} onClick={(e) => { e.preventDefault(); setForm(f => { if(!f.tempItem) return f; const items = Array.isArray(f.checklist) ? f.checklist : []; return { ...f, checklist: [...items, f.tempItem], tempItem: "" }; }); }}>Add Item</button>
              </div>
              <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 6 }}>
                {(Array.isArray(form.checklist) ? form.checklist : []).map((item, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: "10px 15px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{idx + 1}. {item}</span>
                    <button className="btn-ico dng" onClick={() => setForm(f => ({ ...f, checklist: f.checklist.filter((_, i) => i !== idx) }))}><Icon n="trash" size={12} /></button>
                  </div>
                ))}
                {(!form.checklist || form.checklist.length === 0) && (
                  <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No specific items added to this protocol yet.</div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Remove this protocol permanently?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}
    </div>
  );
};

export default Services;
