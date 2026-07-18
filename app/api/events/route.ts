import { getDb } from "../../../db";
import { eventRequests } from "../../../db/schema";

type EventPayload = {
  name?: string;
  phone?: string;
  email?: string;
  date?: string;
  guests?: number | string;
  eventType?: string;
  notes?: string;
  website?: string;
};

const clean = (value: unknown, max = 300) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EventPayload;
    if (clean(payload.website)) {
      return Response.json({ ok: true, reference: "EVENT-THANKYOU" }, { status: 201 });
    }

    const name = clean(payload.name, 80);
    const phone = clean(payload.phone, 24);
    const email = clean(payload.email, 120);
    const preferredDate = clean(payload.date, 10);
    const requestedGuests = Number.parseInt(String(payload.guests), 10);
    const guests = Number.isFinite(requestedGuests)
      ? Math.min(80, Math.max(4, requestedGuests))
      : 0;
    const eventType = clean(payload.eventType, 80);
    const notes = clean(payload.notes, 300);

    if (!name || phone.length < 8 || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || !guests || !eventType) {
      return Response.json({ error: "Please complete the required event details." }, { status: 400 });
    }

    const reference = `EVENT-${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`;
    const db = getDb();
    await db.insert(eventRequests).values({
      id: crypto.randomUUID(),
      reference,
      name,
      phone,
      email: email || null,
      preferredDate,
      guests,
      eventType,
      notes,
    });

    return Response.json({ ok: true, reference, status: "pending" }, { status: 201 });
  } catch {
    return Response.json(
      { error: "The event enquiry could not be saved right now. Please try again or call the café." },
      { status: 500 },
    );
  }
}
