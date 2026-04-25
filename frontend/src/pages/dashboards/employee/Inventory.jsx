// frontend/src/pages/dashboards/employee/Inventory.jsx
import { useState } from "react";
import { useFetch, useDebounce, Icon, Sk } from "./EmployeeShared";

export default function InventoryPage({ branchId }) {
  const [search, setSearch] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ branchId, page, limit: 24 }).toString();
  const { data, loading } = useFetch(`/inventory?${params}`, [branchId, page]);
  const { data: alerts }  = useFetch(`/inventory/alerts?branchId=${branchId}`, [branchId]);
  const ds = useDebounce(search);
  const items = (data?.data || []).filter(i =>
    !ds || i.part?.name?.toLowerCase().includes(ds.toLowerCase()) || i.part?.category?.toLowerCase().includes(ds.toLowerCase())
  );
  const displayItems = showAlerts ? (alerts || []) : items;

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Parts Storage</div>
          <div className="ptitle">INVENTORY VIEW</div>
          <div className="psub">Branch stock levels — read only · {data?.meta?.total || 0} SKUs</div>
        </div>
        <div className="ph-r">
          <button className={`btn btn-sm ${showAlerts ? "btn-acc" : "btn-sec"}`} onClick={() => setShowAlerts(s => !s)}>
            <Icon n="alert" /> {Array.isArray(alerts) ? alerts.length : 0} Alerts
          </button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", background: "rgba(59,130,246,.07)", border: "1px solid rgba(59,130,246,.15)", borderRadius: 10, marginBottom: 18, fontSize: 12, color: "var(--muted)" }}>
        <Icon n="eye" s={14} /> <span>You have <b style={{ color: "var(--text)" }}>read-only</b> access. Contact your Branch Owner to adjust stock levels or thresholds.</span>
      </div>
      {!showAlerts && (
        <div className="fbar">
          <div className="sw"><Icon n="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts or category…" /></div>
        </div>
      )}
      {loading && !data ? (
        <div className="inv-grid">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="sk" style={{ height: 140, borderRadius: 20 }} />)}</div>
      ) : (
        <>
          {showAlerts && <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, color: "var(--red)" }}>⚠ Showing {(alerts || []).length} low-stock items</div>}
          <div className="inv-grid">
            {displayItems.map(item => {
              const isLow   = item.stock <= item.alertAt && item.stock > 0;
              const isCrit  = item.stock === 0;
              return (
                <div key={item.id} className={`inv-card ${isCrit ? "crit" : isLow ? "low" : ""}`}>
                  <div style={{ height: 3, background: "var(--bdr)", borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3,
                      background: isCrit ? "var(--red)" : isLow ? "var(--yellow)" : "var(--acc)",
                      width: `${Math.min(100, (item.stock / Math.max(item.alertAt * 3, 1)) * 100)}%`,
                      transition: "width .6s",
                    }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>{item.part?.name}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14 }}>{item.part?.category}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>On Hand</div>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 28, lineHeight: 1, color: isCrit ? "var(--red)" : isLow ? "var(--yellow)" : "var(--text)" }}>{item.stock}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {isCrit && <span className="badge b-r">OUT</span>}
                      {isLow  && !isCrit && <span className="badge b-y">LOW</span>}
                      {!isLow && !isCrit && <span className="badge b-g">OK</span>}
                      <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>alert ≤{item.alertAt}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {!showAlerts && (
            <div className="pag" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", borderRadius: "var(--r3)", marginTop: 14 }}>
              <div className="pag-info">Page {page} · {data?.meta?.total || 0} total items</div>
              <div className="pag-ctrl">
                <button className="pb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="pb" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
