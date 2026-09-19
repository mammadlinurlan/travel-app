import { type NextRequest, NextResponse } from "next/server";
import { travelStore } from "@/lib/server/store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = travelStore.getSearch(id);
  if (!result) {
    return NextResponse.json({ error: "Search not found." }, { status: 404 });
  }
  return NextResponse.json(result);
}
