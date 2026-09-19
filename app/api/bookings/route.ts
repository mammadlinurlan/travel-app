import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { travelStore } from "@/lib/server/store";

const bookingRequestSchema = z.object({
  offerId: z.string().min(1),
});

/**
 * Mocked booking endpoint — payment processing and real supplier booking are
 * out of scope for the MVP (spec §35). Confirms the offer without charging
 * anything or contacting a supplier.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }

  const offer = travelStore.getOffer(parsed.data.offerId);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: randomUUID(),
    offerId: offer.id,
    status: "confirmed",
    confirmedAt: new Date().toISOString(),
    note: "Mock booking — no payment was processed.",
  });
}
