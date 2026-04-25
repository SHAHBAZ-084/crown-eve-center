// frontend/src/pages/dashboards/employee/EmployeeShared.jsx
import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
export const API_BASE  = "https://crown-eve-center.onrender.com/api";
export const TOKEN_KEY = "token";

// ─── API HELPER ──────────────────────────────────────────────────────────────
export const api = async (path, opts = {}) => {
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
export function useFetch(path, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true); setError(null);
    try   { setData(await api(path)); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }, [path, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

export function useDebounce(v, ms = 380) {
  const [dv, set] = useState(v);
  useEffect(() => { const t = setTimeout(() => set(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return dv;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
let _addToast;
export function ToastHost() {
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
export const toast = (msg, type) => _addToast?.(msg, type);

// ─── ICONS ─────────────────────────────────────────────────────────────────────
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
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
};

export const Icon = ({ n, s = 16 }) => {
  const d = P[n] || P.dash;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => <path key={i} d={(i > 0 ? "M" : "") + seg} />)}
    </svg>
  );
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export const Sk = ({ w = "100%", h = 13, r = 5 }) =>
  <div className="sk" style={{ width: w, height: h, borderRadius: r }} />;

export const TblSk = ({ rows = 5, cols = 5 }) => (
  <div style={{ padding: 16 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="sk-row">
        {Array.from({ length: cols }).map((_, j) => <Sk key={j} h={11} />)}
      </div>
    ))}
  </div>
);

export const Modal = ({ title, onClose, children, footer, wide }) => (
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

export const Confirm = ({ msg, onYes, onNo }) => (
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

export const ORDER_BADGE = { PENDING:"b-y", PROCESSING:"b-b", COMPLETED:"b-g", CANCELLED:"b-r" };
export const APPT_BADGE  = { BOOKED:"b-b", IN_PROGRESS:"b-o", COMPLETED:"b-g", CANCELLED:"b-r" };

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       #080809;
    --surf:     #0F0F11;
    --surf2:    #141416;
    --surf3:    #1A1A1D;
    --bdr:      rgba(255,255,255,0.06);
    --bdr2:     rgba(255,255,255,0.11);
    --text:     #F0EFE9;
    --muted:    #7A7977;
    --acc:      #FF4D00;
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
  .emp-shell { display:flex; height:100vh; overflow:hidden; }
  .emp-main  { flex:1; overflow-y:auto; display:flex; flex-direction:column; background:var(--bg); }
  .emp-sb { width:228px; min-width:228px; background:var(--surf); border-right:1px solid var(--bdr); display:flex; flex-direction:column; padding:24px 14px; overflow-y:auto; }
  .sb-logo { display:flex; align-items:center; gap:12px; margin-bottom:32px; padding:0 4px; }
  .sb-mark { width:38px; height:38px; background:var(--acc); border-radius:9px; display:flex; align-items:center; justify-content:center; font-family:var(--font-d); font-size:18px; color:#fff; flex-shrink:0; box-shadow: 0 4px 14px rgba(255,77,0,.35); }
  .sb-wordmark { font-family:var(--font-d); font-size:21px; letter-spacing:.05em; line-height:1.1; }
  .sb-wordmark span { color:var(--acc); }
  .sb-sub { font-size:8px; font-weight:700; letter-spacing:.25em; color:var(--muted); text-transform:uppercase; margin-top:2px; }
  .sb-group-label { font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--muted); padding:0 8px; margin:18px 0 6px; display:flex; align-items:center; gap:8px; }
  .sb-group-label::after { content:''; flex:1; height:1px; background:var(--bdr); }
  .sb-link { display:flex; align-items:center; gap:11px; padding:9px 10px; border-radius:var(--r1); cursor:pointer; transition:all .15s; color:var(--muted); font-weight:500; font-size:13px; border:1px solid transparent; position:relative; }
  .sb-link:hover { background:rgba(255,255,255,.04); color:var(--text); }
  .sb-link.on { background:linear-gradient(135deg,rgba(255,77,0,.18),rgba(255,77,0,.06)); color:var(--text); border-color:rgba(255,77,0,.25); }
  .sb-link.on::before { content:''; position:absolute; left:-14px; top:50%; transform:translateY(-50%); width:3px; height:60%; background:var(--acc); border-radius:0 3px 3px 0; }
  .sb-footer { margin-top:auto; padding-top:18px; border-top:1px solid var(--bdr); }
  .sb-user { display:flex; align-items:center; gap:10px; padding:10px 10px; background:var(--surf2); border-radius:var(--r2); border:1px solid var(--bdr); margin-bottom:8px; }
  .sb-av { width:32px; height:32px; border-radius:8px; background:var(--acc); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; color:#fff; flex-shrink:0; }
  .sb-uname { font-weight:700; font-size:12px; line-height:1.2; color:var(--text); }
  .sb-urole { font-size:9px; color:var(--acc); text-transform:uppercase; letter-spacing:.12em; font-weight:700; }
  .sb-logout { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:var(--r1); cursor:pointer; color:var(--muted); font-size:12px; font-weight:600; transition:all .15s; }
  .sb-logout:hover { color:var(--red); background:rgba(239,68,68,.08); }
  .emp-topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 28px; border-bottom:1px solid var(--bdr); background:var(--surf); position:sticky; top:0; z-index:10; flex-shrink:0; }
  .topbar-left { display:flex; align-items:center; gap:12px; }
  .topbar-pg { font-family:var(--font-d); font-size:22px; letter-spacing:.06em; }
  .topbar-branch { font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.15em; padding-left:12px; border-left:1px solid var(--bdr); }
  .live-chip { display:flex; align-items:center; gap:6px; padding:5px 12px; background:var(--surf2); border:1px solid var(--bdr); border-radius:99px; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
  .live-dot { width:6px; height:6px; background:var(--green); border-radius:50%; animation:pulse2 2s infinite; }
  .page { padding:28px 28px 40px; animation:fadeUp .3s ease; }
  .ph { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:24px; }
  .ph-l .ey { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.2em; color:var(--acc); margin-bottom:5px; display:flex; align-items:center; gap:7px; }
  .ph-l .ey::before { content:''; display:inline-block; width:20px; height:2px; background:var(--acc); border-radius:2px; }
  .ph-l .ptitle { font-family:var(--font-d); font-size:38px; letter-spacing:.04em; line-height:1; }
  .ph-l .psub { color:var(--muted); font-size:13px; margin-top:4px; }
  .ph-r { display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; }
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
  .ico-btn { padding:7px; border-radius:var(--r1); background:var(--surf2); border:1px solid var(--bdr); color:var(--muted); cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; }
  .ico-btn:hover       { color:var(--text); border-color:var(--bdr2); }
  .ico-btn.del:hover   { color:var(--red);  border-color:var(--red); }
  .ico-btn.save:hover  { color:var(--green); border-color:var(--green); }
  .btn[disabled], .ico-btn[disabled] { opacity:.38; cursor:not-allowed; }
  .card { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); }
  .ci   { padding:20px; }
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .kpi { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); padding:20px; position:relative; overflow:hidden; cursor:default; transition:border-color .2s, transform .15s; }
  .kpi:hover { border-color:var(--bdr2); transform:translateY(-1px); }
  .kpi-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
  .kpi-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.15em; color:var(--muted); margin-bottom:6px; }
  .kpi-val   { font-family:var(--font-d); font-size:34px; letter-spacing:.02em; line-height:1; }
  .kpi-note  { font-size:10px; font-weight:600; margin-top:4px; }
  .kpi-glow  { position:absolute; bottom:-45px; right:-20px; width:100px; height:100px; border-radius:50%; opacity:.07; filter:blur(32px); pointer-events:none; }
  .tw { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); overflow:hidden; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:var(--surf2); border-bottom:1px solid var(--bdr); }
  th { padding:11px 16px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.15em; color:var(--muted); text-align:left; white-space:nowrap; }
  tbody tr { border-bottom:1px solid var(--bdr); transition:background .1s; }
  tbody tr:last-child { border-bottom:none; }
  tbody tr:hover { background:rgba(255,255,255,.02); }
  td { padding:11px 16px; font-size:13px; vertical-align:middle; }
  .td-act { display:flex; gap:5px; justify-content:flex-end; }
  .fg { margin-bottom:14px; }
  label { display:block; font-size:11px; font-weight:700; color:var(--muted); margin-bottom:5px; text-transform:uppercase; letter-spacing:.1em; }
  input, select, textarea { width:100%; padding:9px 12px; background:var(--surf2); border:1px solid var(--bdr2); border-radius:var(--r1); color:var(--text); font-family:var(--font-b); font-size:13px; outline:none; transition:border-color .15s; }
  input:focus, select:focus, textarea:focus { border-color:var(--acc); }
  textarea { resize:vertical; min-height:70px; }
  .fr  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .mbk { position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(7px); z-index:100; display:flex; align-items:center; justify-content:center; padding:18px; animation:fadeUp .15s; }
  .mdl { background:var(--surf); border:1px solid var(--bdr2); border-radius:var(--r4); width:100%; max-width:540px; max-height:90vh; overflow-y:auto; animation:mdlIn .22s cubic-bezier(.34,1.56,.64,1); }
  @keyframes mdlIn { from{opacity:0;transform:translateY(24px) scale(.96)} to{opacity:1;transform:none} }
  .mdl.wide { max-width:660px; }
  .mh { padding:22px 24px 0; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .mt { font-family:var(--font-d); font-size:28px; letter-spacing:.04em; }
  .mb { padding:0 24px 24px; }
  .mf { padding:0 24px 24px; display:flex; justify-content:flex-end; gap:8px; }
  .badge { display:inline-flex; align-items:center; padding:2px 9px; border-radius:99px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; border:1px solid; }
  .b-g { background:rgba(34,197,94,.1);  color:var(--green);  border-color:rgba(34,197,94,.2);  }
  .b-r { background:rgba(239,68,68,.1);  color:var(--red);    border-color:rgba(239,68,68,.2);  }
  .b-y { background:rgba(234,179,8,.1);  color:var(--yellow); border-color:rgba(234,179,8,.2);  }
  .b-o { background:rgba(255,77,0,.1);   color:var(--acc);    border-color:rgba(255,77,0,.2);   }
  .b-b { background:rgba(59,130,246,.1); color:var(--blue);   border-color:rgba(59,130,246,.2); }
  .b-p { background:rgba(168,85,247,.1); color:var(--purple); border-color:rgba(168,85,247,.2); }
  .fbar { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
  .sw { flex:1; min-width:180px; position:relative; }
  .sw svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--muted); width:13px; height:13px; }
  .sw input { padding-left:30px; }
  .pag { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid var(--bdr); }
  .pag-info { font-size:11px; color:var(--muted); }
  .pag-ctrl { display:flex; gap:4px; }
  .pb { padding:5px 11px; border-radius:var(--r1); background:var(--surf2); border:1px solid var(--bdr); font-size:11px; font-weight:600; cursor:pointer; color:var(--text); transition:all .15s; font-family:var(--font-b); }
  .pb:hover:not([disabled]) { border-color:var(--bdr2); }
  .pb.cur { background:var(--acc); border-color:var(--acc); color:#fff; }
  .pb[disabled] { opacity:.3; cursor:not-allowed; }
  .sk { background:linear-gradient(90deg,var(--surf2) 25%,rgba(255,255,255,.04) 50%,var(--surf2) 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; border-radius:var(--r1); }
  .sk-row { display:flex; gap:10px; margin-bottom:10px; }
  .empty { text-align:center; padding:48px 20px; color:var(--muted); }
  .empty svg { width:38px; height:38px; margin:0 auto 12px; opacity:.22; }
  .empty-t { font-weight:700; font-size:14px; margin-bottom:4px; }
  .empty-s { font-size:12px; }
  .tabs { display:flex; gap:3px; background:var(--surf2); border:1px solid var(--bdr); padding:3px; border-radius:var(--r2); width:fit-content; }
  .tab  { padding:6px 14px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; color:var(--muted); }
  .tab.on { background:var(--acc); color:#fff; }
  .prod-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:14px; }
  .prod-card { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); padding:20px; transition:all .2s; position:relative; overflow:hidden; }
  .prod-card:hover { border-color:var(--bdr2); transform:translateY(-1px); }
  .prod-stripe { position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--acc),transparent); }
  .inv-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:12px; }
  .inv-card { background:var(--surf); border:1px solid var(--bdr); border-radius:var(--r3); padding:18px; transition:border-color .2s; }
  .inv-card:hover { border-color:var(--bdr2); }
  .inv-card.low { border-color:rgba(239,68,68,.3); background:linear-gradient(135deg,rgba(239,68,68,.04),var(--surf)); }
  .inv-card.crit { border-color:rgba(239,68,68,.6); background:linear-gradient(135deg,rgba(239,68,68,.09),var(--surf)); }
`;
