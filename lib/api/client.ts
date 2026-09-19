import type {
  Airport,
  CustomizationRequest,
  Offer,
  TravelPackage,
  TripSearchRequest,
  TripSearchResult,
} from "@/domain/travel/types";
import type { ParsedTripIntent } from "@/domain/travel/validation";

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }
  return response.json();
}

export async function searchTrips(request: TripSearchRequest): Promise<TripSearchResult> {
  const response = await fetch("/api/trips/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handle<TripSearchResult>(response);
}

export async function getSearch(searchId: string): Promise<TripSearchResult> {
  const response = await fetch(`/api/trips/search/${searchId}`);
  return handle<TripSearchResult>(response);
}

export async function getPackage(packageId: string): Promise<TravelPackage> {
  const response = await fetch(`/api/packages/${packageId}`);
  return handle<TravelPackage>(response);
}

export async function recalculatePackage(
  packageId: string,
  customization: CustomizationRequest,
): Promise<TravelPackage> {
  const response = await fetch(`/api/packages/${packageId}/recalculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customization),
  });
  return handle<TravelPackage>(response);
}

export interface OfferRequestPayload {
  packageId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export async function requestOffer(payload: OfferRequestPayload): Promise<Offer> {
  const response = await fetch("/api/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Offer>(response);
}

export async function searchAirports(query: string): Promise<Airport[]> {
  const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
  const body = await handle<{ airports: Airport[] }>(response);
  return body.airports;
}

export async function parseTripIntent(text: string): Promise<ParsedTripIntent> {
  const response = await fetch("/api/ai/parse-trip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handle<ParsedTripIntent>(response);
}

export interface VoiceTripParsePayload {
  audio: string; // base64-encoded recording
  mimeType: string;
}

export async function parseTripIntentFromVoice(
  payload: VoiceTripParsePayload,
): Promise<ParsedTripIntent> {
  const response = await fetch("/api/ai/parse-trip-voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<ParsedTripIntent>(response);
}
