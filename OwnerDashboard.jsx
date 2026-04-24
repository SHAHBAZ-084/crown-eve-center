/**
 * Crown Eve Center — Complete Owner Dashboard
 * 
 * Screens: Dashboard · Branches · Parts Catalog · Users/Personnel · Reports/Analytics · Settings · Orders · Purchases
 * 
 * API base: https://crown-eve-center.vercel.app  (or process.env.VITE_API_URL)
 * Auth: Bearer token stored in localStorage as "token"
 * Role: COMPANY_OWNER
 * 
 * All CRUD actions are wired to the real backend endpoints analyzed from the project.
 * Replace API_BASE with your actual deployed backend URL.
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = "https://your-backend-url.vercel.app/api"; // ← change this
const TOKEN_KEY = "token";

// ─── API HELPER ─────────────────────────────────────────────────────────────
const api = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── HOOKS ──────────────────────────────────────────────────────────────────
function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const d = await api(path);
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

function useDebounce(val, ms = 400) {
  const [dv, setDv] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setDv(val), ms);
    return () => clearTimeout(t);
  }, [val, ms]);
  return dv;
}

// ─── DESIGN TOKENS & GLOBAL STYLES ─────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #080809;
    --surface: #0F0F11;
    --surface2: #141416;
    --border: rgba(255,255,255,0.06);
    --border2: rgba(255,255,255,0.1);
    --text: #F0EFE9;
    --muted: #7A7977;
    --accent: #FF4D00;
    --accent2: #FF6B2B;
    --green: #22C55E;
    --yellow: #EAB308;
    --blue: #3B82F6;
    --purple: #A855F7;
    --red: #EF4444;
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --r-sm: 10px;
    --r-md: 16px;
    --r-lg: 24px;
    --r-xl: 32px;
  }
  
  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-body); }
  
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
  
  .shell { display: flex; height: 100vh; overflow: hidden; }
  
  /* Sidebar */
  .sidebar {
    width: 240px;
    min-width: 240px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 28px 16px;
    overflow-y: auto;
    position: relative;
    z-index: 10;
  }
  .sidebar-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; padding: 0 8px; }
  .logo-mark {
    width: 38px; height: 38px; background: var(--accent); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 18px; color: #fff; flex-shrink: 0;
  }
  .logo-text { font-family: var(--font-display); font-size: 22px; letter-spacing: 0.05em; line-height: 1; }
  .logo-text span { color: var(--accent); }
  .logo-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.25em; color: var(--muted); text-transform: uppercase; margin-top: 3px; }
  
  .nav-section-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); padding: 0 8px; margin: 20px 0 8px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px;
    border-radius: var(--r-sm); cursor: pointer; transition: all 0.15s;
    color: var(--muted); font-weight: 500; font-size: 14px; text-decoration: none;
    border: 1px solid transparent;
  }
  .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text); }
  .nav-item.active { background: var(--accent); color: #fff; border-color: var(--accent2); }
  .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
  .nav-spacer { flex: 1; }
  .nav-user {
    display: flex; align-items: center; gap: 10px; padding: 12px;
    background: var(--surface2); border-radius: var(--r-md); border: 1px solid var(--border);
  }
  .nav-avatar {
    width: 32px; height: 32px; border-radius: 8px; background: var(--accent);
    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; flex-shrink: 0;
  }
  .nav-user-name { font-weight: 600; font-size: 13px; line-height: 1.2; }
  .nav-user-role { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
  
  /* Main */
  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
  
  /* Topbar */
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px; border-bottom: 1px solid var(--border); background: var(--surface);
    position: sticky; top: 0; z-index: 5; flex-shrink: 0;
  }
  .topbar-title { font-family: var(--font-display); font-size: 26px; letter-spacing: 0.05em; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .live-badge {
    display: flex; align-items: center; gap: 8px; padding: 6px 14px;
    background: var(--surface2); border: 1px solid var(--border); border-radius: 99px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .live-dot { width: 7px; height: 7px; background: var(--green); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.6; transform:scale(1.2); } }
  
  /* Content */
  .page { padding: 32px; flex: 1; }
  .page-header { margin-bottom: 28px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .page-eyebrow { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: var(--accent); margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
  .page-eyebrow::before { content:''; display:inline-block; width:24px; height:2px; background:var(--accent); }
  .page-title { font-family: var(--font-display); font-size: 42px; letter-spacing: 0.04em; line-height: 1; }
  .page-sub { color: var(--muted); font-size: 14px; margin-top: 4px; }
  .page-actions { display: flex; gap: 10px; flex-shrink: 0; }
  
  /* Buttons */
  .btn { display:inline-flex; align-items:center; gap:8px; padding: 10px 20px; border-radius: var(--r-sm); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; white-space: nowrap; }
  .btn svg { width:16px; height:16px; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent2); }
  .btn-secondary { background: var(--surface2); border-color: var(--border2); color: var(--text); }
  .btn-secondary:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
  .btn-ghost { background: transparent; color: var(--muted); }
  .btn-ghost:hover { color: var(--text); background: rgba(255,255,255,0.05); }
  .btn-danger { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: var(--red); }
  .btn-danger:hover { background: var(--red); color:#fff; }
  .btn-sm { padding: 6px 14px; font-size: 12px; }
  .btn-icon { padding: 8px; border-radius: var(--r-sm); background: var(--surface2); border: 1px solid var(--border); color: var(--muted); cursor:pointer; transition:all 0.15s; display:inline-flex; align-items:center; justify-content:center; }
  .btn-icon:hover { color: var(--text); border-color: var(--border2); }
  .btn-icon.danger:hover { color: var(--red); border-color: var(--red); }
  .btn[disabled] { opacity: 0.4; cursor: not-allowed; }
  
  /* Cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); }
  .card-inner { padding: 24px; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg);
    padding: 24px; position: relative; overflow: hidden; transition: border-color 0.2s;
  }
  .stat-card:hover { border-color: var(--border2); }
  .stat-card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .stat-card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--muted); margin-bottom: 8px; }
  .stat-card-value { font-family: var(--font-display); font-size: 36px; letter-spacing: 0.02em; line-height: 1; }
  .stat-card-trend { font-size: 11px; font-weight: 600; margin-top: 6px; }
  .trend-up { color: var(--green); }
  .trend-dn { color: var(--red); }
  .stat-card-glow { position: absolute; bottom: -40px; right: -20px; width: 100px; height: 100px; border-radius: 50%; opacity: 0.08; blur: 40px; }
  
  /* Table */
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: var(--surface2); border-bottom: 1px solid var(--border); }
  th { padding: 14px 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--muted); text-align: left; white-space: nowrap; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }
  td { padding: 14px 20px; font-size: 14px; }
  .td-actions { display: flex; gap: 6px; justify-content: flex-end; }
  
  /* Forms */
  .form-group { margin-bottom: 18px; }
  label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.1em; }
  input, select, textarea {
    width: 100%; padding: 10px 14px; background: var(--surface2); border: 1px solid var(--border2);
    border-radius: var(--r-sm); color: var(--text); font-family: var(--font-body); font-size: 14px;
    transition: border-color 0.15s; outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--accent); }
  select option { background: var(--surface2); }
  textarea { resize: vertical; min-height: 80px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-row.three { grid-template-columns: 1fr 1fr 1fr; }
  
  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.15s;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .modal {
    background: var(--surface); border: 1px solid var(--border2); border-radius: var(--r-xl);
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.95); } to { opacity:1; transform:none; } }
  .modal-header { padding: 24px 28px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .modal-title { font-family: var(--font-display); font-size: 28px; letter-spacing: 0.04em; }
  .modal-body { padding: 0 28px 28px; }
  .modal-footer { padding: 0 28px 28px; display: flex; justify-content: flex-end; gap: 10px; }
  
  /* Badges */
  .badge { display:inline-flex; align-items:center; gap:5px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .badge-green { background: rgba(34,197,94,0.12); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
  .badge-red { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
  .badge-yellow { background: rgba(234,179,8,0.12); color: var(--yellow); border: 1px solid rgba(234,179,8,0.2); }
  .badge-blue { background: rgba(59,130,246,0.12); color: var(--blue); border: 1px solid rgba(59,130,246,0.2); }
  .badge-purple { background: rgba(168,85,247,0.12); color: var(--purple); border: 1px solid rgba(168,85,247,0.2); }
  .badge-orange { background: rgba(255,77,0,0.12); color: var(--accent); border: 1px solid rgba(255,77,0,0.2); }
  
  /* Search + Filter bar */
  .filter-bar { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
  .search-wrap { flex:1; min-width:200px; position:relative; }
  .search-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--muted); width:16px;height:16px; }
  .search-wrap input { padding-left: 38px; }
  
  /* Pagination */
  .pagination { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-top: 1px solid var(--border); }
  .pagination-info { font-size:12px; color:var(--muted); }
  .pagination-controls { display:flex; gap:6px; }
  .page-btn { padding:6px 14px; border-radius:var(--r-sm); background:var(--surface2); border:1px solid var(--border); font-size:12px; font-weight:600; cursor:pointer; color:var(--text); transition:all 0.15s; }
  .page-btn:hover:not([disabled]) { border-color:var(--border2); }
  .page-btn.active { background:var(--accent); border-color:var(--accent); }
  .page-btn[disabled] { opacity:0.3; cursor:not-allowed; }
  
  /* Skeleton */
  .skeleton { background: linear-gradient(90deg, var(--surface2) 25%, rgba(255,255,255,0.04) 50%, var(--surface2) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--r-sm); }
  @keyframes shimmer { from{background-position:200% 0;} to{background-position:-200% 0;} }
  
  /* Empty state */
  .empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .empty svg { width:48px;height:48px;margin:0 auto 16px;opacity:0.3; }
  .empty-title { font-weight:600; margin-bottom:6px; }
  .empty-sub { font-size:13px; }
  
  /* Toast */
  .toast-container { position:fixed; bottom:24px; right:24px; z-index:100; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
  .toast {
    padding:12px 18px; border-radius:var(--r-md); border:1px solid; font-size:13px; font-weight:600;
    display:flex; align-items:center; gap:10px; pointer-events:all;
    animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    max-width:360px;
  }
  @keyframes toastIn { from{opacity:0;transform:translateX(30px);} to{opacity:1;transform:none;} }
  .toast-success { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.3); color:var(--green); }
  .toast-error { background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.3); color:var(--red); }
  .toast-info { background:rgba(59,130,246,0.15); border-color:rgba(59,130,246,0.3); color:var(--blue); }
  
  /* Charts */
  .chart-bar-wrap { display:flex; align-items:flex-end; gap:8px; height:160px; }
  .chart-bar-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
  .chart-bar { width:100%; background:var(--accent); border-radius:6px 6px 0 0; transition:height 0.5s cubic-bezier(0.34,1.2,0.64,1); position:relative; min-height:4px; }
  .chart-bar:hover { background:var(--accent2); }
  .chart-bar-label { font-size:10px; color:var(--muted); white-space:nowrap; }
  .chart-bar-val { font-size:9px; font-weight:700; color:var(--muted); }
  
  /* Settings toggle */
  .toggle-wrap { display:flex; align-items:center; gap:10px; }
  .toggle { width:44px; height:24px; border-radius:99px; cursor:pointer; transition:background 0.2s; position:relative; flex-shrink:0; border:none; }
  .toggle.on { background:var(--accent); }
  .toggle.off { background:var(--surface2); border:1px solid var(--border2); }
  .toggle-thumb { position:absolute; top:3px; width:18px; height:18px; background:#fff; border-radius:50%; transition:left 0.2s; }
  .toggle.on .toggle-thumb { left:23px; }
  .toggle.off .toggle-thumb { left:3px; }
  
  /* Avatar */
  .avatar { width:36px; height:36px; border-radius:8px; background:var(--surface2); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }
  
  /* Tabs */
  .tabs { display:flex; gap:4px; margin-bottom:24px; background:var(--surface2); border:1px solid var(--border); padding:4px; border-radius:var(--r-md); width:fit-content; }
  .tab { padding:8px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; color:var(--muted); }
  .tab.active { background:var(--accent); color:#fff; }
  .tab:hover:not(.active) { color:var(--text); }
  
  /* Branch card */
  .branch-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
  .branch-card {
    background:var(--surface); border:1px solid var(--border); border-radius:var(--r-xl);
    padding:28px; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .branch-card:hover { border-color:var(--border2); transform:translateY(-2px); }
  .branch-card-accent { position:absolute; top:0; right:0; width:80px; height:80px; border-radius:0 var(--r-xl) 0 80px; opacity:0.06; }
  .branch-stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0; }
  .branch-stat { background:var(--surface2); border:1px solid var(--border); border-radius:var(--r-md); padding:14px; }
  .branch-stat-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.15em; color:var(--muted); margin-bottom:4px; }
  .branch-stat-val { font-family:var(--font-display); font-size:24px; }
  
  /* Comparison chart */
  .compare-row { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); }
  .compare-row:last-child { border-bottom:none; }
  .compare-bar-track { flex:1; height:8px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; }
  .compare-bar-fill { height:100%; border-radius:99px; background:var(--accent); transition:width 0.6s cubic-bezier(0.34,1.2,0.64,1); }
  
  /* Login */
  .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); padding:20px; }
  .login-card { background:var(--surface); border:1px solid var(--border2); border-radius:var(--r-xl); padding:48px; width:100%; max-width:420px; }
  .login-logo { text-align:center; margin-bottom:36px; }
  .login-title { font-family:var(--font-display); font-size:36px; letter-spacing:0.04em; text-align:center; margin-bottom:4px; }
  .login-sub { text-align:center; color:var(--muted); font-size:13px; margin-bottom:32px; }
  .login-err { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:var(--red); padding:12px 16px; border-radius:var(--r-sm); font-size:13px; margin-bottom:16px; }
  
  /* Responsive */
  @media(max-width:1024px) {
    .stat-grid { grid-template-columns:repeat(2,1fr); }
    .sidebar { display:none; }
  }
  @media(max-width:640px) {
    .stat-grid { grid-template-columns:1fr; }
    .page { padding:20px; }
    .branch-grid { grid-template-columns:1fr; }
  }
