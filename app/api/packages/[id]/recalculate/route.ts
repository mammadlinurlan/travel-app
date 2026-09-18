import { NextRequest, NextResponse } from "next/server";
import { customizationSchema } from "@/domain/travel/validation";
import { RecalculationError, recalculatePackage } from "@/lib/server/recalculate-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = customizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid customization request.", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const updated = await recalculatePackage(id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof RecalculationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Recalculation failed", error);
    return NextResponse.json({ error: "We couldn't update the price right now." }, { status: 502 });
  }
}
