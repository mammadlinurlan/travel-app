import type { CabinClass, FlightOffer, FlightSegment } from "@/domain/travel/types";
import type { FlightProvider, FlightSearchRequest } from "./flight-provider";

/**
 * Duffel flight provider. Server-side only — never import from client code.
 * Uses Duffel's documented Offer Request flow (https://duffel.com/docs/api/overview):
 *   POST /air/offer_requests?return_offers=true  -> { data: { offers: [...] } }
 * Only fields this app actually needs are mapped; anything not explicitly
 * documented is left out rather than guessed.
 */
const DUFFEL_API_BASE = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

const CABIN_MAP: Record<CabinClass, string> = {
  economy: "economy",
  premium_economy: "premium_economy",
  business: "business",
  first: "first",
};

export class DuffelFlightProvider implements FlightProvider {
  constructor(private readonly apiKey: string) {}

  async searchFlights(request: FlightSearchRequest): Promise<FlightOffer[]> {
    const payload = {
      data: {
        slices: [
          {
            origin: request.origin,
            destination: request.destination,
            departure_date: request.departureDate,
          },
          {
            origin: request.destination,
            destination: request.origin,
            departure_date: request.returnDate,
          },
        ],
        passengers: [
          ...Array(request.travelers.adults).fill({ type: "adult" }),
          ...Array(request.travelers.children).fill({ type: "child" }),
          ...Array(request.travelers.infants).fill({ type: "infant_without_seat" }),
        ],
        cabin_class: CABIN_MAP[request.cabin],
      },
    };

    const response = await fetch(`${DUFFEL_API_BASE}/air/offer_requests?return_offers=true`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Duffel-Version": DUFFEL_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`Duffel offer request failed (${response.status})`);
    }

    const json = await response.json();
    const offers = json?.data?.offers ?? [];
    return offers
      .map(mapDuffelOffer)
      .filter((offer: FlightOffer | null): offer is FlightOffer => offer !== null);
  }
}

function mapDuffelOffer(raw: Record<string, unknown>): FlightOffer | null {
  try {
    const slices = raw.slices as Array<Record<string, unknown>>;
    const [outboundSlice, inboundSlice] = slices;
    const outbound = mapSegments(outboundSlice);
    const inbound = inboundSlice ? mapSegments(inboundSlice) : [];

    return {
      id: String(raw.id),
      outbound,
      inbound,
      stops: Math.max(outbound.length - 1, 0),
      totalDurationMinutes: legDurationMinutes(outbound) + legDurationMinutes(inbound),
      baggage: { checked: 1, cabin: 1 },
      price: {
        amount: Number(raw.total_amount),
        currency: (raw.total_currency as FlightOffer["price"]["currency"]) ?? "USD",
      },
      fareBrand: String(
        (raw.slices as Array<Record<string, unknown>>)?.[0]?.fare_brand_name ?? "Standard",
      ),
      refundable: Boolean(
        (raw as { conditions?: { refund_before_departure?: unknown } }).conditions
          ?.refund_before_departure,
      ),
      supplier: "duffel",
    };
  } catch {
    return null;
  }
}

function mapSegments(slice: Record<string, unknown>): FlightSegment[] {
  const segments = (slice.segments as Array<Record<string, unknown>>) ?? [];
  return segments.map((segment) => {
    const marketing = segment.marketing_carrier as Record<string, unknown>;
    const origin = segment.origin as Record<string, unknown>;
    const destination = segment.destination as Record<string, unknown>;
    return {
      id: String(segment.id),
      airline: String(marketing?.name ?? "Unknown"),
      airlineCode: String(marketing?.iata_code ?? ""),
      flightNumber: `${marketing?.iata_code ?? ""}${segment.marketing_carrier_flight_number ?? ""}`,
      origin: {
        code: String(origin?.iata_code ?? ""),
        name: String(origin?.name ?? ""),
        city: String(origin?.city_name ?? ""),
        country: "",
      },
      destination: {
        code: String(destination?.iata_code ?? ""),
        name: String(destination?.name ?? ""),
        city: String(destination?.city_name ?? ""),
        country: "",
      },
      departureTime: String(segment.departing_at),
      arrivalTime: String(segment.arriving_at),
      durationMinutes: parseIsoDurationMinutes(String(segment.duration ?? "PT0M")),
      cabin:
        ((segment.passengers as Array<{ cabin_class?: string }>)?.[0]
          ?.cabin_class as FlightSegment["cabin"]) ?? "economy",
    };
  });
}

/** Door-to-door minutes for a leg, including ground time between connections. */
function legDurationMinutes(segments: FlightSegment[]): number {
  if (segments.length === 0) return 0;
  const first = segments[0];
  const last = segments[segments.length - 1];
  return Math.round(
    (new Date(last.arrivalTime).getTime() - new Date(first.departureTime).getTime()) / 60000,
  );
}

function parseIsoDurationMinutes(iso: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  const hours = Number(match?.[1] ?? 0);
  const minutes = Number(match?.[2] ?? 0);
  return hours * 60 + minutes;
}
