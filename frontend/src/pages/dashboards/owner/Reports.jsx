// frontend/src/pages/dashboards/owner/Reports.jsx
import React, { useState } from "react";
import { useFetch, Icon, Sk, TableSk } from "../../../components/owner/OwnerShared";

const ReportsPage = () => {
  const [period, setPeriod] = useState("7d");
  const [branchId, setBranchId] = useState("");
  const { data: summary, loading: sl } = useFetch(`/reports/revenue/summary${branchId ? `?branchId=${branchId}` : ""}`, [branchId]);
  const { data: chart } = useFetch(`/reports/revenue/chart?period=${period}${branchId ? `&branchId=${branchId}` : ""}`, [period, branchId]);
  const { data: compare } = useFetch("/reports/branches/compare");
  const { data: branchData } = useFetch("/branches?limit=100");

  const maxChart = chart ? Math.max(...chart.map(d => d.revenue || d._sum?.total || 0), 1) : 1;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Analytics</div>
          <div className="page-title">REVENUE REPORTS</div>
          <div className="page-sub">Comparative performance across the global network</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="download" /> Export CSV</button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div className="tabs">
          {["7d", "30d"].map(p => <div key={p} className={`tab ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>{p === "7d" ? "7 Days" : "30 Days"}</div>)}
        </div>
        <select style={{ width: 200 }} value={branchId} onChange={e => setBranchId(e.target.value)}>
          <option value="">All Branches</option>
          {branchData?.data?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Revenue</div>
          <div className="stat-card-value">{sl ? "—" : `PKR ${((summary?.totalRevenue || 0) / 1000).toFixed(1)}K`}</div>
          <div className="stat-card-trend trend-up">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Orders</div>
          <div className="stat-card-value">{sl ? "—" : summary?.totalOrders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Avg. Order Value</div>
          <div className="stat-card-value">{sl ? "—" : `PKR ${(summary?.avgOrderValue || 0).toFixed(0)}`}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value">{sl ? "—" : summary?.completedOrders || 0}</div>
          <div className="stat-card-trend trend-up">Fulfilled</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card card-inner">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Revenue Trend ({period})</div>
          {!chart ? <Sk h={160} r={8} /> : (
            <div className="chart-bar-wrap">
              {chart.map((d, i) => {
                const val = d.revenue || d._sum?.total || 0;
                const pct = (val / maxChart) * 100;
                return (
                  <div key={i} className="chart-bar-col">
                    <div className="chart-bar-val">PKR {(val / 1000).toFixed(1)}K</div>
                    <div className="chart-bar" style={{ height: `${Math.max(pct, 2)}%` }} title={`PKR ${val.toFixed(2)}`} />
                    <div className="chart-bar-label">{d.date ? new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }) : `D${i + 1}`}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card card-inner">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Branch Performance</div>
          {!compare ? <Sk h={160} r={8} /> : (
            <div>
              {compare.sort((a, b) => b.revenue - a.revenue).map((b, i) => {
                const maxR = Math.max(...compare.map(x => x.revenue), 1);
                return (
                  <div key={b.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      <span>{b.name}</span>
                      <span style={{ color: "var(--accent)" }}>PKR {(b.revenue / 1000).toFixed(1)}K · {b.orderCount} orders</span>
                    </div>
                    <div className="compare-bar-track" style={{ height: 6 }}>
                      <div className="compare-bar-fill" style={{ width: `${(b.revenue / maxR) * 100}%`, background: i === 0 ? "var(--accent)" : "rgba(255,77,0,0.4)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "20px 20px 0", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Branch Performance Ledger</div>
        {!compare ? <TableSk rows={4} cols={4} /> : (
          <table>
            <thead><tr><th>#</th><th>Branch</th><th>Revenue</th><th>Orders</th><th>Avg Order</th></tr></thead>
            <tbody>
              {compare.sort((a, b) => b.revenue - a.revenue).map((b, i) => (
                <tr key={b.name}>
                  <td style={{ fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--muted)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>PKR {b.revenue.toLocaleString()}</td>
                  <td>{b.orderCount}</td>
                  <td style={{ color: "var(--muted)" }}>PKR {b.orderCount > 0 ? (b.revenue / b.orderCount).toLocaleString() : "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
