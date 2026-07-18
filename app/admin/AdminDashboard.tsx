"use client";

import { CalendarDays, ChevronLeft, Clock3, LogOut, PartyPopper, Users } from "lucide-react";
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

const statuses = ["pending", "confirmed", "completed", "cancelled"];

export function AdminDashboard({
  user,
  reservations: initialReservations,
  events: initialEvents,
  signOutPath,
}: {
  user: { displayName: string; email: string };
  reservations: Reservation[];
  events: EventRequest[];
  signOutPath: string;
}) {
  const [activeTab, setActiveTab] = useState<"reservations" | "events">("reservations");
  const [reservations, setReservations] = useState(initialReservations);
  const [events, setEvents] = useState(initialEvents);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      pending: reservations.filter((item) => item.status === "pending").length,
      today: reservations.filter((item) => item.visitDate === new Date().toISOString().slice(0, 10)).length,
      events: events.filter((item) => item.status === "pending").length,
      covers: reservations
        .filter((item) => item.status !== "cancelled")
        .reduce((sum, item) => sum + item.guests, 0),
    }),
    [events, reservations],
  );

  const updateStatus = async (type: "reservation" | "event", id: string, status: string) => {
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
      } else {
        setEvents((items) => items.map((item) => item.id === id ? { ...item, status } : item));
      }
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
        <article><span>Booked covers</span><strong>{stats.covers}</strong><Users /></article>
      </section>

      <section className="admin-board">
        <div className="admin-tabs">
          <button className={activeTab === "reservations" ? "active" : ""} onClick={() => setActiveTab("reservations")}>
            Reservations <span>{reservations.length}</span>
          </button>
          <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>
            Events <span>{events.length}</span>
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
        ) : (
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
        )}
      </section>
    </main>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="admin-empty"><span>✦</span><p>{label}</p></div>;
}
