// frontend/src/pages/dashboards/employee/Appointments.jsx
import { useState } from "react";
import { useFetch, api, Icon, TblSk, Modal, toast, APPT_BADGE } from "./EmployeeShared";

export default function AppointmentsPage({ branchId }) {
  const [tab, setTab]       = useState("today");
  const [page, setPage]     = useState(1);
  const [statusF, setStatusF] = useState("");

  const { data: todayData, loading: tl, refetch: refetchToday } =
    useFetch(`/appointments/today?branchId=${branchId}`, [branchId]);

  const allParams = new URLSearchParams({ branchId, page, limit: 12, ...(statusF && { status: statusF }) }).toString();
  const { data: allData, loading: al, refetch: refetchAll } =
    useFetch(`/appointments?${allParams}`, [page, statusF, branchId]);

  const [editAppt, setEditAppt] = useState(null);
  const [saving, setSaving]     = useState(false);
  const { data: branchDetail }  = useFetch(`/branches/${branchId}`, [branchId]);
  const techs = (branchDetail?.users || []).filter(u => u.role === "TECHNICIAN");

  const APPT_STATUSES = ["BOOKED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  const saveAppt = async () => {
    setSaving(true);
    try {
      await api(`/appointments/${editAppt.id}`, {
        method: "PUT",
        body: { status: editAppt.status, ...(editAppt.techId && { techId: Number(editAppt.techId) }) },
      });
      toast("Appointment updated");
      setEditAppt(null);
      refetchToday(); refetchAll();
    } catch (e) { toast(e.message, "err"); }
    setSaving(false);
  };

  const ApptRow = ({ a }) => (
    <tr>
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{a.service?.name}</div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.customer?.name}</div>
      </td>
      <td>
        <div style={{ fontSize: 12, fontFamily: "var(--font-m)" }}>{new Date(a.scheduledAt).toLocaleDateString()}</div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(a.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </td>
      <td style={{ fontSize: 12, color: a.technician ? "var(--text)" : "var(--muted)" }}>
        {a.technician?.name || "Unassigned"}
      </td>
      <td><span className={`badge ${APPT_BADGE[a.status] || "b-b"}`}>{a.status}</span></td>
      <td>
        <div className="td-act">
          <button className="ico-btn save" onClick={() => setEditAppt({ id: a.id, status: a.status, techId: a.techId || "" })}>
            <Icon n="edit" s={13} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Service Bay</div>
          <div className="ptitle">APPOINTMENTS</div>
          <div className="psub">View and manage branch bookings</div>
        </div>
        <div className="ph-r">
          <div className="tabs">
            <div className={`tab ${tab === "today" ? "on" : ""}`} onClick={() => setTab("today")}>Today</div>
            <div className={`tab ${tab === "all" ? "on" : ""}`} onClick={() => setTab("all")}>All</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", background: "rgba(255,77,0,.07)", border: "1px solid rgba(255,77,0,.15)", borderRadius: 10, marginBottom: 18, fontSize: 12, color: "var(--muted)" }}>
        <Icon n="alert" s={14} /> <span>Appointments are booked by customers. You can update status and assign technicians.</span>
      </div>
      {tab === "today" ? (
        <div className="tw">
          {tl ? <TblSk rows={6} cols={4} /> : (
            <table>
              <thead><tr><th>Service / Customer</th><th>Time</th><th>Technician</th><th>Status</th><th style={{ textAlign: "right" }}>Manage</th></tr></thead>
              <tbody>
                {(Array.isArray(todayData) ? todayData : []).map(a => <ApptRow key={a.id} a={a} />)}
                {(Array.isArray(todayData) ? todayData : []).length === 0 && (
                  <tr><td colSpan={5}><div className="empty"><Icon n="appt" s={34} /><div className="empty-t">No appointments today</div></div></td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <>
          <div className="fbar">
            <div className="tabs" style={{ marginBottom: 0 }}>
              {["", ...APPT_STATUSES].map(s => (
                <div key={s} className={`tab ${statusF === s ? "on" : ""}`}
                  onClick={() => { setStatusF(s); setPage(1); }}>
                  {s || "All"}
                </div>
              ))}
            </div>
          </div>
          <div className="tw">
            {al ? <TblSk rows={8} cols={4} /> : (
              <table>
                <thead><tr><th>Service / Customer</th><th>Scheduled</th><th>Technician</th><th>Status</th><th style={{ textAlign: "right" }}>Manage</th></tr></thead>
                <tbody>
                  {allData?.data?.map(a => <ApptRow key={a.id} a={a} />)}
                  {allData?.data?.length === 0 && (
                    <tr><td colSpan={5}><div className="empty"><Icon n="appt" s={34} /><div className="empty-t">No appointments found</div></div></td></tr>
                  )}
                </tbody>
              </table>
            )}
            <div className="pag">
              <div className="pag-info">Showing {allData?.data?.length || 0} of {allData?.meta?.total || 0}</div>
              <div className="pag-ctrl">
                <button className="pb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="pb" disabled={page >= (allData?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}
      {editAppt && (
        <Modal title="UPDATE APPOINTMENT" onClose={() => setEditAppt(null)}
          footer={<>
            <button className="btn btn-sec btn-sm" onClick={() => setEditAppt(null)}>Cancel</button>
            <button className="btn btn-acc btn-sm" onClick={saveAppt} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
          </>}
        >
          <div className="fg">
            <label>Status</label>
            <select value={editAppt.status} onChange={e => setEditAppt(v => ({ ...v, status: e.target.value }))}>
              {APPT_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Assign Technician</label>
            <select value={editAppt.techId} onChange={e => setEditAppt(v => ({ ...v, techId: e.target.value }))}>
              <option value="">— Unassigned —</option>
              {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
