// frontend/src/pages/dashboards/branch/Services.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, apiFetch, toast, Icon, Modal, Confirm } from "../../../components/branch/BranchShared";

const Services = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;

  const { data: bookings, loading, refetch } = useFetch(`/appointments?branchId=${branchId}&limit=100`, [branchId]);

  const [activeTab, setActiveTab] = useState("bookings");
  const [editAppt, setEditAppt] = useState(null);
  const [billAppt, setBillAppt] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [invoice, setInvoice]   = useState(null);

  const remove = async id => {
    try { await apiFetch(`/appointments/${id}`, { method: "DELETE" }); toast("Booking deleted"); refetch(); }
    catch (e) { toast(e.message, "e"); }
    setConfirmId(null);
  };

  const updateAppt = async () => {
    if (!editAppt) return;
    setSaving(true);
    try {
      await apiFetch(`/appointments/${editAppt.id}`, { method: "PUT", body: { status: editAppt.status } });
      toast("Status updated");
      setEditAppt(null); refetch();
    } catch (e) { toast(e.message, "e"); }
    setSaving(false);
  };

  // Handle both direct array or object-wrapped data
  const bookingList = Array.isArray(bookings) ? bookings : (bookings?.data || []);
  
  // Sort bookings oldest first
  const sortedBookings = [...bookingList].sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
  const APPT_STATUSES  = ["BOOKED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Service Lab</div>
          <div className="ptitle">BOOKED SERVICES</div>
          <div className="psub">Overview of customer service requests</div>
        </div>
      </div>

      {loading ? (
        <div className="g4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="sk" style={{ height: 200, borderRadius: 24 }} />)}
        </div>
      ) : (
        <div className="tab-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Active Requests</div>
          </div>
          <div className="g4">
            {sortedBookings.map(b => (
              <div key={b.id} className="card ci" style={{ padding: 24, transition: "all .3s ease", border: "1px solid var(--border)", position: "relative", background: "var(--card)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(14,165,233,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)" }}>
                    <Icon n="wrench" size={22} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ico" onClick={() => setEditAppt({ id: b.id, status: b.status })}><Icon n="edit" size={14} /></button>
                    <button className="btn-ico dng" onClick={() => setConfirmId(b.id)}><Icon n="trash" size={14} /></button>
                  </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-blue" style={{ fontSize: 9 }}>{new Date(b.booking_date).toLocaleDateString()}</span>
                    <span className="badge badge-orange" style={{ fontSize: 9 }}>{b.status?.toUpperCase()}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{b.customer?.name}</div>
                  <div style={{ fontSize: 13, color: "var(--acc)", fontWeight: 700, marginTop: 4 }}>{b.service?.name}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Phone / Cell</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {b.customer_notes?.split('|')[0]?.replace('Cell:', '')?.trim() || "N/A"}
                    </div>
                  </div>
                  {b.customer_notes?.includes('WhatsApp:') && (
                    <a 
                      href={`https://wa.me/${b.customer_notes.split('WhatsApp:')[1].trim().replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-ico"
                      style={{ background: '#25D366', color: 'white', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.2)' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.994 9.994 0 004.773 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.935 9.935 0 0012.012 2zM6.869 16.907l-.288-.454a8.255 8.255 0 01-1.265-4.467c0-4.547 3.702-8.249 8.253-8.249a8.196 8.196 0 015.835 2.419 8.196 8.196 0 012.422 5.835c0 4.547-3.702 8.249-8.253 8.249h-.003a8.223 8.223 0 01-4.215-1.164l-.304-.18-3.132.741.75-3.03z"/></svg>
                    </a>
                  )}
                </div>

                <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                  <button className="btn btn-s" style={{ flex: 1, justifyContent: 'center', height: 44 }} onClick={() => setEditAppt({ id: b.id, status: b.status })}>
                    <Icon n="edit" /> STATUS
                  </button>
                  <button className="btn btn-p" style={{ flex: 1, justifyContent: 'center', height: 44, background: '#111' }} onClick={() => setBillAppt({ ...b, labor: 0, parts: 0 })}>
                    <Icon n="reports" /> BILLING
                  </button>
                </div>
              </div>
            ))}
            {sortedBookings.length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}><Icon n="wrench" size={48} opacity={0.2} /><div className="empty-t">No service requests found</div></div>}
          </div>
        </div>
      )}
      {editAppt && (
        <Modal title="UPDATE STATUS" onClose={() => setEditAppt(null)}
          footer={<>
            <button className="btn btn-s btn-sm" onClick={() => setEditAppt(null)}>Cancel</button>
            <button className="btn btn-p btn-sm" onClick={updateAppt} disabled={saving}>{saving ? "Updating…" : "Save Changes"}</button>
          </>}
        >
          <div className="fg"><label>Service Status</label>
            <select value={editAppt.status} onChange={e => setEditAppt(v => ({ ...v, status: e.target.value }))}>
              {APPT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}
      {billAppt && (
        <Modal title="GENERATE SERVICE BILL" onClose={() => setBillAppt(null)}
          footer={<>
            <button className="btn btn-s btn-sm" onClick={() => setBillAppt(null)}>Cancel</button>
            <button className="btn btn-p btn-sm" style={{ background: '#111' }} onClick={async () => {
              setSaving(true);
              try {
                const total = (Number(billAppt.labor) || 0) + (Number(billAppt.parts) || 0);
                await apiFetch(`/appointments/${billAppt.id}`, { 
                  method: "PUT", 
                  body: { 
                    final_price: total,
                    status: "COMPLETED",
                    customer_notes: `${billAppt.customer_notes || ""} | Bill: Labor ${billAppt.labor}, Parts ${billAppt.parts}`
                  } 
                });
                toast("Bill generated & Status completed");
                setBillAppt(null); refetch();
              } catch (e) { toast(e.message, "e"); }
              setSaving(false);
            }} disabled={saving}>{saving ? "Generating…" : "Generate & Complete"}</button>
          </>}
        >
          <div style={{ marginBottom: 20, padding: 16, background: 'var(--surf2)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Customer</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{billAppt.customer?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--acc)', fontWeight: 600 }}>{billAppt.service?.name}</div>
          </div>
          
          <div className="fr" style={{ marginBottom: 16 }}>
            <div className="fg"><label>Labor Charges (PKR)</label>
              <input type="number" value={billAppt.labor} onChange={e => setBillAppt({...billAppt, labor: e.target.value})} placeholder="0" />
            </div>
            <div className="fg"><label>Parts Charges (PKR)</label>
              <input type="number" value={billAppt.parts} onChange={e => setBillAppt({...billAppt, parts: e.target.value})} placeholder="0" />
            </div>
          </div>

          <div style={{ padding: 20, background: '#111', borderRadius: 16, color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Total Payable Amount</div>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: 32, letterSpacing: 1 }}>
              PKR {((Number(billAppt.labor) || 0) + (Number(billAppt.parts) || 0)).toLocaleString()}
            </div>
          </div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Remove this booking record?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}
    </div>
  );
};

export default Services;
