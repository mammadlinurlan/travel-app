import type { HotelOffer, MealPlan, Room } from "@/domain/travel/types";
import type { HotelProvider, HotelSearchRequest } from "./hotel-provider";

/**
 * LiteAPI (Nuitee Connect) hotel provider. Server-side only.
 *
 * Single-call search — unlike Duffel Stays, one POST to /hotels/rates
 * returns both hotel content and priced room rates together
 * (https://docs.liteapi.travel/reference/post_hotels-rates.md). Search
 * accepts an IATA airport code directly, which lines up with the airport
 * codes already used for flight search and our destination profiles.
 */
const LITEAPI_BASE = "https://api.liteapi.travel/v3.0";
const DEFAULT_GUEST_NATIONALITY = "AZ";
const MAX_HOTELS = 20;

const BOARD_TYPE_MAP: Record<string, MealPlan> = {
  RO: "room_only",
  BB: "breakfast",
  BI: "breakfast",
  HB: "half_board",
  FB: "full_board",
  AI: "all_inclusive",
  UAI: "all_inclusive",
};

interface LiteApiHotel {
  id: string;
  name: string;
  main_photo?: string;
  thumbnail?: string;
  address?: string;
  city_name?: string;
  rating?: number;
  stars?: number;
  review_count?: number;
}

interface LiteApiRate {
  rateId: string;
  name: string;
  boardType: string;
  maxOccupancy: number;
  retailRate: { total: { amount: number; currency: string }[] };
  cancellationPolicies?: {
    refundableTag?: "RFN" | "NRFN";
    cancelPolicyInfos?: { cancelTime?: string }[];
  };
}

interface LiteApiRoomType {
  rates: LiteApiRate[];
}

interface LiteApiHotelRates {
  hotelId: string;
  roomTypes: LiteApiRoomType[];
}

export class LiteApiHotelProvider implements HotelProvider {
  constructor(private readonly apiKey: string) {}

  async searchHotels(request: HotelSearchRequest): Promise<HotelOffer[]> {
    const occupants = request.travelers.adults + request.travelers.children;

    const response = await fetch(`${LITEAPI_BASE}/hotels/rates`, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkin: request.checkIn,
        checkout: request.checkOut,
        currency: "USD",
        guestNationality: DEFAULT_GUEST_NATIONALITY,
        occupancies: [{ adults: Math.max(request.travelers.adults, 1) }],
        iataCode: request.destination,
        starRating: request.starRatings,
        includeHotelData: true,
        limit: MAX_HOTELS,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`LiteAPI hotel search failed (${response.status})`);
    }

    const json: { hotels?: LiteApiHotel[]; data?: LiteApiHotelRates[] } = await response.json();
    const hotelsById = new Map((json.hotels ?? []).map((h) => [h.id, h]));

    return (json.data ?? [])
      .map((entry) => mapHotel(entry, hotelsById.get(entry.hotelId), occupants))
      .filter((offer): offer is HotelOffer => offer !== null);
  }
}

function mapHotel(entry: LiteApiHotelRates, hotel: LiteApiHotel | undefined, occupants: number): HotelOffer | null {
  if (!hotel) return null;

  const rooms: Room[] = entry.roomTypes.flatMap((roomType, roomIndex) =>
    roomType.rates.map((rate, rateIndex) => mapRate(rate, `${entry.hotelId}-${roomIndex}-${rateIndex}`, occupants))
  );
  if (rooms.length === 0) return null;

  return {
    id: hotel.id,
    name: hotel.name,
    stars: clampStars(hotel.stars ?? 3),
    rating: hotel.rating ?? 0,
    reviewCount: hotel.review_count ?? 0,
    image: hotel.main_photo ?? hotel.thumbnail ?? "",
    images: [hotel.main_photo, hotel.thumbnail].filter((u): u is string => Boolean(u)),
    address: [hotel.address, hotel.city_name].filter(Boolean).join(", "),
    amenities: [],
    rooms,
    supplier: "liteapi",
  };
}

function mapRate(rate: LiteApiRate, id: string, occupants: number): Room {
  const cancelInfo = rate.cancellationPolicies?.cancelPolicyInfos?.[0];
  return {
    id: `liteapi-room-${id}`,
    name: rate.name || "Room",
    mealPlan: BOARD_TYPE_MAP[rate.boardType] ?? "room_only",
    maxOccupancy: rate.maxOccupancy || Math.max(occupants, 1),
    refundable: rate.cancellationPolicies?.refundableTag === "RFN",
    cancellationDeadline: cancelInfo?.cancelTime,
    price: {
      amount: rate.retailRate?.total?.[0]?.amount ?? 0,
      currency: (rate.retailRate?.total?.[0]?.currency as Room["price"]["currency"]) ?? "USD",
    },
  };
}

function clampStars(value: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(value);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as 2 | 3 | 4;
}
