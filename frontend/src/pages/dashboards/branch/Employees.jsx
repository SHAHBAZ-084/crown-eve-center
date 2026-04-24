// frontend/src/pages/dashboards/branch/Employees.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, apiFetch, toast, Icon, Modal, Confirm, TblSk, ROLE_BADGE } from "../../../components/branch/BranchShared";

const Employees = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;

  const { data: branchDetail, loading, refetch: refetchBranch } = useFetch(`/branches/${branchId}`, [branchId]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [form, setForm]             = useState({ name: "", email: "", password: "", role: "EMPLOYEE" });
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState("");

  const employees = (branchDetail?.users || []).filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ name: "", email: "", password: "", role: "EMPLOYEE" }); setEditTarget(null); setShowModal(true); };
  const openEdit = u  => { setForm({ name: u.name, email: u.email || "", password: "", role: u.role }); setEditTarget(u); setShowModal(true); };

  const submit = async () => {
    if (!form.name || !form.email) return toast("Name and email required", "e");
    if (!editTarget && !form.password) return toast("Password required", "e");
    setSaving(true);
    try {
      if (editTarget) {
        await apiFetch(`/users/${editTarget.id}`, { method: "PUT", body: { name: form.name, email: form.email, role: form.role, branchId: Number(branchId) } });
        toast("Employee updated");
      } else {
        await apiFetch("/users", { method: "POST", body: { name: form.name, email: form.email, password: form.password, role: form.role, branchId: Number(branchId) } });
        toast("Employee added");
      }
      setShowModal(false); refetchBranch();
    } catch (e) { toast(e.message, "e"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await apiFetch(`/users/${id}`, { method: "DELETE" }); toast("Employee removed"); refetchBranch(); }
    catch (e) { toast(e.message, "e"); }
    setConfirmId(null);
  };

  const ROLES = ["EMPLOYEE", "TECHNICIAN", "MANAGER"];

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Personnel</div>
          <div className="ptitle">LOCAL STAFF</div>
          <div className="psub">Branch employees and technicians · {(branchDetail?.users || []).length} total</div>
        </div>
        <div className="ph-r"><button className="btn btn-p" onClick={openAdd}><Icon n="plus" /> Onboard Staff</button></div>
      </div>

      <div className="fbar">
        <div className="sw"><Icon n="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or role…" /></div>
      </div>

      <div className="tw">
        {loading ? <TblSk rows={6} /> : (
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {employees.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `hsl(${u.id * 47 % 360},35%,20%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || "bg-b"}`}>{u.role.replace("_", " ")}</span></td>
                  <td>
                    <div className="tda">
                      <button className="btn-ico" onClick={() => openEdit(u)}><Icon n="edit" size={13} /></button>
                      <button className="btn-ico dng" onClick={() => setConfirmId(u.id)}><Icon n="trash" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && <tr><td colSpan={3}><div className="empty"><Icon n="employees" size={36} /><div className="empty-t">No staff found</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editTarget ? "EDIT EMPLOYEE" : "ONBOARD STAFF"} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-s btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-p btn-sm" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </>}
        >
          <div className="fr">
            <div className="fg"><label>Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="fg"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          {!editTarget && <div className="fg"><label>Password *</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>}
          <div className="fg"><label>Role *</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Remove this employee from the branch?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}
    </div>
  );
};

export default Employees;