`;

// ─── ICONS (inline SVG) ───────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const paths = {
    dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    branches: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    parts: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
    reports: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
    orders: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
    purchases: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    plus: "M12 5v14 M5 12h14",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    close: "M18 6 6 18 M6 6l12 12",
    check: "M20 6 9 17l-5-5",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    trend: "M23 6l-9.5 9.5-5-5L1 18",
    dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    database: "M12 2a9 3 0 1 0 0 6 9 3 0 0 0 0-6 M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5 M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
    alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  };
  const d = paths[name] || paths.dashboard;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => <path key={i} d={(i > 0 ? "M" : "") + seg} />)}
    </svg>
  );
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
let _addToast;
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  _addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <Icon name={t.type === "error" ? "alert" : "check"} size={16} />
          {t.msg}
        </div>
      ))}
    </div>
  );
};
const toast = (msg, type) => _addToast?.(msg, type);

// ─── MODAL ───────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, footer }) => (
  <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <div className="modal-title">{title}</div>
        <button className="btn-icon" onClick={onClose}><Icon name="close" size={16} /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

// ─── SKELETON ────────────────────────────────────────────────────────────────
const Sk = ({ w = "100%", h = 16, r = 6, mb = 0 }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);
const TableSk = ({ rows = 6, cols = 5 }) => (
  <div style={{ padding: "20px" }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {Array.from({ length: cols }).map((_, j) => <Sk key={j} h={14} r={4} />)}
      </div>
    ))}
  </div>
);

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
const Confirm = ({ msg, onConfirm, onCancel }) => (
  <div className="modal-backdrop" onClick={onCancel}>
    <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header"><div className="modal-title">Confirm</div></div>
      <div className="modal-body">
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{msg}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// PAGE: OWNER DASHBOARD (home)
// ════════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const { data: branchCount } = useFetch("/branches/count");
  const { data: partsCount } = useFetch("/parts/count");
  const { data: orderCount } = useFetch("/orders/count");
  const { data: revenue } = useFetch("/reports/revenue/summary");
  const { data: topBranches } = useFetch("/branches/top?limit=5");
  const { data: compareData } = useFetch("/reports/branches/compare");
  const { data: orders } = useFetch("/orders?limit=6&page=1");

  const maxRev = compareData ? Math.max(...compareData.map(b => b.revenue), 1) : 1;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Enterprise Control</div>
          <div className="page-title">NETWORK COMMAND</div>
          <div className="page-sub">Real-time monitoring for the Crown Eve branch network</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="live-badge">
            <span className="live-dot" />
            Live Network Active
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
            <Icon name="refresh" size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(255,77,0,0.1)", color: "var(--accent)" }}>
            <Icon name="dollar" size={20} />
          </div>
          <div className="stat-card-label">Global Revenue</div>
          <div className="stat-card-value">${((revenue?.totalRevenue || 0) / 1000).toFixed(1)}K</div>
          <div className="stat-card-trend trend-up">↑ All branches</div>
          <div className="stat-card-glow" style={{ background: "var(--accent)" }} />
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)" }}>
            <Icon name="branches" size={20} />
          </div>
          <div className="stat-card-label">Total Branches</div>
          <div className="stat-card-value">{branchCount?.count ?? "—"}</div>
          <div className="stat-card-trend" style={{ color: "var(--blue)" }}>Active network nodes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(34,197,94,0.1)", color: "var(--green)" }}>
            <Icon name="orders" size={20} />
          </div>
          <div className="stat-card-label">Total Orders</div>
          <div className="stat-card-value">{orderCount?.count ?? "—"}</div>
          <div className="stat-card-trend trend-up">Network-wide</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(168,85,247,0.1)", color: "var(--purple)" }}>
            <Icon name="parts" size={20} />
          </div>
          <div className="stat-card-label">Parts SKUs</div>
          <div className="stat-card-value">{partsCount?.count ?? "—"}</div>
          <div className="stat-card-trend" style={{ color: "var(--purple)" }}>Global catalog</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Branch comparison */}
        <div className="card card-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Branch Revenue Comparison</div>
          </div>
          {!compareData ? <Sk h={160} r={8} /> : (
            <div>
              {compareData.map(b => (
                <div key={b.name} className="compare-row">
                  <div style={{ width: 110, fontSize: 12, fontWeight: 600, flexShrink: 0, color: "var(--muted)" }}>{b.name}</div>
                  <div className="compare-bar-track">
                    <div className="compare-bar-fill" style={{ width: `${(b.revenue / maxRev) * 100}%` }} />
                  </div>
                  <div style={{ width: 80, textAlign: "right", fontSize: 12, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
                    ${(b.revenue / 1000).toFixed(1)}K
                  </div>
                </div>
              ))}
              {compareData.length === 0 && <div className="empty"><Icon name="branches" size={36} /><div className="empty-title">No data</div></div>}
            </div>
          )}
        </div>

        {/* Top branches */}
        <div className="card card-inner">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Top Branches by Orders</div>
          {!topBranches ? <Sk h={160} r={8} /> : topBranches.map((b, i) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < topBranches.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: i === 0 ? "var(--accent)" : "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{b.location}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{b._count?.orders} orders</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Orders (Network-wide)</div>
          <span className="badge badge-blue">Live</span>
        </div>
        {!orders ? <TableSk rows={5} cols={5} /> : (
          <table>
            <thead>
              <tr>
                <th>Order #</th><th>Branch</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders?.data?.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>#{o.id}</span></td>
                  <td style={{ fontSize: 13, color: "var(--muted)" }}>{o.branch?.name || "—"}</td>
                  <td style={{ fontSize: 13 }}>{o.customer?.name || "—"}</td>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>${o.total?.toFixed(2)}</td>
                  <td><OrderBadge status={o.status} /></td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders?.data?.length === 0 && <tr><td colSpan={6}><div className="empty"><Icon name="orders" /><div className="empty-title">No orders</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const OrderBadge = ({ status }) => {
  const map = { PENDING: "badge-yellow", PROCESSING: "badge-blue", COMPLETED: "badge-green", CANCELLED: "badge-red" };
  return <span className={`badge ${map[status] || "badge-blue"}`}>{status}</span>;
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: BRANCHES
// ════════════════════════════════════════════════════════════════════════════
const BranchesPage = () => {
  const { data: branchData, loading, refetch } = useFetch("/branches?limit=50");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name: "", location: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({ name: "", location: "" }); setEditTarget(null); setShowModal(true); };
  const openEdit = b => { setForm({ name: b.name, location: b.location }); setEditTarget(b); setShowModal(true); };

  const submit = async () => {
    if (!form.name || !form.location) return toast("Name and location required", "error");
    setSaving(true);
    try {
      if (editTarget) {
        await api(`/branches/${editTarget.id}`, { method: "PUT", body: form });
        toast("Branch updated");
      } else {
        await api("/branches", { method: "POST", body: form });
        toast("Branch created");
      }
      setShowModal(false);
      refetch();
    } catch (e) { toast(e.message, "error"); }
    setSaving(false);
  };

  const remove = async (id) => {
    try {
      await api(`/branches/${id}`, { method: "DELETE" });
      toast("Branch deleted");
      refetch();
    } catch (e) { toast(e.message, "error"); }
    setConfirmId(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Network</div>
          <div className="page-title">BRANCHES</div>
          <div className="page-sub">Manage all global branch locations — {branchData?.meta?.total || 0} total</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" /> New Branch</button>
        </div>
      </div>

      {loading ? <div className="branch-grid">{[1,2,3,4].map(i=><div key={i} className="branch-card"><Sk h={24} mb={12}/><Sk h={14} w="60%" mb={20}/><Sk h={80}/></div>)}</div> : (
        <div className="branch-grid">
          {branchData?.data?.map(b => (
            <div key={b.id} className="branch-card">
              <div className="branch-card-accent" style={{ background: "var(--accent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,77,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                    <Icon name="branches" size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.location}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-icon" onClick={() => openEdit(b)}><Icon name="edit" size={15} /></button>
                  <button className="btn-icon danger" onClick={() => setConfirmId(b.id)}><Icon name="trash" size={15} /></button>
                </div>
              </div>
              <div className="branch-stats">
                <div className="branch-stat">
                  <div className="branch-stat-label">Staff</div>
                  <div className="branch-stat-val">{b._count?.users || 0}</div>
                </div>
                <div className="branch-stat">
                  <div className="branch-stat-label">Products</div>
                  <div className="branch-stat-val">{b._count?.products || 0}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Created {new Date(b.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editTarget ? "EDIT BRANCH" : "NEW BRANCH"} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Branch"}</button>
          </>}
        >
          <div className="form-group"><label>Branch Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Downtown Main" /></div>
          <div className="form-group"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. 123 Main St, New York" /></div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Permanently delete this branch? This cannot be undone." onConfirm={() => remove(confirmId)} onCancel={() => setConfirmId(null)} />}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: PARTS CATALOG
// ════════════════════════════════════════════════════════════════════════════
const PartsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const ds = useDebounce(search);
  const params = new URLSearchParams({ page, limit: 12, ...(ds && { search: ds }), ...(category && { category }) }).toString();
  const { data, loading, refetch } = useFetch(`/parts?${params}`, [page, ds, category]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({ name:"", category:"", price:"", stock:"" }); setEditTarget(null); setShowModal(true); };
  const openEdit = p => { setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock }); setEditTarget(p); setShowModal(true); };

  const submit = async () => {
    if (!form.name || !form.category || !form.price) return toast("Fill required fields", "error");
    setSaving(true);
    try {
      const body = { name: form.name, category: form.category, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 };
      if (editTarget) { await api(`/parts/${editTarget.id}`, { method: "PUT", body }); toast("Part updated"); }
      else { await api("/parts", { method: "POST", body }); toast("Part created"); }
      setShowModal(false); refetch();
    } catch(e) { toast(e.message, "error"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await api(`/parts/${id}`, { method: "DELETE" }); toast("Part deleted"); refetch(); }
    catch(e) { toast(e.message, "error"); }
    setConfirmId(null);
  };

  const categories = [...new Set(data?.data?.map(p => p.category) || [])];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Inventory</div>
          <div className="page-title">PARTS CATALOG</div>
          <div className="page-sub">Global parts master list — {data?.meta?.total || 0} SKUs</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" /> Add SKU</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <Icon name="search" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search by name…" />
        </div>
        <select style={{ width: 180 }} value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        {loading ? <TableSk rows={8} cols={5} /> : (
          <table>
            <thead><tr><th>Component</th><th>Category</th><th>Price</th><th>Base Stock</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
            <tbody>
              {data?.data?.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}><Icon name="parts" size={16} /></div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{p.category}</span></td>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>${parseFloat(p.price).toFixed(2)}</td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{p.stock}</span>
                    {p.stock < 10 && <span className="badge badge-red" style={{ marginLeft: 8 }}>Low</span>}
                  </td>
                  <td><div className="td-actions">
                    <button className="btn-icon" onClick={() => openEdit(p)}><Icon name="edit" size={14} /></button>
                    <button className="btn-icon danger" onClick={() => setConfirmId(p.id)}><Icon name="trash" size={14} /></button>
                  </div></td>
                </tr>
              ))}
              {data?.data?.length === 0 && <tr><td colSpan={5}><div className="empty"><Icon name="parts" /><div className="empty-title">No parts found</div></div></td></tr>}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <div className="pagination-info">Showing {data?.data?.length || 0} of {data?.meta?.total || 0}</div>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p=>p-1)}>Prev</button>
            {Array.from({ length: Math.min(data?.meta?.totalPages || 1, 5) }).map((_, i) => (
              <button key={i} className={`page-btn ${page === i+1 ? "active" : ""}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? "EDIT PART" : "NEW PART"} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Part"}</button>
          </>}
        >
          <div className="form-group"><label>Part Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Brake Pad Set" /></div>
          <div className="form-row">
            <div className="form-group"><label>Category *</label><input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="e.g. Brakes" /></div>
            <div className="form-group"><label>Price (USD) *</label><input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" /></div>
          </div>
          <div className="form-group"><label>Base Stock</label><input type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} placeholder="0" /></div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Delete this part from the global catalog?" onConfirm={() => remove(confirmId)} onCancel={() => setConfirmId(null)} />}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: USERS / PERSONNEL
