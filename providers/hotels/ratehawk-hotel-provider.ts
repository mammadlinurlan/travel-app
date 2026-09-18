import type { HotelOffer } from "@/domain/travel/types";
import type { HotelProvider } from "./hotel-provider";

/**
 * RateHawk (Worldota) hotel provider — intentionally unimplemented.
 *
 * Per the project's provider rule, we never invent API endpoints or request/
 * response shapes. RateHawk's B2B API (https://www.ratehawk.com/lp/en-bg/API/)
 * requires a partner account and current API documentation to confirm the
 * search/booking/cancellation contract; neither was available while building
 * this provider. Wire this up once real docs and credentials are on hand —
 * until then TRAVEL_PROVIDER_MODE=live falls back to MockHotelProvider for
 * hotels so the rest of the app keeps working.
 */
export class RateHawkHotelProvider implements HotelProvider {
  constructor(private readonly apiKey: string) {}

  async searchHotels(): Promise<HotelOffer[]> {
    throw new Error(
      "RateHawkHotelProvider is not implemented — official API docs/credentials were not available at build time. Use TRAVEL_PROVIDER_MODE=mock."
    );
  }
}
