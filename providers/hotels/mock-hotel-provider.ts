import type { HotelOffer, MealPlan, Room } from "@/domain/travel/types";
import { hashSeed, mulberry32, range } from "@/lib/server/random";
import { resolveDestination } from "@/providers/mock-data/destinations";
import type { HotelProvider, HotelSearchRequest } from "./hotel-provider";

const MEAL_MULTIPLIER: Record<MealPlan, number> = {
  room_only: 1,
  breakfast: 1.12,
  half_board: 1.3,
  full_board: 1.45,
  all_inclusive: 1.7,
};

function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export class MockHotelProvider implements HotelProvider {
  async searchHotels(request: HotelSearchRequest): Promise<HotelOffer[]> {
    const profile = resolveDestination(request.destination);
    if (!profile) return [];

    const nights = nightsBetween(request.checkIn, request.checkOut);
    const occupants = request.travelers.adults + request.travelers.children;
    const occupancyFactor = occupants > 2 ? 1 + (occupants - 2) * 0.35 : 1;

    const availableMealPlans: MealPlan[] = profile.beachDestination
      ? ["room_only", "breakfast", "half_board", "all_inclusive"]
      : ["room_only", "breakfast"];

    return profile.hotels.map((hotel, hotelIndex) => {
      const rng = mulberry32(hashSeed(`hotel:${profile.code}:${hotel.name}:${request.checkIn}`));

      const rooms: Room[] = availableMealPlans.map((mealPlan, mealIndex) => {
        const jitter = range(rng, 0.95, 1.05);
        const nightly = hotel.nightlyPriceUsd * MEAL_MULTIPLIER[mealPlan] * occupancyFactor * jitter;
        return {
          id: `room-${profile.code}-${hotelIndex}-${mealIndex}`,
          name: mealPlan === "room_only" ? "Deluxe Room" : "Deluxe Room with " + mealPlanLabel(mealPlan),
          mealPlan,
          maxOccupancy: Math.max(2, Math.min(4, occupants)),
          refundable: mealPlan !== "all_inclusive",
          cancellationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
          price: { amount: Math.round(nightly * nights), currency: "USD" },
        };
      });

      const offer: HotelOffer = {
        id: `hotel-${profile.code}-${hotelIndex}`,
        name: hotel.name,
        stars: hotel.stars,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        image: hotel.image,
        images: [hotel.image],
        address: hotel.address,
        beachDistanceMeters: hotel.beachDistanceMeters,
        centerDistanceMeters: hotel.centerDistanceMeters,
        amenities: hotel.amenities,
        rooms,
        supplier: "mock",
      };
      return offer;
    });
  }
}

function mealPlanLabel(plan: MealPlan): string {
  switch (plan) {
    case "breakfast":
      return "Breakfast";
    case "half_board":
      return "Half Board";
    case "full_board":
      return "Full Board";
    case "all_inclusive":
      return "All Inclusive";
    default:
      return "Room Only";
  }
}
