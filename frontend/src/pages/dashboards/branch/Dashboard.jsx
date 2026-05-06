// frontend/src/pages/dashboards/branch/Dashboard.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, Icon, Sk, TblSk, ORDER_BADGE, APPT_BADGE } from "../../../components/branch/BranchShared";

const Dashboard = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;
  const branchName = user?.branchName;

  const { data: revSummary } = useFetch(`/reports/revenue/summary?branchId=${branchId}`, [branchId], 5000);
  const { data: pendingOrders } = useFetch(`/orders/count?branchId=${branchId}&status=PENDING`, [branchId], 5000);
  const { data: todayAppts } = useFetch(`/appointments/today?branchId=${branchId}`, [branchId], 5000);
  const { data: stockAlerts } = useFetch(`/inventory/alerts?branchId=${branchId}`, [branchId], 5000);
  const { data: recentOrders } = useFetch(`/orders?branchId=${branchId}&limit=5&page=1`, [branchId], 5000);
  const { data: chartData } = useFetch(`/reports/revenue/chart?branchId=${branchId}&period=7d`, [branchId], 5000);

  const maxChart = chartData ? Math.max(...chartData.map(d => d.revenue || d._sum?.total || 0), 1) : 1;

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Branch Terminal</div>
          <div className="ptitle">{branchName || "LOCAL"} STATION</div>
          <div className="psub">Daily operations and branch monitoring</div>
        </div>
        <div className="live-pill"><span className="live-dot" />Station Active</div>
      </div>

      {/* KPI Cards */}
      <div className="sg">
        <div className="sc">
          <div className="sc-icon" style={{ background: "rgba(14,165,233,.12)", color: "var(--acc)" }}><Icon n="dollar" size={18} /></div>
          <div className="sc-label">Branch Revenue</div>
          <div className="sc-val">PKR {((revSummary?.totalRevenue || 0) / 1000).toFixed(1)}K</div>
          <div className="sc-trend t-up">↑ All time</div>
          <div className="sc-glow" style={{ background: "var(--acc)" }} />
        </div>
        <div className="sc">
          <div className="sc-icon" style={{ background: "rgba(234,179,8,.12)", color: "var(--yellow)" }}><Icon n="clock" size={18} /></div>
          <div className="sc-label">Pending Orders</div>
          <div className="sc-val">{pendingOrders?.count ?? "—"}</div>
          <div className="sc-trend" style={{ color: "var(--yellow)" }}>Needs attention</div>
        </div>
        <div className="sc">
          <div className="sc-icon" style={{ background: "rgba(34,197,94,.12)", color: "var(--green)" }}><Icon n="appointments" size={18} /></div>
          <div className="sc-label">Today's Bookings</div>
          <div className="sc-val">{Array.isArray(todayAppts) ? todayAppts.length : "—"}</div>
          <div className="sc-trend t-up">Scheduled today</div>
        </div>
        <div className="sc">
          <div className="sc-icon" style={{ background: "rgba(239,68,68,.12)", color: "var(--red)" }}><Icon n="alert" size={18} /></div>
          <div className="sc-label">Low Stock Alerts</div>
          <div className="sc-val">{Array.isArray(stockAlerts) ? stockAlerts.length : "—"}</div>
          <div className="sc-trend t-dn">{Array.isArray(stockAlerts) && stockAlerts.length > 0 ? "Action required" : "Stock healthy"}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Revenue chart */}
        <div className="card ci">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <span>Revenue — Last 7 Days</span>
          </div>
          {!chartData ? <Sk h={140} r={8} /> : (
            <div className="bar-wrap">
              {chartData.map((d, i) => {
                const val = d.revenue || d._sum?.total || 0;
                const pct = (val / maxChart) * 100;
                return (
                  <div key={i} className="bar-col">
                    <div className="bar-vl">PKR {(val / 1000).toFixed(1)}K</div>
                    <div className="bar-fill" style={{ height: `${Math.max(pct, 2)}%` }} />
                    <div className="bar-lb">{d.date ? new Date(d.date).toLocaleDateString("en", { weekday: "short" }) : `D${i + 1}`}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's appointments */}
        <div className="card ci">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Today's Appointments</div>
          {!todayAppts ? <TblSk rows={3} /> : Array.isArray(todayAppts) && todayAppts.length === 0
            ? <div className="empty"><Icon n="appointments" size={32} /><div className="empty-t">No bookings today</div></div>
            : (todayAppts || []).slice(0, 5).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(14,165,233,.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)", flexShrink: 0 }}>
                  <Icon n="wrench" size={14} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.service?.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.customer?.name} · {new Date(a.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <span className={`badge ${APPT_BADGE[a.status] || "bg-b"}`}>{a.status}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent orders + Stock alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div style={{ padding: "18px 18px 0", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Recent Orders</div>
          {!recentOrders ? <TblSk rows={4} /> : (
            <table>
              <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders?.data?.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td><span style={{ fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700 }}>#{o.id}</span></td>
                    <td style={{ fontSize: 12 }}>{o.customer?.name || "—"}</td>
                    <td style={{ fontWeight: 700, color: "var(--acc)" }}>PKR {o.total?.toFixed(2)}</td>
                    <td><span className={`badge ${ORDER_BADGE[o.status] || "bg-b"}`}>{o.status}</span></td>
                  </tr>
                ))}
                {recentOrders?.data?.length === 0 && <tr><td colSpan={4}><div className="empty"><Icon n="orders" /><div className="empty-t">No orders</div></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>

        <div className="card ci">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Low Stock Alerts</div>
          {!stockAlerts ? <TblSk rows={3} /> : Array.isArray(stockAlerts) && stockAlerts.length === 0
            ? <div className="empty"><Icon n="check" size={32} /><div className="empty-t">All stock healthy</div></div>
            : (stockAlerts || []).slice(0, 6).map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.stock === 0 ? "var(--red)" : "var(--yellow)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.part?.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.part?.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-m)", fontSize: 14, fontWeight: 700, color: item.stock === 0 ? "var(--red)" : "var(--yellow)" }}>{item.stock}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>alert ≤{item.alertAt}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
