import { randomUUID } from "node:crypto";
import { generatePackages } from "@/domain/travel/package-engine";
import type { TripSearchRequest, TripSearchResult } from "@/domain/travel/types";
import { getFlightProvider, getHotelProvider, getTransferProvider } from "@/providers";
import { travelStore } from "./store";

export async function runTripSearch(request: TripSearchRequest): Promise<TripSearchResult> {
  const searchId = randomUUID();
  const warnings: string[] = [];

  const [flightsResult, hotelsResult, transfersResult] = await Promise.allSettled([
    getFlightProvider().searchFlights({
      origin: request.origin,
      destination: request.destination,
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      travelers: request.travelers,
      cabin: request.preferences.cabinClass,
    }),
    getHotelProvider().searchHotels({
      destination: request.destination,
      checkIn: request.departureDate,
      checkOut: request.returnDate,
      travelers: request.travelers,
      starRatings: request.preferences.hotelStars,
    }),
    getTransferProvider().searchTransfers({
      destination: request.destination,
      travelers: request.travelers,
    }),
  ]);

  const flights = flightsResult.status === "fulfilled" ? flightsResult.value : [];
  console.log("[search] flights from API:", JSON.stringify(flights.slice(0, 10), null, 2));
  if (flightsResult.status === "rejected") {
    console.error("Flight search failed", flightsResult.reason);
    warnings.push("Flights are temporarily unavailable. Try again shortly.");
  }

  const hotels = hotelsResult.status === "fulfilled" ? hotelsResult.value : [];
  console.log("[search] hotels from API:", JSON.stringify(hotels.slice(0, 10), null, 2));
  if (hotelsResult.status === "rejected") {
    console.error("Hotel search failed", hotelsResult.reason);
    warnings.push("Hotels are temporarily unavailable. Try again shortly.");
  }

  const transfers = transfersResult.status === "fulfilled" ? transfersResult.value : [];
  if (transfersResult.status === "rejected") {
    console.error("Transfer search failed", transfersResult.reason);
    warnings.push("We couldn't find live transfer options. You can continue without a transfer.");
  }

  const engineResult = generatePackages({ request, flights, hotels, transfers });
  const allWarnings = [...warnings, ...engineResult.warnings];

  const result: TripSearchResult = {
    searchId,
    status: engineResult.packages.length > 0 ? (allWarnings.length > 0 ? "partial" : "completed") : "failed",
    request,
    packages: engineResult.packages,
    warnings: allWarnings,
    createdAt: new Date().toISOString(),
  };

  travelStore.saveSearch(result);
  return result;
}
