import { randomUUID } from "node:crypto";
import { calculatePriceBreakdown } from "./pricing";
import { categorizePackages, scorePackage } from "./ranking";
import type {
  FlightOffer,
  HotelOffer,
  Room,
  TransferOffer,
  TravelPackage,
  TripSearchRequest,
} from "./types";

export interface PackageEngineInput {
  request: TripSearchRequest;
  flights: FlightOffer[];
  hotels: HotelOffer[];
  transfers: TransferOffer[];
}

export interface PackageEngineResult {
  packages: TravelPackage[];
  warnings: string[];
}

// A generous safety net, not a binding constraint: flights and rooms-per-hotel
// are already capped above, so the real combination count stays well under
// this even with a couple dozen hotels.
const MAX_RAW_COMBINATIONS = 1000;

function travelerCount(request: TripSearchRequest): number {
  return request.travelers.adults + request.travelers.children;
}

const MAX_ROOMS_PER_HOTEL = 8;
const MAX_FLIGHTS = 5;

/**
 * Cheapest AND fastest flight per (airline, stop count), capped. Same
 * reasoning as compatibleRooms(): live flight search can return a couple
 * dozen offers that are mostly fare-class variants of the same handful of
 * physical flights — without this, the first flight in the array could pair
 * with every hotel and exhaust MAX_RAW_COMBINATIONS before a second flight
 * is ever tried, making every package show the same departure time.
 *
 * Keeping both the cheapest and the fastest per bucket (rather than just the
 * cheapest) means a "shortest flight" or price sort downstream actually has
 * distinct options to surface — a user who cares about duration, not just
 * price, gets a real alternative instead of everything collapsing to the
 * cheapest pick.
 */
function diverseFlights(flights: FlightOffer[]): FlightOffer[] {
  const cheapestByRoute = new Map<string, FlightOffer>();
  const fastestByRoute = new Map<string, FlightOffer>();
  for (const flight of flights) {
    const key = `${flight.outbound[0]?.airline}:${flight.stops}`;

    const cheapest = cheapestByRoute.get(key);
    if (!cheapest || flight.price.amount < cheapest.price.amount) {
      cheapestByRoute.set(key, flight);
    }

    const fastest = fastestByRoute.get(key);
    if (!fastest || flight.totalDurationMinutes < fastest.totalDurationMinutes) {
      fastestByRoute.set(key, flight);
    }
  }

  const byId = new Map<string, FlightOffer>();
  for (const flight of [...cheapestByRoute.values(), ...fastestByRoute.values()]) {
    byId.set(flight.id, flight);
  }

  return [...byId.values()].sort((a, b) => a.price.amount - b.price.amount).slice(0, MAX_FLIGHTS);
}

/**
 * Rooms a hotel offers that fit the traveler count, reduced to the cheapest
 * rate per (room type, meal plan) pair. Live hotel providers can return
 * dozens of rate plans per property (LiteAPI has returned 200+ for a single
 * hotel) — using all of them would let one hotel's rate plans consume the
 * entire MAX_RAW_COMBINATIONS budget before any other hotel is considered.
 * Keying on room type as well as meal plan (rather than meal plan alone)
 * keeps distinct room types (Deluxe/Standard/Suite) selectable instead of
 * collapsing them all into one cheapest room per meal plan.
 */
function compatibleRooms(hotel: HotelOffer, request: TripSearchRequest): Room[] {
  const count = travelerCount(request);
  const fitting = hotel.rooms.filter((room) => room.maxOccupancy >= count);

  const cheapestByRoomAndMealPlan = new Map<string, Room>();
  for (const room of fitting) {
    const key = `${room.name}:${room.mealPlan}`;
    const existing = cheapestByRoomAndMealPlan.get(key);
    if (!existing || room.price.amount < existing.price.amount) {
      cheapestByRoomAndMealPlan.set(key, room);
    }
  }

  return [...cheapestByRoomAndMealPlan.values()]
    .sort((a, b) => a.price.amount - b.price.amount)
    .slice(0, MAX_ROOMS_PER_HOTEL);
}

function selectTransferOptions(
  transfers: TransferOffer[],
  request: TripSearchRequest,
): (TransferOffer | null)[] {
  const count = travelerCount(request);
  const capacityMatched = transfers.filter((t) => t.maxPassengers >= count);

  if (request.preferences.transferRequired) {
    return capacityMatched.length > 0 ? capacityMatched : [null];
  }
  const cheapest = [...capacityMatched].sort((a, b) => a.price.amount - b.price.amount)[0];
  return cheapest ? [null, cheapest] : [null];
}

export function generatePackages(input: PackageEngineInput): PackageEngineResult {
  const { request, flights, hotels, transfers } = input;
  const warnings: string[] = [];

  if (flights.length === 0) warnings.push("no_flights_route");
  if (hotels.length === 0) warnings.push("no_hotels_dates");

  const flightsToUse = diverseFlights(flights);

  const preferredHotels = hotels.filter((h) => request.preferences.hotelStars.includes(h.stars));
  let hotelsToUse = preferredHotels;
  if (hotelsToUse.length === 0 && hotels.length > 0) {
    hotelsToUse = hotels;
    warnings.push("hotel_star_mismatch");
  }

  const transferOptions = selectTransferOptions(transfers, request);
  if (request.preferences.transferRequired && transferOptions.every((t) => t === null)) {
    warnings.push("transfer_unavailable");
  }

  const raw: TravelPackage[] = [];

  outer: for (const flight of flightsToUse) {
    for (const hotel of hotelsToUse) {
      const rooms = compatibleRooms(hotel, request);
      if (rooms.length === 0) continue;

      for (const room of rooms) {
        for (const transfer of transferOptions) {
          if (raw.length >= MAX_RAW_COMBINATIONS) break outer;

          const price = calculatePriceBreakdown(flight, room, transfer);
          raw.push({
            id: randomUUID(),
            destination: request.destination,
            flight,
            hotel,
            room,
            transfer,
            price,
            score: {
              total: 0,
              category: "alternative",
              reasons: [],
              breakdown: {
                price: 0,
                hotelQuality: 0,
                flightQuality: 0,
                location: 0,
                includedServices: 0,
                preferenceMatch: 0,
              },
            },
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  if (raw.length === 0) {
    return { packages: [], warnings: [...warnings, "no_complete_trip"] };
  }

  const candidates = dedupeSimilarPackages(raw);

  const priceRange = {
    min: Math.min(...candidates.map((p) => p.price.total)),
    max: Math.max(...candidates.map((p) => p.price.total)),
  };

  const scored = candidates.map((pkg) => ({
    ...pkg,
    score: scorePackage(pkg, request, priceRange),
  }));

  const categorized = categorizePackages(scored);

  return { packages: categorized, warnings };
}

/** Avoid showing near-identical packages (same hotel+flight, trivial transfer difference). */
function dedupeSimilarPackages(packages: TravelPackage[]): TravelPackage[] {
  const seen = new Set<string>();
  const result: TravelPackage[] = [];
  for (const pkg of packages) {
    const key = `${pkg.flight.id}:${pkg.hotel.id}:${pkg.room.mealPlan}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(pkg);
  }
  return result;
}
