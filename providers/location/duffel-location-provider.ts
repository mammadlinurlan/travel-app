import type { Airport, Destination } from "@/domain/travel/types";
import type { LocationProvider } from "./location-provider";

/**
 * Duffel Places provider — server-side only.
 * https://duffel.com/docs/api/places/get-place-suggestions
 * GET /places/suggestions?query=... — 9,000+ airports/cities, ranked by
 * popularity. Only "airport" entries are surfaced: they always carry a
 * precise IATA code that both Duffel flight search and LiteAPI hotel
 * search accept, unlike some multi-airport city codes.
 */
const DUFFEL_API_BASE = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

interface DuffelPlace {
  id: string;
  type: "airport" | "city";
  name: string;
  iata_code: string | null;
  iata_country_code: string | null;
  city_name: string | null;
  latitude: number | null;
  longitude: number | null;
}

export class DuffelLocationProvider implements LocationProvider {
  constructor(private readonly apiKey: string) {}

  private async suggest(query: string): Promise<DuffelPlace[]> {
    const url = new URL(`${DUFFEL_API_BASE}/places/suggestions`);
    url.searchParams.set("query", query);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Duffel-Version": DUFFEL_VERSION,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error(`Duffel places search failed (${response.status})`);
    }

    const json: { data: DuffelPlace[] } = await response.json();
    return json.data ?? [];
  }

  async searchAirports(query: string): Promise<Airport[]> {
    const places = await this.suggest(query);
    return places
      .filter((p) => p.type === "airport" && p.iata_code)
      .map((p) => ({
        code: p.iata_code as string,
        name: p.name,
        city: p.city_name ?? p.name,
        country: p.iata_country_code ?? "",
      }));
  }

  async searchDestinations(query: string): Promise<Destination[]> {
    const airports = await this.searchAirports(query);
    const seenCities = new Set<string>();
    return airports
      .filter((a) => {
        const key = `${a.city}:${a.country}`;
        if (seenCities.has(key)) return false;
        seenCities.add(key);
        return true;
      })
      .map((a) => ({
        id: a.code,
        city: a.city,
        country: a.country,
        image: "",
        description: a.name,
      }));
  }
}
