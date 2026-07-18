import { getDb } from "../../../db";
import { orderRequests } from "../../../db/schema";
import { fullMenu } from "../../menu-data";

type OrderItem = {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
};

type OrderPayload = {
  name?: string;
  phone?: string;
  fulfillment?: string;
  address?: string;
  items?: OrderItem[];
  website?: string;
};

const clean = (value: unknown, max = 180) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as OrderPayload;
    if (clean(payload.website)) {
      return Response.json({ ok: true, reference: "ORDER-THANKYOU" }, { status: 201 });
    }

    const name = clean(payload.name, 80);
    const phone = clean(payload.phone, 24);
    const fulfillment = payload.fulfillment === "Delivery request" ? "Delivery request" : "Pickup";
    const address = clean(payload.address, 220);
    const menuById = new Map(fullMenu.map((item) => [item.id, item]));
    const items = Array.isArray(payload.items)
      ? payload.items.slice(0, 30).flatMap((item) => {
          const menuItem = menuById.get(clean(item.id, 80));
          if (!menuItem) return [];
          return [{
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: Math.max(1, Math.min(20, Number(item.quantity) || 1)),
          }];
        })
      : [];
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!name || phone.length < 8 || !items.length || total < 1 || (fulfillment === "Delivery request" && address.length < 8)) {
      return Response.json({ error: "Please complete the required order details." }, { status: 400 });
    }

    const reference = `ORDER-${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`;
    const db = getDb();
    await db.insert(orderRequests).values({
      id: crypto.randomUUID(),
      reference,
      name,
      phone,
      fulfillment,
      address,
      items: JSON.stringify(items),
      total,
    });

    return Response.json({ ok: true, reference, total, status: "pending" }, { status: 201 });
  } catch {
    return Response.json(
      { error: "The order could not be saved right now. Please try again or call the café." },
      { status: 500 },
    );
  }
}
