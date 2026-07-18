import { getDb } from "../../../db";
import { guestFeedback } from "../../../db/schema";

const clean = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      phone?: string;
      rating?: string | number;
      message?: string;
      website?: string;
    };
    if (clean(payload.website)) {
      return Response.json({ ok: true }, { status: 201 });
    }

    const name = clean(payload.name, 80);
    const phone = clean(payload.phone, 24);
    const rating = Number.parseInt(String(payload.rating), 10);
    const message = clean(payload.message, 500);
    if (!name || !Number.isInteger(rating) || rating < 1 || rating > 5 || message.length < 5) {
      return Response.json({ error: "Add your name, rating and a short note." }, { status: 400 });
    }

    const db = getDb();
    await db.insert(guestFeedback).values({
      id: crypto.randomUUID(),
      name,
      phone: phone || null,
      rating,
      message,
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Your note could not be saved right now. Please try again." }, { status: 500 });
  }
}
