/**
 * Core domain models. Provider-agnostic — Duffel/RateHawk/mock responses are
 * normalized into these shapes before anything else in the app sees them.
 */

export type Currency = "AZN" | "USD" | "EUR" | "GBP" | "TRY";

export interface Money {
  amount: number;
  currency: Currency;
}

export interface Airport {
  code: string; // IATA
  name: string;
  city: string;
  country: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  region?: string;
  image: string;
  description: string;
}

export interface Travelers {
  adults: number;
  children: number;
  infants: number;
}

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export type MealPlan = "room_only" | "breakfast" | "half_board" | "full_board" | "all_inclusive";

export interface Baggage {
  checked: number; // pieces included
  checkedWeightKg?: number;
  cabin: number;
}

export interface FlightSegment {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  durationMinutes: number;
  cabin: CabinClass;
}

export interface FlightOffer {
  id: string;
  outbound: FlightSegment[];
  inbound: FlightSegment[];
  stops: number;
  totalDurationMinutes: number;
  baggage: Baggage;
  price: Money;
  fareBrand: string;
  refundable: boolean;
  supplier: "duffel" | "mock";
}

export interface Room {
  id: string;
  name: string;
  mealPlan: MealPlan;
  maxOccupancy: number;
  refundable: boolean;
  cancellationDeadline?: string; // ISO
  price: Money; // for the whole stay
}

export interface HotelOffer {
  id: string;
  name: string;
  stars: 1 | 2 | 3 | 4 | 5;
  rating: number; // 0-10 guest rating
  reviewCount: number;
  image: string;
  images: string[];
  address: string;
  beachDistanceMeters?: number;
  centerDistanceMeters?: number;
  amenities: string[];
  rooms: Room[];
  supplier: "ratehawk" | "duffel" | "liteapi" | "mock";
}

export type TransferType = "private" | "shared" | "none";

export interface TransferOffer {
  id: string;
  type: TransferType;
  vehicle: string;
  maxPassengers: number;
  durationMinutes: number;
  price: Money;
  supplier: "ratehawk" | "mock";
}

export interface TripPreferences {
  hotelStars: number[]; // acceptable star ratings
  transferRequired: boolean;
  cabinClass: CabinClass;
}

export interface TripSearchRequest {
  origin: string; // airport/city code
  destination: string; // airport/city code
  departureDate: string; // ISO date
  returnDate: string; // ISO date
  travelers: Travelers;
  preferences: TripPreferences;
}

export interface PriceBreakdown {
  flights: number;
  hotel: number;
  transfer: number;
  activities?: number;
  markup: number;
  total: number;
  currency: Currency;
}

export type PackageCategory = "cheapest" | "best_value" | "premium" | "alternative";

export type ScoreReasonKey =
  | "topHotel"
  | "closeToBeach"
  | "directFlight"
  | "mealPlan"
  | "transferIncluded"
  | "greatPrice"
  | "matchesStarPreference";

export interface ScoreReason {
  key: ScoreReasonKey;
  hotelStars?: number;
  hotelName?: string;
  mealPlan?: MealPlan;
}

export interface PackageScore {
  total: number; // 0-100
  category: PackageCategory;
  reasons: ScoreReason[];
  breakdown: {
    price: number;
    hotelQuality: number;
    flightQuality: number;
    location: number;
    includedServices: number;
    preferenceMatch: number;
  };
}

export interface TravelPackage {
  id: string;
  destination: string;
  flight: FlightOffer;
  hotel: HotelOffer;
  room: Room;
  transfer: TransferOffer | null;
  price: PriceBreakdown;
  score: PackageScore;
  createdAt: string;
}

export interface TripSearchResult {
  searchId: string;
  status: "pending" | "completed" | "partial" | "failed";
  request: TripSearchRequest;
  packages: TravelPackage[];
  warnings: string[];
  createdAt: string;
}

export interface CustomizationRequest {
  hotelId?: string;
  roomId?: string;
  flightId?: string;
  transferId?: string | null;
}

export interface Offer {
  id: string;
  packageId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  status: "requested" | "confirmed" | "cancelled";
  createdAt: string;
}
