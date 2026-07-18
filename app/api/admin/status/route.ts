import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { eventRequests, orderRequests, reservations } from "../../../../db/schema";

const allowedStatuses = new Set(["pending", "confirmed", "completed", "cancelled"]);
const allowedOrderStatuses = new Set(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]);

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    type?: "reservation" | "event" | "order";
    id?: string;
    status?: string;
  };
  const id = payload.id?.trim() ?? "";
  const status = payload.status?.trim() ?? "";

  const validStatus = payload.type === "order"
    ? allowedOrderStatuses.has(status)
    : allowedStatuses.has(status);
  if (!id || !payload.type || !validStatus) {
    return Response.json({ error: "Invalid status update." }, { status: 400 });
  }

  const db = getDb();
  if (payload.type === "reservation") {
    await db
      .update(reservations)
      .set({ status })
      .where(eq(reservations.id, id));
  } else if (payload.type === "event") {
    await db
      .update(eventRequests)
      .set({ status })
      .where(eq(eventRequests.id, id));
  } else {
    await db
      .update(orderRequests)
      .set({ status })
      .where(eq(orderRequests.id, id));
  }

  return Response.json({ ok: true, status });
}
