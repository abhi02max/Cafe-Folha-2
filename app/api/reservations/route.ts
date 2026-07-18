import { getDb } from "../../../db";
import { reservations } from "../../../db/schema";

type ReservationPayload = {
  name?: string;
  phone?: string;
  email?: string;
  date?: string;
  time?: string;
  guests?: number | string;
  occasion?: string;
  website?: string;
};

const clean = (value: unknown, max = 160) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReservationPayload;
    if (clean(payload.website)) {
      return Response.json({ ok: true, reference: "FOLHA-THANKYOU" }, { status: 201 });
    }

    const name = clean(payload.name, 80);
    const phone = clean(payload.phone, 24);
    const email = clean(payload.email, 120);
    const visitDate = clean(payload.date, 10);
    const visitTime = clean(payload.time, 5);
    const requestedGuests = Number.parseInt(String(payload.guests), 10);
    const guests = Number.isFinite(requestedGuests)
      ? Math.min(20, Math.max(1, requestedGuests))
      : 0;
    const occasion = clean(payload.occasion, 120) || "Regular visit";

    if (!name || phone.length < 8 || !/^\d{4}-\d{2}-\d{2}$/.test(visitDate) || !/^\d{2}:\d{2}$/.test(visitTime) || !guests) {
      return Response.json({ error: "Please complete the required booking details." }, { status: 400 });
    }

    const reference = `FOLHA-${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`;
    const db = getDb();
    await db.insert(reservations).values({
      id: crypto.randomUUID(),
      reference,
      name,
      phone,
      email: email || null,
      visitDate,
      visitTime,
      guests,
      occasion,
    });

    return Response.json({ ok: true, reference, status: "pending" }, { status: 201 });
  } catch {
    return Response.json(
      { error: "The reservation could not be saved right now. Please try again or call the café." },
      { status: 500 },
    );
  }
}
