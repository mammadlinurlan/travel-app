import type { HotelOffer, MealPlan, Room } from "@/domain/travel/types";
import { resolveDestination } from "@/providers/mock-data/destinations";
import type { HotelProvider, HotelSearchRequest } from "./hotel-provider";

/**
 * Duffel Stays hotel provider. Server-side only.
 *
 * Two-step flow per Duffel's documented Stays API
 * (https://duffel.com/docs/guides/getting-started-with-stays,
 * https://duffel.com/docs/api/v2/search-result):
 *   1. POST /stays/search — geographic search, returns one result per
 *      accommodation with only the cheapest rate.
 *   2. POST /stays/search_results/:id/actions/fetch_all_rates — full
 *      room/rate list for one search result.
 *
 * Stays search takes coordinates + radius, not a destination code, so this
 * resolves our destination's known coordinates first (see
 * providers/mock-data/destinations.ts). Only the top candidates (by
 * cheapest rate) get a fetch_all_rates call, to keep search latency and
 * request volume bounded.
 */
const DUFFEL_API_BASE = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";
const SEARCH_RADIUS_KM = 8;
const MAX_ACCOMMODATIONS_TO_EXPAND = 6;

const BOARD_TYPE_MAP: Record<string, MealPlan> = {
  room_only: "room_only",
  self_catering: "room_only",
  breakfast: "breakfast",
  bed_and_breakfast: "breakfast",
  half_board: "half_board",
  full_board: "full_board",
  all_inclusive: "all_inclusive",
};

export class DuffelHotelProvider implements HotelProvider {
  constructor(private readonly apiKey: string) {}

  private async request<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${DUFFEL_API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Duffel-Version": DUFFEL_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Duffel Stays request to ${path} failed (${response.status})`);
    }
    return response.json();
  }

  async searchHotels(request: HotelSearchRequest): Promise<HotelOffer[]> {
    const profile = resolveDestination(request.destination);
    if (!profile) return [];

    const occupants = request.travelers.adults + request.travelers.children;

    const searchJson = await this.request<{ data: Record<string, unknown>[] }>("/stays/search", {
      data: {
        rooms: 1,
        check_in_date: request.checkIn,
        check_out_date: request.checkOut,
        guests: Array.from({ length: Math.max(occupants, 1) }, () => ({ type: "adult" })),
        location: {
          radius: SEARCH_RADIUS_KM,
          geographic_coordinates: {
            latitude: profile.coordinates.latitude,
            longitude: profile.coordinates.longitude,
          },
        },
      },
    });

    const results = (searchJson.data ?? [])
      .filter((r) => r.accommodation)
      .sort(
        (a, b) =>
          Number(a.cheapest_rate_total_amount ?? Infinity) -
          Number(b.cheapest_rate_total_amount ?? Infinity),
      )
      .slice(0, MAX_ACCOMMODATIONS_TO_EXPAND);

    const offers = await Promise.all(
      results.map((result) => this.expandSearchResult(result, occupants).catch(() => null)),
    );

    return offers.filter((offer): offer is HotelOffer => offer !== null);
  }

  private async expandSearchResult(
    searchResult: Record<string, unknown>,
    occupants: number,
  ): Promise<HotelOffer | null> {
    const accommodation = searchResult.accommodation as Record<string, unknown>;
    const searchResultId = String(searchResult.id);

    const ratesJson = await this.request<{ data: Record<string, unknown> }>(
      `/stays/search_results/${searchResultId}/actions/fetch_all_rates`,
      {},
    );

    const accommodationWithRooms = (ratesJson.data?.accommodation ?? accommodation) as Record<
      string,
      unknown
    >;
    const rawRooms = (accommodationWithRooms.rooms as Array<Record<string, unknown>>) ?? [];

    const rooms: Room[] = rawRooms.flatMap((room, roomIndex) => {
      const rates = (room.rates as Array<Record<string, unknown>>) ?? [];
      return rates.map((rate, rateIndex) =>
        mapRate(rate, room, `${searchResultId}-${roomIndex}-${rateIndex}`, occupants),
      );
    });

    if (rooms.length === 0) return null;

    const location = accommodation.location as Record<string, unknown> | undefined;
    const address = location?.address as Record<string, unknown> | undefined;
    const photos = (accommodation.photos as Array<{ url?: string }> | undefined) ?? [];

    return {
      id: String(accommodation.id),
      name: String(accommodation.name ?? "Hotel"),
      stars: clampStars(Number(accommodation.rating ?? 3)),
      rating: Number(accommodation.review_score ?? 0),
      reviewCount: Number(accommodation.review_count ?? 0),
      image: photos[0]?.url ?? "",
      images: photos.map((p) => p.url).filter((u): u is string => Boolean(u)),
      address: [address?.line_one, address?.city_name].filter(Boolean).join(", "),
      amenities: ((accommodation.amenities as Array<{ description?: string }> | undefined) ?? [])
        .map((a) => a.description)
        .filter((d): d is string => Boolean(d)),
      rooms,
      supplier: "duffel",
    };
  }
}

function mapRate(
  rate: Record<string, unknown>,
  room: Record<string, unknown>,
  id: string,
  occupants: number,
): Room {
  const cancellationTimeline =
    (rate.cancellation_timeline as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    id: `duffel-room-${id}`,
    name: String(room.name ?? "Room"),
    mealPlan: BOARD_TYPE_MAP[String(rate.board_type ?? "room_only")] ?? "room_only",
    maxOccupancy: Math.max(occupants, 1),
    refundable: cancellationTimeline.length > 0,
    cancellationDeadline: cancellationTimeline[0]?.before
      ? String(cancellationTimeline[0].before)
      : undefined,
    price: {
      amount: Number(rate.total_amount ?? 0),
      currency: (rate.total_currency as Room["price"]["currency"]) ?? "USD",
    },
  };
}

function clampStars(value: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(value);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as 2 | 3 | 4;
}
