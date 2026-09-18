import { NextRequest, NextResponse } from "next/server";
import { getLocationProvider } from "@/providers/location/location-provider";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ airports: [] });
  }

  try {
    const airports = await getLocationProvider().searchAirports(query);
    return NextResponse.json({ airports: airports.slice(0, 8) });
  } catch (error) {
    console.error("Location search failed", error);
    return NextResponse.json({ airports: [] });
  }
}
