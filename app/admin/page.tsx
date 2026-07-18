import { desc } from "drizzle-orm";
import { getDb } from "../../db";
import { eventRequests, reservations } from "../../db/schema";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const db = getDb();
  const [reservationRows, eventRows] = await Promise.all([
    db.select().from(reservations).orderBy(desc(reservations.createdAt)).limit(100),
    db.select().from(eventRequests).orderBy(desc(eventRequests.createdAt)).limit(100),
  ]);

  return (
    <AdminDashboard
      user={{ displayName: user.displayName, email: user.email }}
      reservations={reservationRows}
      events={eventRows}
      signOutPath={chatGPTSignOutPath("/")}
    />
  );
}
