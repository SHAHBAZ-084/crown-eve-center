/**
 * Crown Eve Center — Employee Dashboard
 *
 * Role: EMPLOYEE
 * Exact permissions extracted from backend routes & controllers:
 *
 * ✅ ORDERS      GET /orders (branch-scoped auto), GET /orders/count,
 *               GET /orders/:id, POST /orders, PUT /orders/:id/status
 * ✅ APPOINTMENTS GET /appointments/today, GET /appointments,
 *               PUT /appointments/:id (status + techId)
 * ✅ INVENTORY   GET /inventory (read-only), GET /inventory/alerts
 * ✅ PRODUCTS    GET /products, GET /products/:id,
 *               POST /products, PUT /products/:id, DELETE /products/:id
 *
 * ❌ NO: inventory write, services, suppliers, users, reports, branch settings
 *
 * Drop into App.jsx:  <Route path="/employee/*" element={<EmployeeDashboard />} />
 * Auth token stored in localStorage as "token" (same as owner + branch dashboards)
 * Set API_BASE to your backend URL before using.
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE  = "https://your-backend-url.vercel.app/api";
const TOKEN_KEY = "token";

// ─── API HELPER ──────────────────────────────────────────────────────────────
const api = async (path, opts = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useFetch(path, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true); setError(null);
    try   { setData(await api(path)); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

function useDebounce(v, ms = 380) {
  const [dv, set] = useState(v);
  useEffect(() => { const t = setTimeout(() => set(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return dv;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
let _addToast;
function ToastHost() {
  const [list, setList] = useState([]);
  _addToast = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setList(l => [...l, { id, msg, type }]);
    setTimeout(() => setList(l => l.filter(x => x.id !== id)), 3600);
  }, []);
  return (
    <div style={{ position:"fixed", bottom:22, right:22, zIndex:200, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {list.map(t => (
        <div key={t.id} style={{
          padding:"10px 16px", borderRadius:12, fontFamily:"var(--font-b)", fontWeight:700,
          fontSize:12, display:"flex", alignItems:"center", gap:9, pointerEvents:"all",
          maxWidth:320, border:"1px solid",
          background: t.type === "err" ? "rgba(239,68,68,.15)" : t.type === "warn" ? "rgba(234,179,8,.15)" : "rgba(255,77,0,.15)",
          borderColor: t.type === "err" ? "rgba(239,68,68,.3)" : t.type === "warn" ? "rgba(234,179,8,.3)" : "rgba(255,77,0,.35)",
          color: t.type === "err" ? "#EF4444" : t.type === "warn" ? "#EAB308" : "#FF6B2B",
          animation:"tIn .25s cubic-bezier(.34,1.56,.64,1)",
        }}>
          <span>{t.type === "err" ? "⚠" : "✓"}</span> {t.msg}
        </div>
      ))}
    </div>
  );
}
const toast = (msg, type) => _addToast?.(msg, type);

// ─── ICON ─────────────────────────────────────────────────────────────────────
const P = {
  dash: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  orders: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  appt: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M9 16l2 2 4-4",
  inv: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  prod: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  plus: "M12 5v14 M5 12h14",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  close: "M18 6 6 18 M6 6l12 12",
  check: "M20 6 9 17l-5-5",
  alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  cart: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
};
const Icon = ({ n, s = 16 }) => {
  const d = P[n] || P.dash;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => <path key={i} d={(i > 0 ? "M" : "") + seg} />)}
    </svg>
  );
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* ── Orange-black theme (matches Owner dashboard) ── */
    --bg:       #080809;
    --surf:     #0F0F11;
    --surf2:    #141416;
    --surf3:    #1A1A1D;
    --bdr:      rgba(255,255,255,0.06);
    --bdr2:     rgba(255,255,255,0.11);
    --text:     #F0EFE9;
    --muted:    #7A7977;
    --acc:      #FF4D00;   /* same orange as Owner */
    --acc2:     #FF6B2B;
    --green:    #22C55E;
    --yellow:   #EAB308;
    --red:      #EF4444;
    --blue:     #3B82F6;
    --purple:   #A855F7;
    --r1: 8px;  --r2: 14px;  --r3: 20px;  --r4: 28px;  --r5: 36px;
    --font-d: 'Bebas Neue', sans-serif;
    --font-b: 'DM Sans', sans-serif;
    --font-m: 'JetBrains Mono', monospace;
  }

  html, body, #root { height:100%; background:var(--bg); color:var(--text); font-family:var(--font-b); }
  ::-webkit-scrollbar { width:3px; height:3px; }
  ::-webkit-scrollbar-thumb { background:var(--bdr2); border-radius:99px; }
  @keyframes tIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
  @keyframes pulse2 { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.35)} }
  @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }

  /* ── Shell ── */
  .emp-shell { display:flex; height:100vh; overflow:hidden; }
  .emp-main  { flex:1; overflow-y:auto; display:flex; flex-direction:column; background:var(--bg); }

  /* ── Sidebar ── */
  .emp-sb {
    width:228px; min-width:228px; background:var(--surf);
    border-right:1px solid var(--bdr); display:flex;
    flex-direction:column; padding:24px 14px; overflow-y:auto;
  }
  .sb-logo { display:flex; align-items:center; gap:12px; margin-bottom:32px; padding:0 4px; }
  .sb-mark {
    width:38px; height:38px; background:var(--acc); border-radius:9px;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-d); font-size:18px; color:#fff; flex-shrink:0;
    box-shadow: 0 4px 14px rgba(255,77,0,.35);
  }
  .sb-wordmark { font-family:var(--font-d); font-size:21px; letter-spacing:.05em; line-height:1.1; }
  .sb-wordmark span { color:var(--acc); }
  .sb-sub { font-size:8px; font-weight:700; letter-spacing:.25em; color:var(--muted); text-transform:uppercase; margin-top:2px; }
  .sb-group-label {
    font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;
    color:var(--muted); padding:0 8px; margin:18px 0 6px;
    display:flex; align-items:center; gap:8px;
  }
  .sb-group-label::after { content:''; flex:1; height:1px; background:var(--bdr); }
  .sb-link {
    display:flex; align-items:center; gap:11px; padding:9px 10px;
    border-radius:var(--r1); cursor:pointer; transition:all .15s;
    color:var(--muted); font-weight:500; font-size:13px;
    border:1px solid transparent; position:relative;
  }
  .sb-link:hover { background:rgba(255,255,255,.04); color:var(--text); }
  .sb-link.on {
    background:linear-gradient(135deg,rgba(255,77,0,.18),rgba(255,77,0,.06));
    color:var(--text); border-color:rgba(255,77,0,.25);
  }
  .sb-link.on::before {
    content:''; position:absolute; left:-14px; top:50%; transform:translateY(-50%);
    width:3px; height:60%; background:var(--acc); border-radius:0 3px 3px 0;
  }
  .sb-link svg { flex-shrink:0; }
  .sb-badge {
    margin-left:auto; font-size:9px; font-weight:800; padding:2px 7px;
    background:var(--acc); color:#fff; border-radius:99px;
  }
  .sb-footer { margin-top:auto; padding-top:18px; border-top:1px solid var(--bdr); }
  .sb-user {
    display:flex; align-items:center; gap:10px; padding:10px 10px;
    background:var(--surf2); border-radius:var(--r2); border:1px solid var(--bdr); margin-bottom:8px;
  }
  .sb-av {
    width:32px; height:32px; border-radius:8px; background:var(--acc);
    display:flex; align-items:center; justify-content:center;
    font-weight:800; font-size:13px; color:#fff; flex-shrink:0;
  }
  .sb-uname { font-weight:700; font-size:12px; line-height:1.2; color:var(--text); }
  .sb-urole { font-size:9px; color:var(--acc); text-transform:uppercase; letter-spacing:.12em; font-weight:700; }
  .sb-logout {
    display:flex; align-items:center; gap:9px; padding:8px 10px;
    border-radius:var(--r1); cursor:pointer; color:var(--muted);
    font-size:12px; font-weight:600; transition:all .15s;
  }
  .sb-logout:hover { color:var(--red); background:rgba(239,68,68,.08); }

  /* ── Topbar ── */
  .emp-topbar {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 28px; border-bottom:1px solid var(--bdr);
    background:var(--surf); position:sticky; top:0; z-index:10; flex-shrink:0;
  }
  .topbar-left { display:flex; align-items:center; gap:12px; }
  .topbar-pg { font-family:var(--font-d); font-size:22px; letter-spacing:.06em; }
  .topbar-branch {
    font-size:10px; font-weight:700; color:var(--muted);
    text-transform:uppercase; letter-spacing:.15em;
    padding-left:12px; border-left:1px solid var(--bdr);
  }
  .live-chip {
    display:flex; align-items:center; gap:6px; padding:5px 12px;
    background:var(--surf2); border:1px solid var(--bdr); border-radius:99px;
    font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted);
  }
  .live-dot { width:6px; height:6px; background:var(--green); border-radius:50%; animation:pulse2 2s infinite; }

  /* ── Page wrapper ── */
  .page { padding:28px 28px 40px; animation:fadeUp .3s ease; }
  .ph { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:24px; }
  .ph-l .ey { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.2em; color:var(--acc); margin-bottom:5px; display:flex; align-items:center; gap:7px; }
  .ph-l .ey::before { content:''; display:inline-block; width:20px; height:2px; background:var(--acc); border-radius:2px; }
  .ph-l .ptitle { font-family:var(--font-d); font-size:38px; letter-spacing:.04em; line-height:1; }
  .ph-l .psub { color:var(--muted); font-size:13px; margin-top:4px; }
  .ph-r { display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; }

  /* ── Buttons ── */
  .btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:var(--r1); font-weight:600; font-size:12px; cursor:pointer; transition:all .15s; border:1px solid transparent; white-space:nowrap; font-family:var(--font-b); }
  .btn svg { width:14px; height:14px; }
  .btn-acc   { background:var(--acc); color:#fff; box-shadow:0 4px 14px rgba(255,77,0,.3); }
  .btn-acc:hover  { background:var(--acc2); box-shadow:0 4px 18px rgba(255,77,0,.4); }
  .btn-sec   { background:var(--surf2); border-color:var(--bdr2); color:var(--text); }
  .btn-sec:hover  { border-color:rgba(255,255,255,.2); }
  .btn-ghost { background:transparent; color:var(--muted); }
  .btn-ghost:hover { color:var(--text); background:rgba(255,255,255,.04); }
  .btn-danger{ background:rgba(239,68,68,.1); border-color:rgba(239,68,68,.3); color:var(--red); }
  .btn-danger:hover { background:var(--red); color:#fff; }
  .btn-sm { padding:6px 13px; font-size:11px; }
  .btn-xs { padding:4px 10px; font-size:10px; }
  .ico-btn {
    padding:7px; border-radius:var(--r1); background:var(--surf2);
    border:1px solid var(--bdr); color:var(--muted); cursor:pointer;
    transition:all .15s; display:inline-flex; align-items:center;
  }
  .ico-btn:hover       { color:var(--text); border-color:var(--bdr2); }
  .ico-btn.del:hover   { color:var(--red);  border-color:var(--red); }
  .ico-btn.save:hover  { color:var(--green); border-color:var(--green); }
  .btn[disabled], .ico-btn[disabled] { opacity:.38; cursor:not-allowed; }

  /* ── Cards ── */
  .card { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); }
  .ci   { padding:20px; }

  /* ── KPI grid ── */
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .kpi {
    background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3);
    padding:20px; position:relative; overflow:hidden; cursor:default;
    transition:border-color .2s, transform .15s;
  }
  .kpi:hover { border-color:var(--bdr2); transform:translateY(-1px); }
  .kpi-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
  .kpi-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.15em; color:var(--muted); margin-bottom:6px; }
  .kpi-val   { font-family:var(--font-d); font-size:34px; letter-spacing:.02em; line-height:1; }
  .kpi-note  { font-size:10px; font-weight:600; margin-top:4px; }
  .kpi-glow  { position:absolute; bottom:-45px; right:-20px; width:100px; height:100px; border-radius:50%; opacity:.07; filter:blur(32px); pointer-events:none; }

  /* ── Table ── */
  .tw { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); overflow:hidden; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:var(--surf2); border-bottom:1px solid var(--bdr); }
  th { padding:11px 16px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.15em; color:var(--muted); text-align:left; white-space:nowrap; }
  tbody tr { border-bottom:1px solid var(--bdr); transition:background .1s; }
  tbody tr:last-child { border-bottom:none; }
  tbody tr:hover { background:rgba(255,255,255,.02); }
  td { padding:11px 16px; font-size:13px; vertical-align:middle; }
  .td-act { display:flex; gap:5px; justify-content:flex-end; }

  /* ── Forms ── */
  .fg { margin-bottom:14px; }
  label { display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px; text-transform:uppercase; letter-spacing:.1em; }
  input, select, textarea {
    width:100%; padding:9px 12px; background:var(--surf2); border:1px solid var(--bdr2);
    border-radius:var(--r1); color:var(--text); font-family:var(--font-b); font-size:13px;
    outline:none; transition:border-color .15s;
  }
  input:focus, select:focus, textarea:focus { border-color:var(--acc); }
  select option { background:var(--surf2); }
  textarea { resize:vertical; min-height:70px; }
  .fr  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .fr3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }

  /* ── Modal ── */
  .mbk {
    position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(7px);
    z-index:100; display:flex; align-items:center; justify-content:center; padding:18px;
    animation:fadeUp .15s;
  }
  .mdl {
    background:var(--surf); border:1px solid var(--bdr2); border-radius:var(--r4);
    width:100%; max-width:540px; max-height:90vh; overflow-y:auto;
    animation:mdlIn .22s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes mdlIn { from{opacity:0;transform:translateY(24px) scale(.96)} to{opacity:1;transform:none} }
  .mdl.wide { max-width:660px; }
  .mh { padding:22px 24px 0; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .mt { font-family:var(--font-d); font-size:28px; letter-spacing:.04em; }
  .mb { padding:0 24px 24px; }
  .mf { padding:0 24px 24px; display:flex; justify-content:flex-end; gap:8px; }

  /* ── Confirm ── */
  .conf-bg { position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(5px); z-index:110; display:flex; align-items:center; justify-content:center; padding:18px; }
  .conf    { background:var(--surf); border:1px solid var(--bdr2); border-radius:var(--r4); padding:28px; max-width:360px; width:100%; animation:mdlIn .2s; }

  /* ── Badges ── */
  .badge { display:inline-flex; align-items:center; padding:2px 9px; border-radius:99px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; border:1px solid; }
  .b-g { background:rgba(34,197,94,.1);  color:var(--green);  border-color:rgba(34,197,94,.2);  }
  .b-r { background:rgba(239,68,68,.1);  color:var(--red);    border-color:rgba(239,68,68,.2);  }
  .b-y { background:rgba(234,179,8,.1);  color:var(--yellow); border-color:rgba(234,179,8,.2);  }
  .b-o { background:rgba(255,77,0,.1);   color:var(--acc);    border-color:rgba(255,77,0,.2);   }
  .b-b { background:rgba(59,130,246,.1); color:var(--blue);   border-color:rgba(59,130,246,.2); }
  .b-p { background:rgba(168,85,247,.1); color:var(--purple); border-color:rgba(168,85,247,.2); }

  /* ── Filter bar ── */
  .fbar { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
  .sw { flex:1; min-width:180px; position:relative; }
  .sw svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--muted); width:13px; height:13px; }
  .sw input { padding-left:30px; }

  /* ── Pagination ── */
  .pag { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid var(--bdr); }
  .pag-info { font-size:11px; color:var(--muted); }
  .pag-ctrl { display:flex; gap:4px; }
  .pb { padding:5px 11px; border-radius:var(--r1); background:var(--surf2); border:1px solid var(--bdr); font-size:11px; font-weight:600; cursor:pointer; color:var(--text); transition:all .15s; font-family:var(--font-b); }
  .pb:hover:not([disabled]) { border-color:var(--bdr2); }
  .pb.cur { background:var(--acc); border-color:var(--acc); color:#fff; }
  .pb[disabled] { opacity:.3; cursor:not-allowed; }

  /* ── Skeleton ── */
  .sk { background:linear-gradient(90deg,var(--surf2) 25%,rgba(255,255,255,.04) 50%,var(--surf2) 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; border-radius:var(--r1); }
  .sk-row { display:flex; gap:10px; margin-bottom:10px; }

  /* ── Empty ── */
  .empty { text-align:center; padding:48px 20px; color:var(--muted); }
  .empty svg { width:38px; height:38px; margin:0 auto 12px; opacity:.22; }
  .empty-t { font-weight:700; font-size:14px; margin-bottom:4px; }
  .empty-s { font-size:12px; }

  /* ── Tabs ── */
  .tabs { display:flex; gap:3px; background:var(--surf2); border:1px solid var(--bdr); padding:3px; border-radius:var(--r2); width:fit-content; }
  .tab  { padding:6px 14px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; color:var(--muted); }
  .tab.on { background:var(--acc); color:#fff; }
  .tab:hover:not(.on) { color:var(--text); }

  /* ── Products grid ── */
  .prod-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:14px; }
  .prod-card {
    background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3);
    padding:20px; transition:all .2s; position:relative; overflow:hidden;
  }
  .prod-card:hover { border-color:var(--bdr2); transform:translateY(-1px); }
  .prod-stripe { position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--acc),transparent); }

  /* ── Inventory grid ── */
  .inv-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:12px; }
  .inv-card { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); padding:18px; transition:border-color .2s; }
  .inv-card:hover { border-color:var(--bdr2); }
  .inv-card.low { border-color:rgba(239,68,68,.3); background:linear-gradient(135deg,rgba(239,68,68,.04),var(--surf)); }
  .inv-card.crit { border-color:rgba(239,68,68,.6); background:linear-gradient(135deg,rgba(239,68,68,.09),var(--surf)); }

  /* ── Bar chart ── */
  .bar-wrap { display:flex; align-items:flex-end; gap:5px; height:130px; }
  .bar-col  { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; min-width:0; }
  .bar-fill { width:100%; background:linear-gradient(to top,var(--acc),var(--acc2)); border-radius:4px 4px 0 0; min-height:3px; transition:height .6s cubic-bezier(.34,1.2,.64,1); }
  .bar-fill:hover { opacity:.8; }
  .bar-lb { font-size:8px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
  .bar-vl { font-size:8px; font-weight:700; color:var(--muted); }

  /* ── Responsive ── */
  @media(max-width:1024px) { .kpi-grid { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:768px)  { .emp-sb { display:none; } .page { padding:16px; } .kpi-grid { grid-template-columns:repeat(2,1fr); } }
  @media(max-width:480px)  { .kpi-grid { grid-template-columns:1fr; } .inv-grid { grid-template-columns:repeat(2,1fr); } }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const Sk = ({ w = "100%", h = 13, r = 5 }) =>
  <div className="sk" style={{ width: w, height: h, borderRadius: r }} />;

const TblSk = ({ rows = 5, cols = 5 }) => (
  <div style={{ padding: 16 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="sk-row">
        {Array.from({ length: cols }).map((_, j) => <Sk key={j} h={11} />)}
      </div>
    ))}
  </div>
);

const Modal = ({ title, onClose, children, footer, wide }) => (
  <div className="mbk" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={`mdl${wide ? " wide" : ""}`}>
      <div className="mh">
        <div className="mt">{title}</div>
        <button className="ico-btn" onClick={onClose}><Icon n="close" /></button>
      </div>
      <div className="mb">{children}</div>
      {footer && <div className="mf">{footer}</div>}
    </div>
  </div>
);

const Confirm = ({ msg, onYes, onNo }) => (
  <div className="conf-bg" onClick={onNo}>
    <div className="conf" onClick={e => e.stopPropagation()}>
      <div className="mt" style={{ marginBottom: 10 }}>Confirm</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>{msg}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button className="btn btn-sec btn-sm" onClick={onNo}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={onYes}>Delete</button>
      </div>
    </div>
  </div>
);

const ORDER_BADGE = { PENDING:"b-y", PROCESSING:"b-b", COMPLETED:"b-g", CANCELLED:"b-r" };
const APPT_BADGE  = { BOOKED:"b-b", IN_PROGRESS:"b-o", COMPLETED:"b-g", CANCELLED:"b-r" };

// ════════════════════════════════════════════════════════════════════════════
// PAGE 1 — DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function DashPage({ branchId, user }) {
  // Employee has access to all these endpoints
  const { data: pendingCount } = useFetch(`/orders/count?status=PENDING`, [branchId]);
  const { data: totalCount }   = useFetch(`/orders/count`, [branchId]);
  const { data: todayAppts }   = useFetch(`/appointments/today?branchId=${branchId}`, [branchId]);
  const { data: alerts }       = useFetch(`/inventory/alerts?branchId=${branchId}`, [branchId]);
  const { data: recent }       = useFetch(`/orders?limit=6&page=1`, [branchId]);

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

      {/* KPI row */}
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

      {/* Two-column info panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Today's appointments */}
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

        {/* Stock alerts panel */}
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

      {/* Recent orders */}
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

// ════════════════════════════════════════════════════════════════════════════
// PAGE 2 — ORDERS (View + Create + Update Status)
// ════════════════════════════════════════════════════════════════════════════
function OrdersPage({ branchId }) {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("");
  const [tab, setTab]       = useState("list"); // list | create
  const ds = useDebounce(status);
  const params = new URLSearchParams({ page, limit: 12, ...(status && { status }) }).toString();
  const { data, loading, refetch } = useFetch(`/orders?${params}`, [page, status]);

  // Create order form
  const { data: prods } = useFetch(`/products?branchId=${branchId}&limit=100`);
  const [orderForm, setOrderForm] = useState({ type: "POS", items: [{ productId: "", quantity: 1, price: "" }] });
  const [creating, setCreating]   = useState(false);
  const [updatingId, setUpdId]    = useState(null);

  const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

  const addItem = () => setOrderForm(f => ({ ...f, items: [...f.items, { productId: "", quantity: 1, price: "" }] }));
  const removeItem = i => setOrderForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }));
  const updateItem = (i, k, v) => setOrderForm(f => ({ ...f, items: f.items.map((it, j) => j === i ? { ...it, [k]: v } : it) }));

  // Auto-fill price when product is selected
  const pickProduct = (i, prodId) => {
    const prod = prods?.data?.find(p => String(p.id) === String(prodId));
    updateItem(i, "productId", prodId);
    if (prod) updateItem(i, "price", prod.price);
  };

  const calcTotal = () => orderForm.items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1), 0);

  const submitOrder = async () => {
    const items = orderForm.items.filter(i => i.productId && i.price);
    if (!items.length) return toast("Add at least one item with a product and price", "err");
    setCreating(true);
    try {
      await api("/orders", {
        method: "POST",
        body: {
          branchId: Number(branchId),
          type: orderForm.type,
          items: items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) || 1, price: parseFloat(i.price) })),
          total: calcTotal(),
        },
      });
      toast("Order created successfully");
      setOrderForm({ type: "POS", items: [{ productId: "", quantity: 1, price: "" }] });
      setTab("list"); refetch();
    } catch (e) { toast(e.message, "err"); }
    setCreating(false);
  };

  const updateStatus = async (id, newStatus) => {
    setUpdId(id);
    try {
      await api(`/orders/${id}/status`, { method: "PUT", body: { status: newStatus } });
      toast("Status updated");
      refetch();
    } catch (e) { toast(e.message, "err"); }
    setUpdId(null);
  };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Operations</div>
          <div className="ptitle">ORDER QUEUE</div>
          <div className="psub">Branch transactions · {data?.meta?.total || 0} total</div>
        </div>
        <div className="ph-r">
          <div className="tabs">
            <div className={`tab ${tab === "list" ? "on" : ""}`} onClick={() => setTab("list")}>All Orders</div>
            <div className={`tab ${tab === "create" ? "on" : ""}`} onClick={() => setTab("create")}>+ New Order</div>
          </div>
        </div>
      </div>

      {tab === "create" ? (
        /* ── Create order form ── */
        <div className="card ci" style={{ maxWidth: 700 }}>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 22, letterSpacing: ".04em", marginBottom: 20 }}>CREATE NEW ORDER</div>

          <div className="fg">
            <label>Order Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["POS", "ONLINE"].map(t => (
                <button key={t} className={`btn btn-sm ${orderForm.type === t ? "btn-acc" : "btn-sec"}`}
                  onClick={() => setOrderForm(f => ({ ...f, type: t }))}>
                  {t === "POS" ? "POS / In-Store" : "Online"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>
            Line Items
          </div>

          {orderForm.items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select value={item.productId} onChange={e => pickProduct(i, e.target.value)}>
                <option value="">— Select Product —</option>
                {(prods?.data || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min="1" value={item.quantity}
                onChange={e => updateItem(i, "quantity", e.target.value)} placeholder="Qty" />
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 12 }}>$</span>
                <input type="number" min="0" step="0.01" value={item.price}
                  onChange={e => updateItem(i, "price", e.target.value)} placeholder="0.00"
                  style={{ paddingLeft: 22 }} />
              </div>
              <button className="ico-btn del" onClick={() => removeItem(i)} disabled={orderForm.items.length === 1}>
                <Icon n="trash" s={13} />
              </button>
            </div>
          ))}

          <button className="btn btn-sec btn-sm" style={{ marginBottom: 16 }} onClick={addItem}>
            <Icon n="plus" /> Add Item
          </button>

          {orderForm.items.some(i => i.price && i.quantity) && (
            <div style={{ padding: "12px 16px", background: "rgba(255,77,0,.08)", border: "1px solid rgba(255,77,0,.18)", borderRadius: 10, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Order Total</span>
              <span style={{ fontFamily: "var(--font-d)", fontSize: 26, color: "var(--acc)" }}>${calcTotal().toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sec" onClick={() => setTab("list")}>Cancel</button>
            <button className="btn btn-acc" onClick={submitOrder} disabled={creating}>
              {creating ? "Creating…" : "Create Order"}
            </button>
          </div>
        </div>
      ) : (
        /* ── Orders list ── */
        <>
          <div className="fbar">
            <div className="tabs" style={{ marginBottom: 0 }}>
              {["", ...STATUSES].map(s => (
                <div key={s} className={`tab ${status === s ? "on" : ""}`}
                  onClick={() => { setStatus(s); setPage(1); }}>
                  {s || "All"}
                </div>
              ))}
            </div>
          </div>

          <div className="tw">
            {loading ? <TblSk rows={8} cols={6} /> : (
              <table>
                <thead>
                  <tr><th>Ref</th><th>Type</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th style={{ textAlign: "right" }}>Action</th></tr>
                </thead>
                <tbody>
                  {data?.data?.map(o => (
                    <tr key={o.id}>
                      <td><span style={{ fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 700, color: "var(--acc)" }}>#{o.id}</span></td>
                      <td><span className={`badge ${o.type === "ONLINE" ? "b-b" : "b-p"}`}>{o.type}</span></td>
                      <td style={{ fontSize: 12 }}>{o.customer?.name || "—"}</td>
                      <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-m)" }}>{o.items?.length || 0}</td>
                      <td style={{ fontWeight: 700, color: "var(--acc)" }}>${o.total?.toFixed(2)}</td>
                      <td><span className={`badge ${ORDER_BADGE[o.status] || "b-b"}`}>{o.status}</span></td>
                      <td style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-m)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="td-act">
                          <select
                            value={o.status}
                            onChange={e => updateStatus(o.id, e.target.value)}
                            disabled={updatingId === o.id}
                            style={{ width: 130, padding: "5px 8px", fontSize: 11 }}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data?.length === 0 && (
                    <tr><td colSpan={8}><div className="empty"><Icon n="orders" s={34} /><div className="empty-t">No orders found</div></div></td></tr>
                  )}
                </tbody>
              </table>
            )}
            <div className="pag">
              <div className="pag-info">Showing {data?.data?.length || 0} of {data?.meta?.total || 0}</div>
              <div className="pag-ctrl">
                <button className="pb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                {Array.from({ length: Math.min(data?.meta?.totalPages || 1, 5) }).map((_, i) => (
                  <button key={i} className={`pb ${page === i + 1 ? "cur" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="pb" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE 3 — APPOINTMENTS (View + Update Status/Tech — no create permission)
// ════════════════════════════════════════════════════════════════════════════
function AppointmentsPage({ branchId }) {
  const [tab, setTab]       = useState("today");
  const [page, setPage]     = useState(1);
  const [statusF, setStatusF] = useState("");

  const { data: todayData, loading: tl, refetch: refetchToday } =
    useFetch(`/appointments/today?branchId=${branchId}`, [branchId]);

  const allParams = new URLSearchParams({ branchId, page, limit: 12, ...(statusF && { status: statusF }) }).toString();
  const { data: allData, loading: al, refetch: refetchAll } =
    useFetch(`/appointments?${allParams}`, [page, statusF, branchId]);

  const [editAppt, setEditAppt] = useState(null); // { id, status, techId }
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

      {/* NOTE badge — employee cannot create appointments */}
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

// ════════════════════════════════════════════════════════════════════════════
// PAGE 4 — INVENTORY (Read-only + Alerts — Employee cannot write stock)
// ════════════════════════════════════════════════════════════════════════════
function InventoryPage({ branchId }) {
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

      {/* Read-only notice */}
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
          {showAlerts && (
            <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, color: "var(--red)" }}>
              ⚠ Showing {(alerts || []).length} low-stock items
            </div>
          )}
          <div className="inv-grid">
            {displayItems.map(item => {
              const isLow   = item.stock <= item.alertAt && item.stock > 0;
              const isCrit  = item.stock === 0;
              return (
                <div key={item.id} className={`inv-card ${isCrit ? "crit" : isLow ? "low" : ""}`}>
                  {/* Status bar */}
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
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 28, lineHeight: 1, color: isCrit ? "var(--red)" : isLow ? "var(--yellow)" : "var(--text)" }}>
                        {item.stock}
                      </div>
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
            {displayItems.length === 0 && (
              <div className="empty" style={{ gridColumn: "1/-1" }}>
                <Icon n="inv" s={36} />
                <div className="empty-t">{showAlerts ? "No low-stock alerts" : "No inventory found"}</div>
                <div className="empty-s">{showAlerts ? "All stock levels are healthy" : "Try searching with a different term"}</div>
              </div>
            )}
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

// ════════════════════════════════════════════════════════════════════════════
// PAGE 5 — PRODUCTS (Full CRUD — Employee has this permission)
// ════════════════════════════════════════════════════════════════════════════
function ProductsPage({ branchId }) {
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const ds = useDebounce(search);
  const params = new URLSearchParams({ branchId, page, limit: 16 }).toString();
  const { data, loading, refetch } = useFetch(`/products?${params}`, [branchId, page]);
  const { data: partsData }        = useFetch("/parts?limit=200");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [form, setForm]             = useState({ name: "", price: "", parts: [] });
  const [saving, setSaving]         = useState(false);

  const filtered = (data?.data || []).filter(p =>
    !ds || p.name?.toLowerCase().includes(ds.toLowerCase())
  );

  const openAdd  = () => { setForm({ name: "", price: "", parts: [] }); setEditTarget(null); setShowModal(true); };
  const openEdit = p  => { setForm({ name: p.name, price: p.price, parts: p.parts?.map(pp => ({ partId: pp.partId, quantity: pp.quantity })) || [] }); setEditTarget(p); setShowModal(true); };

  const addPart    = () => setForm(f => ({ ...f, parts: [...f.parts, { partId: "", quantity: 1 }] }));
  const remPart    = i  => setForm(f => ({ ...f, parts: f.parts.filter((_, j) => j !== i) }));
  const updPart    = (i, k, v) => setForm(f => ({ ...f, parts: f.parts.map((p, j) => j === i ? { ...p, [k]: v } : p) }));

  const submit = async () => {
    if (!form.name?.trim() || !form.price) return toast("Name and price are required", "err");
    setSaving(true);
    try {
      const body = {
        name: form.name,
        price: parseFloat(form.price),
        branchId: Number(branchId),
        parts: form.parts.filter(p => p.partId).map(p => ({ partId: Number(p.partId), quantity: Number(p.quantity) || 1 })),
      };
      if (editTarget) { await api(`/products/${editTarget.id}`, { method: "PUT", body }); toast("Product updated"); }
      else            { await api("/products", { method: "POST", body }); toast("Product created"); }
      setShowModal(false); refetch();
    } catch (e) { toast(e.message, "err"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await api(`/products/${id}`, { method: "DELETE" }); toast("Product deleted"); refetch(); }
    catch (e) { toast(e.message, "err"); }
    setConfirmId(null);
  };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Product Catalog</div>
          <div className="ptitle">PRODUCTS</div>
          <div className="psub">Maintenance kits &amp; bundles · {data?.meta?.total || 0} listed</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-acc" onClick={openAdd}><Icon n="plus" /> New Product</button>
        </div>
      </div>

      <div className="fbar">
        <div className="sw"><Icon n="search" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" /></div>
      </div>

      {loading ? (
        <div className="prod-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk" style={{ height: 185, borderRadius: 20 }} />)}</div>
      ) : (
        <div className="prod-grid">
          {filtered.map(p => (
            <div key={p.id} className="prod-card">
              <div className="prod-stripe" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, paddingTop: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(255,77,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)" }}>
                  <Icon n="tag" s={17} />
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="ico-btn" onClick={() => openEdit(p)}><Icon n="edit" s={13} /></button>
                  <button className="ico-btn del" onClick={() => setConfirmId(p.id)}><Icon n="trash" s={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 26, color: "var(--acc)", marginBottom: 10 }}>
                ${parseFloat(p.price).toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                {p.parts?.length || 0} component parts
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty" style={{ gridColumn: "1/-1" }}>
              <Icon n="prod" s={36} />
              <div className="empty-t">No products found</div>
              <div className="empty-s">Create your first product to get started</div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {(data?.meta?.totalPages || 1) > 1 && (
        <div className="pag" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", borderRadius: "var(--r3)", marginTop: 14 }}>
          <div className="pag-info">Page {page} · {data?.meta?.total || 0} total</div>
          <div className="pag-ctrl">
            <button className="pb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className="pb" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Product modal */}
      {showModal && (
        <Modal title={editTarget ? "EDIT PRODUCT" : "NEW PRODUCT"} onClose={() => setShowModal(false)} wide
          footer={<>
            <button className="btn btn-sec btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-acc btn-sm" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
          </>}
        >
          <div className="fr">
            <div className="fg"><label>Product Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Elite Road Bundle" /></div>
            <div className="fg">
              <label>Price (USD) *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 12 }}>$</span>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" style={{ paddingLeft: 22 }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginTop: 4 }}>
            Component Parts (optional)
          </div>
          {form.parts.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select value={p.partId} onChange={e => updPart(i, "partId", e.target.value)}>
                <option value="">— Select Part —</option>
                {(partsData?.data || []).map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
              <input type="number" min="1" value={p.quantity} onChange={e => updPart(i, "quantity", e.target.value)} placeholder="Qty" />
              <button className="ico-btn del" onClick={() => remPart(i)}><Icon n="trash" s={13} /></button>
            </div>
          ))}
          <button className="btn btn-sec btn-sm" style={{ marginTop: 2 }} onClick={addPart}><Icon n="plus" /> Add Part</button>
        </Modal>
      )}

      {confirmId && (
        <Confirm
          msg="Permanently delete this product? This action cannot be undone."
          onYes={() => remove(confirmId)}
          onNo={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SIDEBAR NAV
// ════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",     icon: "dash",  section: "Overview" },
  { id: "orders",       label: "Orders",        icon: "orders",section: "Work" },
  { id: "appointments", label: "Appointments",  icon: "appt",  section: "Work" },
  { id: "inventory",    label: "Inventory",     icon: "inv",   section: "Work" },
  { id: "products",     label: "Products",      icon: "prod",  section: "Work" },
];

// ════════════════════════════════════════════════════════════════════════════
// APP ROOT  (no login — assumes user prop is passed in, or reads from token)
// ════════════════════════════════════════════════════════════════════════════
export default function EmployeeDashboard({ user: userProp }) {
  const [user, setUser]       = useState(userProp || null);
  const [checked, setChecked] = useState(!!userProp);
  const [page, setPage]       = useState("dashboard");

  // Self-contained auth check (for standalone usage)
  useEffect(() => {
    if (userProp) { setUser(userProp); setChecked(true); return; }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setChecked(true); return; }
    api("/auth/me")
      .then(r => setUser(r.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecked(true));
  }, [userProp]);

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setUser(null); };

  // Loading spinner
  if (!checked) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 34, height: 34, border: "3px solid var(--acc)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    </>
  );

  // No user / wrong role guard
  if (!user || user.role !== "EMPLOYEE") return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-d)", fontSize: 48, color: "var(--acc)" }}>ACCESS DENIED</div>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>This portal is for EMPLOYEE accounts only.</div>
        <button className="btn btn-sec" onClick={() => { localStorage.removeItem(TOKEN_KEY); window.location.reload(); }}>Back to Login</button>
      </div>
    </>
  );

  const branchId   = user.branchId;
  const branchName = user.branchName || `Branch #${branchId}`;

  // Group nav sections
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  const current  = NAV_ITEMS.find(n => n.id === page) || NAV_ITEMS[0];

  const PAGES = {
    dashboard:    <DashPage         branchId={branchId} user={user} />,
    orders:       <OrdersPage       branchId={branchId} />,
    appointments: <AppointmentsPage branchId={branchId} />,
    inventory:    <InventoryPage    branchId={branchId} />,
    products:     <ProductsPage     branchId={branchId} />,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="emp-shell">

        {/* ── Sidebar ── */}
        <aside className="emp-sb">
          {/* Logo */}
          <div className="sb-logo">
            <div className="sb-mark">CE</div>
            <div>
              <div className="sb-wordmark">CROWN <span>EVE</span></div>
              <div className="sb-sub">Employee Portal</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1 }}>
            {sections.map(sec => (
              <div key={sec}>
                <div className="sb-group-label">{sec}</div>
                {NAV_ITEMS.filter(n => n.section === sec).map(n => (
                  <div key={n.id} className={`sb-link ${page === n.id ? "on" : ""}`} onClick={() => setPage(n.id)}>
                    <Icon n={n.icon} s={16} />
                    <span>{n.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="sb-footer">
            <div className="sb-user">
              <div className="sb-av">{user.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="sb-uname">{user.name}</div>
                <div className="sb-urole">Employee</div>
              </div>
            </div>
            <div className="sb-logout" onClick={logout}>
              <Icon n="logout" s={15} /> Sign Out
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="emp-main">
          {/* Topbar */}
          <div className="emp-topbar">
            <div className="topbar-left">
              <div className="topbar-pg">{current.label.toUpperCase()}</div>
              {branchName && <div className="topbar-branch">{branchName}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="live-chip"><span className="live-dot" />On Duty</div>
            </div>
          </div>

          {/* Page */}
          {PAGES[page] || PAGES.dashboard}
        </main>

      </div>

      <ToastHost />
    </>
  );
}