// ════════════════════════════════════════════════════════════════════════════
const UsersPage = () => {
  const { data: users, loading, refetch } = useFetch("/users");
  const { data: branchData } = useFetch("/branches?limit=100");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"EMPLOYEE", branchId:"" });
  const [saving, setSaving] = useState(false);

  const roles = ["COMPANY_OWNER","BRANCH_OWNER","EMPLOYEE","TECHNICIAN","CUSTOMER","MANAGER"];
  const roleBadge = { COMPANY_OWNER:"badge-orange", BRANCH_OWNER:"badge-blue", EMPLOYEE:"badge-green", TECHNICIAN:"badge-purple", CUSTOMER:"badge-yellow", MANAGER:"badge-red" };

  const filtered = (users || []).filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  );

  const openAdd = () => { setForm({ name:"", email:"", password:"", role:"EMPLOYEE", branchId:"" }); setEditTarget(null); setShowModal(true); };
  const openEdit = u => { setForm({ name:u.name, email:u.email, password:"", role:u.role, branchId:u.branchId||"" }); setEditTarget(u); setShowModal(true); };

  const submit = async () => {
    if (!form.name || !form.email) return toast("Name and email required", "error");
    if (!editTarget && !form.password) return toast("Password required for new user", "error");
    setSaving(true);
    try {
      if (editTarget) {
        const body = { name:form.name, email:form.email, role:form.role, branchId:form.branchId?Number(form.branchId):null };
        await api(`/users/${editTarget.id}`, { method:"PUT", body });
        toast("User updated");
      } else {
        await api("/users", { method:"POST", body: { ...form, branchId:form.branchId?Number(form.branchId):null } });
        toast("User created");
      }
      setShowModal(false); refetch();
    } catch(e) { toast(e.message, "error"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await api(`/users/${id}`, { method:"DELETE" }); toast("User removed"); refetch(); }
    catch(e) { toast(e.message, "error"); }
    setConfirmId(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Access Control</div>
          <div className="page-title">PERSONNEL HUB</div>
          <div className="page-sub">Manage all users, roles and branch assignments — {(users||[]).length} total</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" /> Add User</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <Icon name="search" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email…" />
        </div>
        <select style={{ width: 180 }} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        {loading ? <TableSk rows={8} cols={5} /> : (
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Branch</th><th>Joined</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div className="avatar" style={{ background:`hsl(${u.id*37%360},40%,25%)` }}>{u.name[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{u.name}</div>
                        <div style={{ fontSize:11, color:"var(--muted)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleBadge[u.role]||"badge-blue"}`}>{u.role.replace("_"," ")}</span></td>
                  <td style={{ fontSize:13, color:"var(--muted)" }}>{u.branch?.name || "—"}</td>
                  <td style={{ fontSize:12, color:"var(--muted)", fontFamily:"var(--font-mono)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><div className="td-actions">
                    <button className="btn-icon" onClick={() => openEdit(u)}><Icon name="edit" size={14} /></button>
                    <button className="btn-icon danger" onClick={() => setConfirmId(u.id)}><Icon name="trash" size={14} /></button>
                  </div></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5}><div className="empty"><Icon name="users" /><div className="empty-title">No users found</div></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editTarget ? "EDIT USER" : "NEW USER"} onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save User"}</button>
          </>}
        >
          <div className="form-row">
            <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
            <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
          </div>
          {!editTarget && <div className="form-group"><label>Password *</label><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></div>}
          <div className="form-row">
            <div className="form-group"><label>Role *</label>
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                {roles.map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Branch</label>
              <select value={form.branchId} onChange={e=>setForm(f=>({...f,branchId:e.target.value}))}>
                <option value="">None / Global</option>
                {branchData?.data?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
      {confirmId && <Confirm msg="Remove this user from the system?" onConfirm={() => remove(confirmId)} onCancel={() => setConfirmId(null)} />}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: ORDERS (owner can view all)
// ════════════════════════════════════════════════════════════════════════════
const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const { data: branchData } = useFetch("/branches?limit=100");
  const params = new URLSearchParams({ page, limit:15, ...(status && {status}), ...(branchId && {branchId}) }).toString();
  const { data, loading } = useFetch(`/orders?${params}`, [page, status, branchId]);

  const statuses = ["PENDING","PROCESSING","COMPLETED","CANCELLED"];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Operations</div>
          <div className="page-title">ALL ORDERS</div>
          <div className="page-sub">Network-wide order overview — {data?.meta?.total || 0} total</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Icon name="download" /> Export</button>
        </div>
      </div>

      <div className="filter-bar">
        <select style={{ width:180 }} value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={{ width:180 }} value={branchId} onChange={e=>{setBranchId(e.target.value);setPage(1)}}>
          <option value="">All Branches</option>
          {branchData?.data?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        {loading ? <TableSk rows={10} cols={6} /> : (
          <table>
            <thead><tr><th>Order #</th><th>Type</th><th>Branch</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {data?.data?.map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:700 }}>#{o.id}</span></td>
                  <td><span className={`badge ${o.type==="ONLINE"?"badge-blue":"badge-purple"}`}>{o.type}</span></td>
                  <td style={{ fontSize:13, color:"var(--muted)" }}>{o.branch?.name||"—"}</td>
                  <td style={{ fontSize:13 }}>{o.customer?.name||"—"}</td>
                  <td style={{ fontWeight:700, color:"var(--accent)" }}>${o.total?.toFixed(2)}</td>
                  <td><OrderBadge status={o.status} /></td>
                  <td style={{ fontSize:12, color:"var(--muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data?.data?.length === 0 && <tr><td colSpan={7}><div className="empty"><Icon name="orders" /><div className="empty-title">No orders found</div></div></td></tr>}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <div className="pagination-info">Showing {data?.data?.length||0} of {data?.meta?.total||0}</div>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
            <button className="page-btn" disabled={page>=(data?.meta?.totalPages||1)} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: PURCHASES (owner can view)
// ════════════════════════════════════════════════════════════════════════════
const PurchasesPage = () => {
  const { data, loading } = useFetch("/purchases");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Supply Chain</div>
          <div className="page-title">PURCHASES</div>
          <div className="page-sub">All supplier purchase records across branches</div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? <TableSk rows={8} cols={5} /> : (
          <table>
            <thead><tr><th>Purchase #</th><th>Branch</th><th>Supplier</th><th>Total</th><th>Items</th><th>Date</th></tr></thead>
            <tbody>
              {(Array.isArray(data) ? data : data?.data || []).map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:700 }}>#{p.id}</span></td>
                  <td style={{ fontSize:13, color:"var(--muted)" }}>{p.branch?.name||"—"}</td>
                  <td style={{ fontSize:13 }}>{p.supplier?.name||"—"}</td>
                  <td style={{ fontWeight:700, color:"var(--accent)" }}>${p.total?.toFixed(2)}</td>
                  <td style={{ fontSize:12, color:"var(--muted)" }}>{p.items?.length||0} parts</td>
                  <td style={{ fontSize:12, color:"var(--muted)" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(Array.isArray(data) ? data : data?.data || []).length === 0 && (
                <tr><td colSpan={6}><div className="empty"><Icon name="purchases" /><div className="empty-title">No purchases found</div></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: REPORTS / ANALYTICS
// ════════════════════════════════════════════════════════════════════════════
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
          {["7d","30d"].map(p => <div key={p} className={`tab ${period===p?"active":""}`} onClick={()=>setPeriod(p)}>{p==="7d"?"7 Days":"30 Days"}</div>)}
        </div>
        <select style={{ width:200 }} value={branchId} onChange={e=>setBranchId(e.target.value)}>
          <option value="">All Branches</option>
          {branchData?.data?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* KPI cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Revenue</div>
          <div className="stat-card-value">{sl ? "—" : `$${((summary?.totalRevenue||0)/1000).toFixed(1)}K`}</div>
          <div className="stat-card-trend trend-up">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Orders</div>
          <div className="stat-card-value">{sl ? "—" : summary?.totalOrders||0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Avg. Order Value</div>
          <div className="stat-card-value">{sl ? "—" : `$${(summary?.avgOrderValue||0).toFixed(0)}`}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value">{sl ? "—" : summary?.completedOrders||0}</div>
          <div className="stat-card-trend trend-up">Fulfilled</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Revenue trend chart */}
        <div className="card card-inner">
          <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Revenue Trend ({period})</div>
          {!chart ? <Sk h={160} r={8} /> : (
            <div className="chart-bar-wrap">
              {chart.map((d, i) => {
                const val = d.revenue || d._sum?.total || 0;
                const pct = (val / maxChart) * 100;
                return (
                  <div key={i} className="chart-bar-col">
                    <div className="chart-bar-val">${(val/1000).toFixed(1)}K</div>
                    <div className="chart-bar" style={{ height: `${Math.max(pct,2)}%` }} title={`$${val.toFixed(2)}`} />
                    <div className="chart-bar-label">{d.date ? new Date(d.date).toLocaleDateString("en",{month:"short",day:"numeric"}) : `D${i+1}`}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Branch comparison */}
        <div className="card card-inner">
          <div style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Branch Performance</div>
          {!compare ? <Sk h={160} r={8} /> : (
            <div>
              {compare.sort((a,b)=>b.revenue-a.revenue).map((b, i) => {
                const maxR = Math.max(...compare.map(x=>x.revenue),1);
                return (
                  <div key={b.name} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:6 }}>
                      <span>{b.name}</span>
                      <span style={{ color:"var(--accent)" }}>${(b.revenue/1000).toFixed(1)}K · {b.orderCount} orders</span>
                    </div>
                    <div className="compare-bar-track" style={{ height:6 }}>
                      <div className="compare-bar-fill" style={{ width:`${(b.revenue/maxR)*100}%`, background: i===0?"var(--accent)":"rgba(255,77,0,0.4)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail table */}
      <div className="card">
        <div style={{ padding:"20px 20px 0", fontWeight:700, fontSize:15, marginBottom:16 }}>Branch Performance Ledger</div>
        {!compare ? <TableSk rows={4} cols={4} /> : (
          <table>
            <thead><tr><th>#</th><th>Branch</th><th>Revenue</th><th>Orders</th><th>Avg Order</th></tr></thead>
            <tbody>
              {compare.sort((a,b)=>b.revenue-a.revenue).map((b,i)=>(
                <tr key={b.name}>
                  <td style={{ fontWeight:700, color:i===0?"var(--accent)":"var(--muted)" }}>{i+1}</td>
                  <td style={{ fontWeight:600 }}>{b.name}</td>
                  <td style={{ fontWeight:700, color:"var(--accent)" }}>${b.revenue.toFixed(2)}</td>
                  <td>{b.orderCount}</td>
                  <td style={{ color:"var(--muted)" }}>${b.orderCount>0?(b.revenue/b.orderCount).toFixed(2):"0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// PAGE: SETTINGS
// ════════════════════════════════════════════════════════════════════════════
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

  const Toggle = ({ on, onChange }) => (
    <button className={`toggle ${on ? "on" : "off"}`} onClick={() => onChange(!on)}>
      <div className="toggle-thumb" />
    </button>
  );

  const SettingRow = ({ icon, title, desc, children }) => (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"24px", background:"var(--surface2)", borderRadius:"var(--r-lg)", border:"1px solid var(--border)", gap:20 }}>
      <div style={{ display:"flex", gap:16, flex:1 }}>
        <div style={{ width:44, height:44, background:"var(--surface)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--accent)", flexShrink:0 }}>
          <Icon name={icon} size={20} />
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{title}</div>
          <div style={{ fontSize:13, color:"var(--muted)", maxWidth:500 }}>{desc}</div>
        </div>
      </div>
      <div style={{ paddingTop:8, flexShrink:0 }}>{children}</div>
    </div>
  );

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

      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:32 }}>
        <SettingRow icon="globe" title="Global Catalog Access" desc="Enable branch-level visibility to the central parts catalog. When off, branches see only local inventory.">
          <Toggle on={settings.globalCatalogAccess} onChange={v=>setSettings(s=>({...s,globalCatalogAccess:v}))} />
        </SettingRow>
        <SettingRow icon="shield" title="Master RBAC Policy" desc="Strict role-based access enforcement. Requires MFA for Branch Owner and Technician accounts.">
          <Toggle on={settings.masterRBAC} onChange={v=>setSettings(s=>({...s,masterRBAC:v}))} />
        </SettingRow>
        <SettingRow icon="bell" title="Enterprise Alerts" desc="Push notifications for low stock and high-value orders directly to the Company Owner dashboard.">
          <Toggle on={settings.enterpriseAlerts} onChange={v=>setSettings(s=>({...s,enterpriseAlerts:v}))} />
        </SettingRow>
        <SettingRow icon="database" title="Data Retention Policy" desc="Automatic archival of orders and logs. Improves query performance on active datasets.">
          <select value={settings.dataRetention} onChange={e=>setSettings(s=>({...s,dataRetention:e.target.value}))} style={{ width:160 }}>
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
            <option value="0">Indefinite</option>
          </select>
        </SettingRow>
      </div>

      {/* API config section */}
      <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:28, marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}><Icon name="globe" size={18} /> API Configuration</div>
        <div className="form-row">
          <div className="form-group"><label>Backend URL</label><input defaultValue={API_BASE} placeholder="https://your-api.vercel.app/api" /></div>
          <div className="form-group"><label>Environment</label>
            <select defaultValue="production"><option value="production">Production</option><option value="staging">Staging</option><option value="dev">Development</option></select>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"var(--r-xl)", padding:32 }}>
        <div style={{ color:"var(--red)", fontWeight:700, fontSize:16, display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Icon name="alert" size={20} /> Danger Zone
        </div>
        <div style={{ fontSize:13, color:"rgba(239,68,68,0.7)", marginBottom:20 }}>
          These actions are destructive and cannot be undone. Requires system maintenance post-execution.
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button className="btn btn-danger btn-sm">Flush System Logs</button>
          <button className="btn btn-danger btn-sm">Reset Network Stats</button>
          <button className="btn btn-danger btn-sm">Purge Expired Data</button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api("/auth/login", { method: "POST", body: form });
      if (res.user?.role !== "COMPANY_OWNER") {
        setError("Access restricted to Company Owner accounts.");
        setLoading(false); return;
      }
      localStorage.setItem(TOKEN_KEY, res.token);
      onLogin(res.user);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ width:56, height:56, background:"var(--accent)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:26, color:"#fff", margin:"0 auto 16px" }}>CE</div>
          <div className="login-title">CROWN EVE</div>
          <div className="login-sub">Owner Control Panel — COMPANY_OWNER access only</div>
        </div>
        {error && <div className="login-err">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="owner@crowneve.com" autoFocus /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" /></div>
          <button type="submit" className="btn btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:8 }} disabled={loading}>
            {loading ? "Authenticating…" : "Sign In"}
          </button>
        </form>
        <div style={{ marginTop:24, padding:"16px", background:"var(--surface2)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", marginBottom:6 }}>Demo — Connect your backend</div>
          <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--font-mono)" }}>API: {API_BASE}</div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SHELL / LAYOUT
// ════════════════════════════════════════════════════════════════════════════
const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"dashboard", section:"Overview" },
  { id:"branches",  label:"Branches",  icon:"branches",  section:"Network" },
  { id:"parts",     label:"Parts Catalog", icon:"parts", section:"Network" },
  { id:"orders",    label:"All Orders",    icon:"orders",section:"Operations" },
  { id:"purchases", label:"Purchases",     icon:"purchases",section:"Operations" },
  { id:"users",     label:"Personnel",     icon:"users", section:"Admin" },
  { id:"reports",   label:"Analytics",     icon:"reports",section:"Admin" },
  { id:"settings",  label:"Settings",      icon:"settings",section:"Admin" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      api("/auth/me").then(r => { setUser(r.user); }).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setChecked(true));
    } else { setChecked(true); }
  }, []);

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setUser(null); };

  if (!checked) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ width:40, height:40, border:"3px solid var(--accent)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={u => { setUser(u); setPage("dashboard"); }} />
      <ToastContainer />
    </>
  );

  const sections = [...new Set(NAV.map(n => n.section))];
  const currentPage = NAV.find(n => n.id === page);
  const pages = { dashboard: <DashboardPage />, branches: <BranchesPage />, parts: <PartsPage />, orders: <OrdersPage />, purchases: <PurchasesPage />, users: <UsersPage />, reports: <ReportsPage />, settings: <SettingsPage /> };

  return (
    <>
      <style>{styles}</style>
      <div className="shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">CE</div>
            <div>
              <div className="logo-text">CROWN <span>EVE</span></div>
              <div className="logo-sub">Owner Panel</div>
            </div>
          </div>
          <nav style={{ flex:1 }}>
            {sections.map(sec => (
              <div key={sec}>
                <div className="nav-section-label">{sec}</div>
                {NAV.filter(n => n.section === sec).map(n => (
                  <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
                    <Icon name={n.icon} size={18} />
                    <span>{n.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div style={{ paddingTop:20, borderTop:"1px solid var(--border)" }}>
            <div className="nav-user" style={{ marginBottom:12 }}>
              <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="nav-user-name">{user.name}</div>
                <div className="nav-user-role">Owner</div>
              </div>
            </div>
            <div className="nav-item" onClick={logout} style={{ color:"var(--red)" }}>
              <Icon name="logout" size={18} />
              <span>Logout</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-title">{currentPage?.label?.toUpperCase()}</div>
            <div className="topbar-right">
              <div className="live-badge"><span className="live-dot" />Live</div>
            </div>
          </div>
          {pages[page] || <DashboardPage />}
        </main>
      </div>
      <ToastContainer />
    </>
  );
}
