import type { Airport, Destination } from "@/domain/travel/types";
import { DuffelLocationProvider } from "./duffel-location-provider";

export interface LocationProvider {
  searchDestinations(query: string): Promise<Destination[]>;
  searchAirports(query: string): Promise<Airport[]>;
}

/**
 * Mock location provider backed by the same curated destination set used by
 * the mock travel providers. Swap for a Google Maps Platform-backed
 * implementation (Places Autocomplete + Geocoding) once GOOGLE_MAPS_API_KEY
 * is configured — keep it behind this interface so the UI never changes.
 */
export class MockLocationProvider implements LocationProvider {
  async searchDestinations(query: string): Promise<Destination[]> {
    const { listDestinations } = await import("@/providers/mock-data/destinations");
    const q = query.trim().toLowerCase();
    return listDestinations()
      .filter(
        (d) =>
          !q ||
          d.city.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q),
      )
      .map((d) => ({
        id: d.code,
        city: d.city,
        country: d.country,
        image: d.image,
        description: d.description,
      }));
  }

  async searchAirports(query: string): Promise<Airport[]> {
    const { listDestinations, ORIGIN } = await import("@/providers/mock-data/destinations");
    const q = query.trim().toLowerCase();
    const airports = [ORIGIN, ...listDestinations().map((d) => d.airport)];
    return airports.filter(
      (a) => !q || a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
    );
  }
}

export function getLocationProvider(): LocationProvider {
  const mode = process.env.LOCATION_PROVIDER_MODE ?? process.env.TRAVEL_PROVIDER_MODE;
  if (mode === "live" && process.env.DUFFEL_API_KEY) {
    return new DuffelLocationProvider(process.env.DUFFEL_API_KEY);
  }
  return new MockLocationProvider();
}
