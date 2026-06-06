// frontend/src/pages/dashboards/customer/Dashboard.jsx v1.0.1-safe
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  CalendarDays,
  Banknote,
  Wrench,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { CustomerMeta } from "../../../components/customer/CustomerUI";
import NeuCardMarquee from "../../../components/customer/NeuCardMarquee";

const ACTIVE_STATUSES = ["PENDING", "PROCESSING", "pending", "processing"];

const STATUS_STEP = {
  PENDING: 1,
  PROCESSING: 2,
  CONFIRMED: 3,
  OUT_FOR_DELIVERY: 4,
  COMPLETED: 5,
};

const QUICK_ACTIONS = [
  { Icon: ShoppingBag, label: "Browse Shop", path: "/my/shop", marquee: ["Shop", "Explore", "Shop"] },
  { Icon: ClipboardList, label: "My Orders", path: "/my/orders", marquee: ["Orders", "Track", "Orders"] },
  { Icon: CalendarDays, label: "My Bookings", path: "/my/bookings", marquee: ["Bookings", "Schedule", "Bookings"] },
  { Icon: Wrench, label: "Book Service", path: "/my/book-service", marquee: ["Service", "Repair", "Service"] },
];

const STAT_MARQUEES = [
  ["Orders", "Active", "Orders"],
  ["Bookings", "Plans", "Bookings"],
  ["Spent", "Value", "Spent"],
  ["Service", "Done", "Service"],
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const toArr = (res) => { const d = res?.data?.data ?? res?.data; return Array.isArray(d) ? d : []; };

    api.get("/orders/my")
      .then(res => setOrders(toArr(res)))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
    
    api.get("/bookings")
      .then(res => setBookings(toArr(res)))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, []);

  const data = React.useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const activeOrders = safeOrders.filter(o => o && o.status && ACTIVE_STATUSES.includes(String(o.status)));
    const totalSpent = safeOrders
      .filter(o => o && (String(o.status).toUpperCase() === "COMPLETED"))
      .reduce((s, o) => s + (Number(o.total) || 0), 0);

    const upcomingBookings = safeBookings.filter(b => {
      if (!b) return false;
      const s = (b.status || "").toLowerCase();
      return s === "scheduled" || s === "pending";
    });

    const nextBooking = [...upcomingBookings].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0] || null;
    const recentOrder = [...safeOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
    const activeOrder = activeOrders[0] || null;

    return { totalOrders: safeOrders.length, activeOrders, totalSpent, upcomingBookings, nextBooking, recentOrder, activeOrder };
  }, [orders, bookings]);

  const { totalOrders, activeOrders, totalSpent, upcomingBookings, nextBooking, recentOrder, activeOrder } = data;

  const currentStep = STATUS_STEP[activeOrder?.status?.toUpperCase()] || 1;

  const fmtSpent = (n) => {
    if (typeof n !== 'number') return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toLocaleString();
  };

  const progressLabels = ["Placed", "Confirmed", "Preparing", "Delivery", "Done"];

  const firstName = user?.name?.split(" ")[0] || "Customer";
  const initials = (user?.name || "CE")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const heroLinks = [
    { label: "Browse Shop", path: "/my/shop", Icon: ShoppingBag, primary: true },
    { label: "My Orders", path: "/my/orders", Icon: ClipboardList },
    { label: "Book Service", path: "/my/book-service", Icon: Wrench },
  ];

  return (
    <div className="ce-page">
      <section className="welcome-banner ce-welcome-hero" aria-label="Account overview">
        <div className="ce-welcome-top">
          <div className="ce-welcome-user">
            <div className="ce-welcome-avatar" aria-hidden>{initials}</div>
            <div className="ce-welcome-user-text">
              <div className="welcome-banner-label">Welcome back</div>
              <h1>Hi, {firstName}</h1>
              <p className="welcome-banner-meta" title={user?.email}>
                {user?.email}
                <span className="ce-welcome-dot" aria-hidden>·</span>
                Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
              </p>
            </div>
          </div>
          <div className="ce-welcome-actions">
            {heroLinks.map(({ label, path, Icon, primary }) => (
              <button
                key={label}
                type="button"
                className={`ce-welcome-pill${primary ? " is-primary" : ""}`}
                onClick={() => navigate(path)}
              >
                <Icon size={15} strokeWidth={2} aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-row">
        <div className="stat">
          <NeuCardMarquee words={STAT_MARQUEES[0]} className="ce-neu-marquee--sm" />
          <div className="stat-content">
            <div className="si"><ShoppingBag size={28} strokeWidth={1.5} /></div>
            <div className="sl">Active Orders</div>
            <div className="sv">{loadingOrders ? "—" : activeOrders.length}</div>
            <span className="sc neu">{activeOrder ? `#${String(activeOrder.id).padStart(6, '0')} · ${activeOrder.status}` : "No active orders"}</span>
          </div>
        </div>
        <div className="stat">
          <NeuCardMarquee words={STAT_MARQUEES[1]} className="ce-neu-marquee--sm" />
          <div className="stat-content">
            <div className="si"><CalendarDays size={28} strokeWidth={1.5} /></div>
            <div className="sl">Total Bookings</div>
            <div className="sv">{loadingBookings ? "—" : (Array.isArray(bookings) ? bookings : []).length}</div>
            <span className="sc neu">{(Array.isArray(bookings) ? bookings : []).length > 0 ? "Lifetime requests" : "No bookings yet"}</span>
          </div>
        </div>
        <div className="stat">
          <NeuCardMarquee words={STAT_MARQUEES[2]} className="ce-neu-marquee--sm" />
          <div className="stat-content">
            <div className="si"><Banknote size={28} strokeWidth={1.5} /></div>
            <div className="sl">Total Spent</div>
            <div className="sv ce-sv-accent">{loadingOrders ? "—" : fmtSpent(totalSpent)}</div>
            <span className="sc neu">{totalOrders} order{totalOrders !== 1 ? "s" : ""} lifetime</span>
          </div>
        </div>
        <div className="stat">
          <NeuCardMarquee words={STAT_MARQUEES[3]} className="ce-neu-marquee--sm" />
          <div className="stat-content">
            <div className="si"><Wrench size={28} strokeWidth={1.5} /></div>
            <div className="sl">Services Done</div>
            <div className="sv">{loadingBookings ? "—" : (Array.isArray(bookings) ? bookings : []).filter(b => b && (b.status || "").toLowerCase() === "completed").length}</div>
            <span className="sc up">Completed services</span>
          </div>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 20 }}>
        <div className="card">
          <NeuCardMarquee words={["Order", "Track", "Order"]} className="ce-neu-marquee--sm" />
          <div className="card-neu-body">
          <div className="ch"><div className="ct">Active Order</div><button type="button" className="ca" onClick={() => navigate("/my/orders")}>View all →</button></div>
          {activeOrder ? (
            <>
              <div className="ce-panel" style={{ marginBottom: 16 }}>
                <div className="ce-panel-row" style={{ marginBottom: 12 }}>
                  <span className="mono" style={{ color: "var(--orange)", fontSize: 13 }}>#{String(activeOrder.id).padStart(6, '0')}</span>
                  <span className="badge bg-b">{activeOrder.status}</span>
                </div>
                <p className="ce-muted" style={{ marginBottom: 16 }}>
                  {(activeOrder.items || []).map(i => i.product?.name || i.name || "Product").join(", ") || "Order items"}
                </p>
                <div className="ce-panel-row">
                  <span className="ce-order-total">PKR {(activeOrder.total ?? 0).toLocaleString()}</span>
                  <button type="button" className="ca" onClick={() => navigate(`/my/track/${activeOrder.id}`)}>Track Order →</button>
                </div>
              </div>
              <div className="ce-progress">
                {[0, 1, 2, 3, 4].map((i) => {
                  const filled = (i + 1) <= currentStep;
                  const lineFilled = currentStep > i + 1;
                  return (
                    <React.Fragment key={i}>
                      <div className={`ce-progress-dot ${filled ? "is-done" : "is-pending"}`} />
                      {i < 4 && <div className={`ce-progress-line ${lineFilled ? "is-done" : "is-pending"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="ce-progress-labels">
                {progressLabels.map((label) => <span key={label}>{label}</span>)}
              </div>
            </>
          ) : (
            <div className="ce-empty-inline">
              <p className="ce-muted">No active orders.</p>
              <button type="button" className="ca" onClick={() => navigate("/my/shop")}>Browse shop →</button>
            </div>
          )}
          </div>
        </div>

        <div className="card">
          <NeuCardMarquee words={["Booking", "Service", "Booking"]} className="ce-neu-marquee--sm" />
          <div className="card-neu-body">
          <div className="ch"><div className="ct">Booking Status</div><button type="button" className="ca" onClick={() => navigate("/my/bookings")}>View all →</button></div>
          {bookings && bookings.length > 0 ? (
            (() => {
              const latest = bookings[0];
              return (
                <>
                  <div className="ce-booking-head">
                    <div className="ce-booking-icon"><Wrench size={20} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="ce-booking-title">{latest.service?.name || "General Maintenance"}</div>
                      <div className="ce-booking-sub">{latest.branch?.name || "Main Branch"}</div>
                    </div>
                    <span className="badge bg-o">{latest.status}</span>
                  </div>
                  <div className="g2" style={{ marginTop: 14 }}>
                    <CustomerMeta label="Requested Date" value={new Date(latest.booking_date).toLocaleDateString("en-PK", { dateStyle: "medium" })} />
                    <CustomerMeta label="Current Status" value={latest.status} highlight />
                  </div>
                </>
              );
            })()
          ) : (
            <div className="ce-empty-inline">
              <p className="ce-muted">No service requests.</p>
              <button type="button" className="ca" onClick={() => navigate("/my/book-service")}>Book service →</button>
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="ch" style={{ marginTop: 32 }}><div className="ct">Quick Actions</div></div>
      <div className="g4">
        {QUICK_ACTIONS.map(({ Icon, label, path, marquee }) => (
          <div
            key={label}
            role="button"
            tabIndex={0}
            className="quick-action-card"
            onClick={() => navigate(path)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(path); }}
          >
            <NeuCardMarquee words={marquee} className="ce-neu-marquee--sm" />
            <Icon size={28} color="var(--orange)" strokeWidth={1.5} />
            <div className="quick-action-label">{label}</div>
            <ChevronRight className="quick-action-chevron" size={12} aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
