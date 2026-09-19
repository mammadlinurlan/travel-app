import { DuffelFlightProvider } from "./flights/duffel-flight-provider";
import type { FlightProvider } from "./flights/flight-provider";
import { MockFlightProvider } from "./flights/mock-flight-provider";
import { DuffelHotelProvider } from "./hotels/duffel-hotel-provider";
import type { HotelProvider } from "./hotels/hotel-provider";
import { LiteApiHotelProvider } from "./hotels/liteapi-hotel-provider";
import { MockHotelProvider } from "./hotels/mock-hotel-provider";
import { RateHawkHotelProvider } from "./hotels/ratehawk-hotel-provider";
import { MockTransferProvider } from "./transfers/mock-transfer-provider";
import { RateHawkTransferProvider } from "./transfers/ratehawk-transfer-provider";
import type { TransferProvider } from "./transfers/transfer-provider";

/**
 * Each product can be switched to live independently of the others — e.g.
 * Duffel Flights can be enabled on an account while Duffel Stays still
 * needs separate sales approval. FLIGHT/HOTEL/TRANSFER_PROVIDER_MODE each
 * fall back to the shared TRAVEL_PROVIDER_MODE when unset, so the simple
 * "one flag for everything" case still works.
 */
function isLive(specificMode: string | undefined): boolean {
  const mode = specificMode ?? process.env.TRAVEL_PROVIDER_MODE;
  return mode === "live";
}

export function getFlightProvider(): FlightProvider {
  if (isLive(process.env.FLIGHT_PROVIDER_MODE) && process.env.DUFFEL_API_KEY) {
    return new DuffelFlightProvider(process.env.DUFFEL_API_KEY);
  }
  return new MockFlightProvider();
}

export function getHotelProvider(): HotelProvider {
  const live = isLive(process.env.HOTEL_PROVIDER_MODE);
  if (live && process.env.RATEHAWK_API_KEY) {
    // Prefer RateHawk once available — its package-only rates are built for
    // tour-operator bundling and are typically cheaper than standalone rates.
    return new RateHawkHotelProvider(process.env.RATEHAWK_API_KEY);
  }
  if (live && process.env.LITEAPI_API_KEY) {
    return new LiteApiHotelProvider(process.env.LITEAPI_API_KEY);
  }
  if (live && process.env.DUFFEL_API_KEY) {
    return new DuffelHotelProvider(process.env.DUFFEL_API_KEY);
  }
  return new MockHotelProvider();
}

export function getTransferProvider(): TransferProvider {
  if (isLive(process.env.TRANSFER_PROVIDER_MODE) && process.env.RATEHAWK_API_KEY) {
    return new RateHawkTransferProvider(process.env.RATEHAWK_API_KEY);
  }
  return new MockTransferProvider();
}
