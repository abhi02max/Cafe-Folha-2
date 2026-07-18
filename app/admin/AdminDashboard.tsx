"use client";

import { CalendarDays, ChevronLeft, Clock3, LogOut, PartyPopper, ShoppingBag, Sparkles, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";

type Reservation = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  visitDate: string;
  visitTime: string;
  guests: number;
  occasion: string;
  status: string;
  createdAt: string;
};

type EventRequest = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  guests: number;
  eventType: string;
  notes: string;
  status: string;
  createdAt: string;
};

type OrderRequest = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  fulfillment: string;
  address: string;
  items: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

type LoyaltyMember = {
  id: string;
  code: string;
  name: string;
  phone: string;
  visits: number;
  rewards: number;
  status: string;
  createdAt: string;
};

type GuestFeedback = {
  id: string;
  name: string;
  phone: string | null;
  rating: number;
  message: string;
  status: string;
  createdAt: string;
};

const statuses = ["pending", "confirmed", "completed", "cancelled"];
const orderStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

export function AdminDashboard({
  user,
  reservations: initialReservations,
  events: initialEvents,
  orders: initialOrders,
  members: initialMembers,
  feedback: initialFeedback,
  signOutPath,
}: {
  user: { displayName: string; email: string };
  reservations: Reservation[];
  events: EventRequest[];
  orders: OrderRequest[];
  members: LoyaltyMember[];
  feedback: GuestFeedback[];
  signOutPath: string;
}) {
  const [activeTab, setActiveTab] = useState<"reservations" | "events" | "orders" | "passport" | "feedback">("reservations");
  const [reservations, setReservations] = useState(initialReservations);
  const [events, setEvents] = useState(initialEvents);
  const [orders, setOrders] = useState(initialOrders);
  const [members, setMembers] = useState(initialMembers);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      pending: reservations.filter((item) => item.status === "pending").length,
      today: reservations.filter((item) => item.visitDate === new Date().toISOString().slice(0, 10)).length,
      events: events.filter((item) => item.status === "pending").length,
      orders: orders.filter((item) => !["completed", "cancelled"].includes(item.status)).length,
      covers: reservations
        .filter((item) => item.status !== "cancelled")
        .reduce((sum, item) => sum + item.guests, 0),
    }),
    [events, orders, reservations],
  );

  const updateStatus = async (type: "reservation" | "event" | "order" | "feedback", id: string, status: string) => {
    setBusyId(id);
    try {
      const response = await fetch("/api/admin/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, status }),
      });
      if (!response.ok) throw new Error("Status update failed");
      if (type === "reservation") {
        setReservations((items) => items.map((item) => item.id === id ? { ...item, status } : item));
      } else if (type === "event") {
        setEvents((items) => items.map((item) => item.id === id ? { ...item, status } : item));
      } else if (type === "order") {
        setOrders((items) => items.map((item) => item.id === id ? { ...item, status } : item));
      } else {
        setFeedback((items) => items.map((item) => item.id === id ? { ...item, status } : item));
      }
    } finally {
      setBusyId(null);
    }
  };

  const updatePassport = async (id: string, action: "stamp" | "redeem") => {
    setBusyId(id);
    try {
      const response = await fetch("/api/admin/loyalty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const result = await response.json() as { member?: LoyaltyMember };
      if (!response.ok || !result.member) throw new Error("Passport update failed");
      setMembers((items) => items.map((item) => item.id === id ? result.member! : item));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a href="/" className="admin-back"><ChevronLeft size={17} /> Website</a>
        <div className="admin-brand"><span>F</span> CAFÉ FOLHA · OPS</div>
        <div className="admin-user">
          <span>{user.displayName}</span>
          <a href={signOutPath} aria-label="Sign out"><LogOut size={17} /></a>
        </div>
      </header>

      <section className="admin-intro">
        <p>Owner operations</p>
        <h1>Good nights,<br /><em>well organised.</em></h1>
        <span>Signed in as {user.email}</span>
      </section>

      <section className="admin-stats">
        <article><span>Pending tables</span><strong>{stats.pending}</strong><CalendarDays /></article>
        <article><span>Today’s tables</span><strong>{stats.today}</strong><Clock3 /></article>
        <article><span>Event enquiries</span><strong>{stats.events}</strong><PartyPopper /></article>
        <article><span>Open orders</span><strong>{stats.orders}</strong><ShoppingBag /></article>
      </section>

      <section className="admin-board">
        <div className="admin-tabs">
          <button className={activeTab === "reservations" ? "active" : ""} onClick={() => setActiveTab("reservations")}>
            Reservations <span>{reservations.length}</span>
          </button>
          <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>
            Events <span>{events.length}</span>
          </button>
          <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
            Orders <span>{orders.length}</span>
          </button>
          <button className={activeTab === "passport" ? "active" : ""} onClick={() => setActiveTab("passport")}>
            Passport <span>{members.length}</span>
          </button>
          <button className={activeTab === "feedback" ? "active" : ""} onClick={() => setActiveTab("feedback")}>
            Feedback <span>{feedback.length}</span>
          </button>
        </div>

        {activeTab === "reservations" ? (
          <div className="admin-list">
            {reservations.length ? reservations.map((item) => (
              <article className="admin-record" key={item.id}>
                <div className="record-reference">
                  <span>{item.reference}</span>
                  <i className={`status ${item.status}`}>{item.status}</i>
                </div>
                <div className="record-main">
                  <h2>{item.name}</h2>
                  <p>{item.phone}{item.email ? ` · ${item.email}` : ""}</p>
                </div>
                <div className="record-facts">
                  <span><CalendarDays /> {item.visitDate}</span>
                  <span><Clock3 /> {item.visitTime}</span>
                  <span><Users /> {item.guests}</span>
                </div>
                <p className="record-note">{item.occasion}</p>
                <select
                  value={item.status}
                  disabled={busyId === item.id}
                  onChange={(event) => updateStatus("reservation", item.id, event.target.value)}
                  aria-label={`Update ${item.reference} status`}
                >
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </article>
            )) : <EmptyState label="No reservations yet." />}
          </div>
        ) : activeTab === "events" ? (
          <div className="admin-list">
            {events.length ? events.map((item) => (
              <article className="admin-record" key={item.id}>
                <div className="record-reference">
                  <span>{item.reference}</span>
                  <i className={`status ${item.status}`}>{item.status}</i>
                </div>
                <div className="record-main">
                  <h2>{item.name}</h2>
                  <p>{item.phone}{item.email ? ` · ${item.email}` : ""}</p>
                </div>
                <div className="record-facts">
                  <span><CalendarDays /> {item.preferredDate}</span>
                  <span><Users /> {item.guests}</span>
                  <span><PartyPopper /> {item.eventType}</span>
                </div>
                <p className="record-note">{item.notes || "No extra notes"}</p>
                <select
                  value={item.status}
                  disabled={busyId === item.id}
                  onChange={(event) => updateStatus("event", item.id, event.target.value)}
                  aria-label={`Update ${item.reference} status`}
                >
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </article>
            )) : <EmptyState label="No event enquiries yet." />}
          </div>
        ) : activeTab === "orders" ? (
          <div className="admin-list">
            {orders.length ? orders.map((item) => {
              const lines = parseOrderItems(item.items);
              return (
                <article className="admin-record order-record" key={item.id}>
                  <div className="record-reference">
                    <span>{item.reference}</span>
                    <i className={`status ${item.status}`}>{item.status}</i>
                  </div>
                  <div className="record-main">
                    <h2>{item.name}</h2>
                    <p>{item.phone} · {item.fulfillment}</p>
                  </div>
                  <div className="record-facts">
                    <span><ShoppingBag /> {lines.reduce((sum, line) => sum + line.quantity, 0)} items</span>
                    <span>₹{item.total}</span>
                    <span>{item.paymentStatus}</span>
                  </div>
                  <p className="record-note">
                    {lines.map((line) => `${line.quantity}× ${line.name}`).join(" · ")}
                    {item.address ? ` · ${item.address}` : ""}
                  </p>
                  <select
                    value={item.status}
                    disabled={busyId === item.id}
                    onChange={(event) => updateStatus("order", item.id, event.target.value)}
                    aria-label={`Update ${item.reference} status`}
                  >
                    {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </article>
              );
            }) : <EmptyState label="No order requests yet." />}
          </div>
        ) : activeTab === "passport" ? (
          <div className="admin-list">
            {members.length ? members.map((item) => (
              <article className="admin-record passport-record" key={item.id}>
                <div className="record-reference">
                  <span>{item.code}</span>
                  <i className="status confirmed">{item.status}</i>
                </div>
                <div className="record-main">
                  <h2>{item.name}</h2>
                  <p>{item.phone}</p>
                </div>
                <div className="record-facts">
                  <span><Sparkles /> {item.visits}/5 stamps</span>
                  <span><Star /> {item.rewards} redeemed</span>
                </div>
                <div className="passport-mini-stamps" aria-label={`${item.visits} of 5 stamps`}>
                  {[0, 1, 2, 3, 4].map((stamp) => <i key={stamp} className={stamp < item.visits ? "filled" : ""}>F</i>)}
                </div>
                <div className="record-actions">
                  <button disabled={busyId === item.id} onClick={() => updatePassport(item.id, "stamp")}>Add stamp</button>
                  <button disabled={busyId === item.id || item.visits < 5} onClick={() => updatePassport(item.id, "redeem")}>Redeem 5</button>
                </div>
              </article>
            )) : <EmptyState label="No Passport members yet." />}
          </div>
        ) : (
          <div className="admin-list">
            {feedback.length ? feedback.map((item) => (
              <article className="admin-record feedback-record" key={item.id}>
                <div className="record-reference">
                  <span>{item.createdAt.slice(0, 10)}</span>
                  <i className={`status ${item.status}`}>{item.status}</i>
                </div>
                <div className="record-main">
                  <h2>{item.name}</h2>
                  <p>{item.phone || "No phone shared"}</p>
                </div>
                <div className="record-facts">
                  <span className="feedback-stars">{Array.from({ length: item.rating }, () => "★").join("")}</span>
                </div>
                <p className="record-note">{item.message}</p>
                <select
                  value={item.status}
                  disabled={busyId === item.id}
                  onChange={(event) => updateStatus("feedback", item.id, event.target.value)}
                  aria-label={`Update ${item.name} feedback status`}
                >
                  {["new", "reviewed", "archived"].map((status) => <option key={status}>{status}</option>)}
                </select>
              </article>
            )) : <EmptyState label="No guest feedback yet." />}
          </div>
        )}
      </section>
    </main>
  );
}

function parseOrderItems(value: string): Array<{ name: string; quantity: number }> {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function EmptyState({ label }: { label: string }) {
  return <div className="admin-empty"><span>✦</span><p>{label}</p></div>;
}
