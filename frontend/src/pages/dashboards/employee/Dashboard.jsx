// frontend/src/pages/dashboards/employee/Dashboard.jsx

import { useFetch, Icon, Sk, TblSk, ORDER_BADGE, APPT_BADGE } from "./EmployeeShared";
import { useAuth } from "../../../context/AuthContext";

export default function DashPage() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { data: pendingCount } = useFetch(`/orders/count?status=PENDING&branchId=${branchId}`, [branchId]);
  const { data: totalCount }   = useFetch(`/orders/count?branchId=${branchId}`, [branchId]);
  const { data: todayAppts }   = useFetch(`/appointments/today?branchId=${branchId}`, [branchId]);
  const { data: alerts }       = useFetch(`/inventory/alerts?branchId=${branchId}`, [branchId]);
  const { data: recent }       = useFetch(`/orders?limit=6&page=1&branchId=${branchId}`, [branchId]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Station Dashboard</div>
          <div className="ptitle">WORK STATION</div>
          <div className="psub">{today} · Logged in as {user?.name}</div>
        </div>
        <div className="live-chip" style={{ alignSelf: "center" }}>
          <span className="live-dot" /> On Duty
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-icon" style={{ background: "rgba(255,77,0,.12)", color: "var(--acc)" }}><Icon n="orders" s={18} /></div>
          <div className="kpi-label">Pending Orders</div>
          <div className="kpi-val">{pendingCount?.count ?? "—"}</div>
          <div className="kpi-note" style={{ color: "var(--yellow)" }}>Needs processing</div>
          <div className="kpi-glow" style={{ background: "var(--acc)" }} />
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{ background: "rgba(59,130,246,.12)", color: "var(--blue)" }}><Icon n="dollar" s={18} /></div>
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-val">{totalCount?.count ?? "—"}</div>
          <div className="kpi-note" style={{ color: "var(--blue)" }}>Branch total</div>
          <div className="kpi-glow" style={{ background: "var(--blue)" }} />
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{ background: "rgba(34,197,94,.12)", color: "var(--green)" }}><Icon n="appt" s={18} /></div>
          <div className="kpi-label">Today's Bookings</div>
          <div className="kpi-val">{Array.isArray(todayAppts) ? todayAppts.length : "—"}</div>
          <div className="kpi-note" style={{ color: "var(--green)" }}>Scheduled today</div>
          <div className="kpi-glow" style={{ background: "var(--green)" }} />
        </div>
        <div className="kpi">
          <div className="kpi-icon" style={{ background: "rgba(239,68,68,.12)", color: "var(--red)" }}><Icon n="alert" s={18} /></div>
          <div className="kpi-label">Stock Alerts</div>
          <div className="kpi-val">{Array.isArray(alerts) ? alerts.length : "—"}</div>
          <div className="kpi-note" style={{ color: alerts?.length > 0 ? "var(--red)" : "var(--green)" }}>
            {alerts?.length > 0 ? "Notify branch owner" : "All clear"}
          </div>
          <div className="kpi-glow" style={{ background: "var(--red)" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card ci">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Today's Appointments</div>
            <span className="badge b-o">{Array.isArray(todayAppts) ? todayAppts.length : 0} total</span>
          </div>
          {!todayAppts
            ? <><Sk h={40} r={8} /><div style={{ height: 8 }} /><Sk h={40} r={8} /><div style={{ height: 8 }} /><Sk h={40} r={8} /></>
            : Array.isArray(todayAppts) && todayAppts.length === 0
            ? <div className="empty"><Icon n="appt" s={32} /><div className="empty-t">No bookings today</div></div>
            : (todayAppts || []).slice(0, 5).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--bdr)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,77,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)", flexShrink: 0 }}>
                  <Icon n="wrench" s={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.service?.name || "Service"}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {a.customer?.name} · {new Date(a.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span className={`badge ${APPT_BADGE[a.status] || "b-b"}`}>{a.status}</span>
              </div>
            ))
          }
        </div>

        <div className="card ci">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Low Stock Alerts</div>
            {Array.isArray(alerts) && alerts.length > 0 && (
              <span className="badge b-r">{alerts.length} items</span>
            )}
          </div>
          {!alerts
            ? <><Sk h={40} r={8} /><div style={{ height: 8 }} /><Sk h={40} r={8} /></>
            : Array.isArray(alerts) && alerts.length === 0
            ? <div className="empty"><Icon n="check" s={32} /><div className="empty-t">All stock levels healthy</div><div className="empty-s">No alerts at this time</div></div>
            : (alerts || []).slice(0, 6).map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--bdr)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.stock === 0 ? "var(--red)" : "var(--yellow)", flexShrink: 0, boxShadow: `0 0 6px ${item.stock === 0 ? "var(--red)" : "var(--yellow)"}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.part?.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.part?.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-m)", fontWeight: 700, fontSize: 15, color: item.stock === 0 ? "var(--red)" : "var(--yellow)" }}>{item.stock}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>min {item.alertAt}</div>
                </div>
              </div>
            ))
          }
          <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(255,77,0,.06)", borderRadius: 8, border: "1px solid rgba(255,77,0,.12)", fontSize: 11, color: "var(--muted)" }}>
            ℹ️ Contact your Branch Owner to update stock levels
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "18px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Branch Orders</div>
          <span className="badge b-o">Live</span>
        </div>
        {!recent ? <TblSk rows={5} cols={5} /> : (
          <table>
            <thead><tr><th>Ref</th><th>Type</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recent?.data?.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700, color: "var(--acc)" }}>#{o.id}</span></td>
                  <td><span className={`badge ${o.type === "ONLINE" ? "b-b" : "b-p"}`}>{o.type}</span></td>
                  <td style={{ fontSize: 12 }}>{o.customer?.name || "—"}</td>
                  <td style={{ fontWeight: 700, color: "var(--acc)" }}>${o.total?.toFixed(2)}</td>
                  <td><span className={`badge ${ORDER_BADGE[o.status] || "b-b"}`}>{o.status}</span></td>
                  <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-m)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recent?.data?.length === 0 && (
                <tr><td colSpan={6}><div className="empty"><Icon n="orders" s={32} /><div className="empty-t">No orders yet</div></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
