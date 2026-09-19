import { type NextRequest, NextResponse } from "next/server";
import { travelStore } from "@/lib/server/store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = travelStore.getPackage(id);
  if (!pkg) {
    return NextResponse.json({ error: "Package not found." }, { status: 404 });
  }
  return NextResponse.json(pkg);
}
