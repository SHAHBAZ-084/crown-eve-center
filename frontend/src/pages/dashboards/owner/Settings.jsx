// frontend/src/pages/dashboards/owner/Settings.jsx
import React, { useState } from "react";
import { toast, Icon } from "../../../components/owner/OwnerShared";

const Toggle = ({ on, onChange }) => (
  <button className={`toggle ${on ? "on" : "off"}`} onClick={() => onChange(!on)}>
    <div className="toggle-thumb" />
  </button>
);

const SettingRow = ({ icon, title, desc, children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px", background: "var(--surface2)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", gap: 20 }}>
    <div style={{ display: "flex", gap: 16, flex: 1 }}>
      <div style={{ width: 44, height: 44, background: "var(--surface)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
        <Icon name={icon} size={20} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 500 }}>{desc}</div>
      </div>
    </div>
    <div style={{ paddingTop: 8, flexShrink: 0 }}>{children}</div>
  </div>
);

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    globalCatalogAccess: true,
    masterRBAC: false,
    enterpriseAlerts: true,
    dataRetention: "24",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    toast("Settings saved");
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">System</div>
          <div className="page-title">CONFIGURATION</div>
          <div className="page-sub">Master-level overrides and global parameters</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Commit Changes"}</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        <SettingRow icon="globe" title="Global Catalog Access" desc="Enable branch-level visibility to the central parts catalog. When off, branches see only local inventory.">
          <Toggle on={settings.globalCatalogAccess} onChange={v => setSettings(s => ({ ...s, globalCatalogAccess: v }))} />
        </SettingRow>
        <SettingRow icon="shield" title="Master RBAC Policy" desc="Strict role-based access enforcement. Requires MFA for Branch Owner and Technician accounts.">
          <Toggle on={settings.masterRBAC} onChange={v => setSettings(s => ({ ...s, masterRBAC: v }))} />
        </SettingRow>
        <SettingRow icon="bell" title="Enterprise Alerts" desc="Push notifications for low stock and high-value orders directly to the Company Owner dashboard.">
          <Toggle on={settings.enterpriseAlerts} onChange={v => setSettings(s => ({ ...s, enterpriseAlerts: v }))} />
        </SettingRow>
        <SettingRow icon="database" title="Data Retention Policy" desc="Automatic archival of orders and logs. Improves query performance on active datasets.">
          <select value={settings.dataRetention} onChange={e => setSettings(s => ({ ...s, dataRetention: e.target.value }))} style={{ width: 160 }}>
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
            <option value="0">Indefinite</option>
          </select>
        </SettingRow>
      </div>

      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Icon name="globe" size={18} /> API Configuration</div>
        <div className="form-row">
          <div className="form-group"><label>Backend URL</label><input defaultValue="https://crown-eve-center.onrender.com/api" readOnly /></div>
          <div className="form-group"><label>Environment</label>
            <select defaultValue="production"><option value="production">Production</option><option value="staging">Staging</option><option value="dev">Development</option></select>
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--r-xl)", padding: 32 }}>
        <div style={{ color: "var(--red)", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon name="alert" size={20} /> Danger Zone
        </div>
        <div style={{ fontSize: 13, color: "rgba(239,68,68,0.7)", marginBottom: 20 }}>
          These actions are destructive and cannot be undone. Requires system maintenance post-execution.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap:"wrap" }}>
          <button className="btn btn-danger btn-sm">Flush System Logs</button>
          <button className="btn btn-danger btn-sm">Reset Network Stats</button>
          <button className="btn btn-danger btn-sm">Purge Expired Data</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
