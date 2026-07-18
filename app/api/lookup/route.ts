import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { eventRequests, orderRequests, reservations } from "../../../db/schema";

const clean = (value: unknown, max = 80) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const phoneDigits = (value: string) => value.replace(/\D/g, "").slice(-10);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { reference?: string; phone?: string };
    const reference = clean(payload.reference).toUpperCase();
    const suppliedPhone = phoneDigits(clean(payload.phone, 24));
    if (reference.length < 8 || suppliedPhone.length < 8) {
      return Response.json({ error: "Enter your reference and booking phone number." }, { status: 400 });
    }

    const db = getDb();

    if (reference.startsWith("FOLHA-")) {
      const [item] = await db.select().from(reservations).where(eq(reservations.reference, reference)).limit(1);
      if (item && phoneDigits(item.phone) === suppliedPhone) {
        return Response.json({
          kind: "reservation",
          reference: item.reference,
          status: item.status,
          date: item.visitDate,
          time: item.visitTime,
          guests: item.guests,
          title: item.occasion,
        });
      }
    } else if (reference.startsWith("EVENT-")) {
      const [item] = await db.select().from(eventRequests).where(eq(eventRequests.reference, reference)).limit(1);
      if (item && phoneDigits(item.phone) === suppliedPhone) {
        return Response.json({
          kind: "event",
          reference: item.reference,
          status: item.status,
          date: item.preferredDate,
          guests: item.guests,
          title: item.eventType,
          passReady: item.status === "confirmed",
        });
      }
    } else if (reference.startsWith("ORDER-")) {
      const [item] = await db.select().from(orderRequests).where(eq(orderRequests.reference, reference)).limit(1);
      if (item && phoneDigits(item.phone) === suppliedPhone) {
        return Response.json({
          kind: "order",
          reference: item.reference,
          status: item.status,
          total: item.total,
          title: item.fulfillment,
          paymentStatus: item.paymentStatus,
        });
      }
    }

    return Response.json({ error: "We couldn’t match that reference and phone number." }, { status: 404 });
  } catch {
    return Response.json({ error: "Tracking is temporarily unavailable. Please try again." }, { status: 500 });
  }
}
