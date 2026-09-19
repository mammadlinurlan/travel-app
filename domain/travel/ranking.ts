import { SCORING_WEIGHTS } from "@/lib/config/scoring-config";
import type {
  PackageCategory,
  PackageScore,
  ScoreReason,
  TravelPackage,
  TripSearchRequest,
} from "./types";

interface PriceRange {
  min: number;
  max: number;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function scorePrice(total: number, range: PriceRange): number {
  if (range.max === range.min) return 100;
  const normalized = (range.max - total) / (range.max - range.min);
  return clamp(normalized * 100);
}

function scoreHotelQuality(pkg: TravelPackage): number {
  const starScore = (pkg.hotel.stars / 5) * 60;
  const ratingScore = (pkg.hotel.rating / 10) * 40;
  return clamp(starScore + ratingScore);
}

function scoreFlightQuality(pkg: TravelPackage): number {
  const stopsScore = pkg.flight.stops === 0 ? 60 : pkg.flight.stops === 1 ? 35 : 15;
  const durationHours = pkg.flight.totalDurationMinutes / 60;
  const durationScore = clamp(40 - Math.max(0, durationHours - 6) * 4, 0, 40);
  return clamp(stopsScore + durationScore);
}

function scoreLocation(pkg: TravelPackage): number {
  const distance = pkg.hotel.beachDistanceMeters;
  if (distance === undefined) return 60;
  if (distance <= 50) return 100;
  if (distance <= 200) return 80;
  if (distance <= 500) return 55;
  return 25;
}

function scoreIncludedServices(pkg: TravelPackage): number {
  let score = 30;
  if (pkg.room.mealPlan !== "room_only") score += 30;
  if (pkg.room.mealPlan === "all_inclusive") score += 15;
  if (pkg.transfer) score += 25;
  return clamp(score);
}

function scorePreferenceMatch(pkg: TravelPackage, request: TripSearchRequest): number {
  let score = 50;
  if (request.preferences.hotelStars.includes(pkg.hotel.stars)) score += 50;
  return clamp(score);
}

export function scorePackage(
  pkg: TravelPackage,
  request: TripSearchRequest,
  priceRange: PriceRange,
): PackageScore {
  const breakdown = {
    price: scorePrice(pkg.price.total, priceRange),
    hotelQuality: scoreHotelQuality(pkg),
    flightQuality: scoreFlightQuality(pkg),
    location: scoreLocation(pkg),
    includedServices: scoreIncludedServices(pkg),
    preferenceMatch: scorePreferenceMatch(pkg, request),
  };

  const total = Math.round(
    breakdown.price * SCORING_WEIGHTS.price +
      breakdown.hotelQuality * SCORING_WEIGHTS.hotelQuality +
      breakdown.flightQuality * SCORING_WEIGHTS.flightQuality +
      breakdown.location * SCORING_WEIGHTS.location +
      breakdown.includedServices * SCORING_WEIGHTS.includedServices +
      breakdown.preferenceMatch * SCORING_WEIGHTS.preferenceMatch,
  );

  return {
    total,
    category: "alternative",
    reasons: buildReasons(pkg, breakdown, request),
    breakdown,
  };
}

function buildReasons(
  pkg: TravelPackage,
  breakdown: PackageScore["breakdown"],
  request: TripSearchRequest,
): ScoreReason[] {
  const reasons: ScoreReason[] = [];
  if (pkg.hotel.stars >= 4)
    reasons.push({ key: "topHotel", hotelStars: pkg.hotel.stars, hotelName: pkg.hotel.name });
  if (breakdown.location >= 80) reasons.push({ key: "closeToBeach" });
  if (pkg.flight.stops === 0) reasons.push({ key: "directFlight" });
  if (pkg.room.mealPlan !== "room_only")
    reasons.push({ key: "mealPlan", mealPlan: pkg.room.mealPlan });
  if (pkg.transfer) reasons.push({ key: "transferIncluded" });
  if (breakdown.price >= 80) reasons.push({ key: "greatPrice" });
  if (request.preferences.hotelStars.includes(pkg.hotel.stars))
    reasons.push({ key: "matchesStarPreference" });
  return reasons.slice(0, 4);
}

/** Assigns Cheapest / Best Value / Premium to the top-scoring candidates, rest become alternatives. */
export function categorizePackages(packages: TravelPackage[]): TravelPackage[] {
  if (packages.length === 0) return packages;

  const byPrice = [...packages].sort((a, b) => a.price.total - b.price.total);
  const cheapestId = byPrice[0].id;

  const byScore = [...packages].sort((a, b) => b.score.total - a.score.total);
  const bestValueId = byScore.find((p) => p.id !== cheapestId)?.id ?? byScore[0].id;

  const byPremium = [...packages].sort((a, b) => {
    if (b.hotel.stars !== a.hotel.stars) return b.hotel.stars - a.hotel.stars;
    return b.price.total - a.price.total;
  });
  const premiumId =
    byPremium.find((p) => p.id !== cheapestId && p.id !== bestValueId)?.id ?? byPremium[0].id;

  return packages
    .map((pkg) => {
      let category: PackageCategory = "alternative";
      if (pkg.id === cheapestId) category = "cheapest";
      else if (pkg.id === bestValueId) category = "best_value";
      else if (pkg.id === premiumId) category = "premium";
      return { ...pkg, score: { ...pkg.score, category } };
    })
    .sort((a, b) => {
      const order: Record<PackageCategory, number> = {
        cheapest: 0,
        best_value: 1,
        premium: 2,
        alternative: 3,
      };
      if (order[a.score.category] !== order[b.score.category]) {
        return order[a.score.category] - order[b.score.category];
      }
      return b.score.total - a.score.total;
    });
}
