import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { loyaltyMembers } from "../../../db/schema";

const clean = (value: unknown, max = 80) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const normalizePhone = (value: string) => value.replace(/\D/g, "").slice(-10);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { name?: string; phone?: string; website?: string };
    if (clean(payload.website)) {
      return Response.json({ ok: true, code: "PASS-THANKYOU", visits: 0, rewards: 0 }, { status: 201 });
    }

    const name = clean(payload.name, 80);
    const phone = normalizePhone(clean(payload.phone, 24));
    if (!name || phone.length !== 10) {
      return Response.json({ error: "Enter your name and a valid 10-digit phone number." }, { status: 400 });
    }

    const db = getDb();
    const [existing] = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.phone, phone)).limit(1);
    if (existing) {
      if (existing.name.toLocaleLowerCase() !== name.toLocaleLowerCase()) {
        return Response.json({ error: "We couldn’t match that name and phone number." }, { status: 404 });
      }
      return Response.json({
        ok: true,
        existing: true,
        code: existing.code,
        name: existing.name,
        visits: existing.visits,
        rewards: existing.rewards,
      });
    }

    const code = `PASS-${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`;
    await db.insert(loyaltyMembers).values({
      id: crypto.randomUUID(),
      code,
      name,
      phone,
    });

    return Response.json({ ok: true, code, name, visits: 0, rewards: 0 }, { status: 201 });
  } catch {
    return Response.json({ error: "Folha Passport is temporarily unavailable. Please try again." }, { status: 500 });
  }
}
