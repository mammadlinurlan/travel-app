import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { offerRequestSchema } from "@/domain/travel/validation";
import { travelStore } from "@/lib/server/store";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = offerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid offer request.", issues: parsed.error.issues }, { status: 400 });
  }

  const pkg = travelStore.getPackage(parsed.data.packageId);
  if (!pkg) {
    return NextResponse.json({ error: "That package is no longer available." }, { status: 404 });
  }

  const offer = {
    id: randomUUID(),
    packageId: parsed.data.packageId,
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    customerPhone: parsed.data.customerPhone,
    notes: parsed.data.notes,
    status: "requested" as const,
    createdAt: new Date().toISOString(),
  };

  travelStore.saveOffer(offer);
  return NextResponse.json(offer, { status: 201 });
}
