// frontend/src/components/branch/BranchShared.jsx
import React, { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://crown-eve-center.onrender.com/api";
const TOKEN_KEY = "token";

// ─── API HELPER ──────────────────────────────────────────────────────────────
export const apiFetch = async (path, options = {}) => {
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
    try { setData(await apiFetch(path)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [path, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

export function useDebounce(val, ms = 400) {
  const [dv, setDv] = useState(val);
  useEffect(() => {
    const t = setTimeout(() => setDv(val), ms);
    return () => clearTimeout(t);
  }, [val, ms]);
  return dv;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const ICON_PATHS = {
  dashboard:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  orders:       "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  inventory:    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  products:     "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  services:     "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  appointments: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M9 16l2 2 4-4",
  suppliers:    "M1 3h15v13H1z M16 8l4 2v5h-4 M1 21h18 M5 18v3 M12 18v3",
  employees:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
  reports:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  plus:         "M12 5v14 M5 12h14",
  edit:         "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:        "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  search:       "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  logout:       "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  close:        "M18 6 6 18 M6 6l12 12",
  check:        "M20 6 9 17l-5-5",
  alert:        "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  download:     "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  refresh:      "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  dollar:       "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  arrow:        "M5 12h14 M12 5l7 7-7 7",
  chevL:        "M15 18l-6-6 6-6",
  chevR:        "M9 18l6-6-6-6",
  shield:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  tag:          "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  trend:        "M23 6l-9.5 9.5-5-5L1 18",
  user:         "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  wrench:       "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  clock:        "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2",
  truck:        "M1 3h15v13H1z M16 8l4 2v5h-4 M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  mail:         "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
};

export const Icon = ({ n, size = 16 }) => {
  const d = ICON_PATHS[n] || ICON_PATHS.dashboard;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => <path key={i} d={(i > 0 ? "M" : "") + seg} />)}
    </svg>
  );
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
let _toast;
export const ToastContainer = () => {
  const [list, setList] = useState([]);
  _toast = useCallback((msg, type = "s") => {
    const id = Date.now();
    setList(l => [...l, { id, msg, type }]);
    setTimeout(() => setList(l => l.filter(x => x.id !== id)), 3500);
  }, []);
  return (
    <div className="toast-c">
      {list.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <Icon n={t.type === "e" ? "alert" : "check"} size={14} /> {t.msg}
        </div>
      ))}
    </div>
  );
};
export const toast = (msg, type = "s") => _toast?.(msg, type);

// ─── MODAL ───────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, footer, wide }) => (
  <div className="mbk" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={`branch-modal${wide ? " wide" : ""}`}>
      <div className="mh">
        <div className="mt">{title}</div>
        <button className="btn-ico" onClick={onClose}><Icon n="close" /></button>
      </div>
      <div className="mb">{children}</div>
      {footer && <div className="mf">{footer}</div>}
    </div>
  </div>
);

// ─── CONFIRM ─────────────────────────────────────────────────────────────────
export const Confirm = ({ msg, onYes, onNo }) => (
  <div className="conf-overlay" onClick={onNo}>
    <div className="conf-box" onClick={e => e.stopPropagation()}>
      <div className="mt" style={{ marginBottom: 12 }}>Confirm</div>
      <div className="conf-msg">{msg}</div>
      <div className="conf-ftr">
        <button className="btn btn-s btn-sm" onClick={onNo}>Cancel</button>
        <button className="btn btn-d btn-sm" onClick={onYes}>Delete</button>
      </div>
    </div>
  </div>
);

// ─── SKELETON ────────────────────────────────────────────────────────────────
export const Sk = ({ w = "100%", h = 14, r = 5 }) => (
  <div className="sk" style={{ width: w, height: h, borderRadius: r }} />
);
export const TblSk = ({ rows = 5 }) => (
  <div style={{ padding: 16 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="sk-row">
        {[40, "100%", 80, 70, 60].map((w, j) => <Sk key={j} w={w} h={12} />)}
      </div>
    ))}
  </div>
);

// ─── BADGE MAP ────────────────────────────────────────────────────────────────
export const ORDER_BADGE   = { PENDING:"bg-y", PROCESSING:"bg-b", COMPLETED:"bg-g", CANCELLED:"bg-r" };
export const APPT_BADGE    = { BOOKED:"bg-b", IN_PROGRESS:"bg-o", COMPLETED:"bg-g", CANCELLED:"bg-r" };
export const ROLE_BADGE    = { BRANCH_OWNER:"bg-b", EMPLOYEE:"bg-g", TECHNICIAN:"bg-p", CUSTOMER:"bg-y", MANAGER:"bg-o", COMPANY_OWNER:"bg-o" };
