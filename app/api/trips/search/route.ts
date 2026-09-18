import { NextRequest, NextResponse } from "next/server";
import { tripSearchSchema } from "@/domain/travel/validation";
import { runTripSearch } from "@/lib/server/search-service";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = tripSearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search request.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await runTripSearch(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Trip search failed", error);
    return NextResponse.json({ error: "We couldn't complete this search. Please try again." }, { status: 502 });
  }
}
