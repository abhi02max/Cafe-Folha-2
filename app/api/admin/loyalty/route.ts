import { eq, sql } from "drizzle-orm";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { loyaltyMembers } from "../../../../db/schema";

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const payload = (await request.json()) as { id?: string; action?: "stamp" | "redeem" };
  const id = payload.id?.trim() ?? "";
  if (!id || !["stamp", "redeem"].includes(payload.action ?? "")) {
    return Response.json({ error: "Invalid Passport update." }, { status: 400 });
  }

  const db = getDb();
  if (payload.action === "stamp") {
    await db.update(loyaltyMembers)
      .set({ visits: sql`${loyaltyMembers.visits} + 1` })
      .where(eq(loyaltyMembers.id, id));
  } else {
    await db.update(loyaltyMembers)
      .set({
        visits: sql`CASE WHEN ${loyaltyMembers.visits} >= 5 THEN ${loyaltyMembers.visits} - 5 ELSE ${loyaltyMembers.visits} END`,
        rewards: sql`CASE WHEN ${loyaltyMembers.visits} >= 5 THEN ${loyaltyMembers.rewards} + 1 ELSE ${loyaltyMembers.rewards} END`,
      })
      .where(eq(loyaltyMembers.id, id));
  }

  const [member] = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.id, id)).limit(1);
  return Response.json({ ok: true, member });
}
