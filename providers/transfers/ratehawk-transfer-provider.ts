import type { TransferOffer } from "@/domain/travel/types";
import type { TransferProvider } from "./transfer-provider";

/**
 * RateHawk transfer provider — intentionally unimplemented.
 * Same reasoning as RateHawkHotelProvider: transfer API availability and
 * account permissions must be verified against current docs before writing
 * a real integration. Falls back to MockTransferProvider until then.
 */
export class RateHawkTransferProvider implements TransferProvider {
  constructor(private readonly apiKey: string) {}

  async searchTransfers(): Promise<TransferOffer[]> {
    throw new Error(
      "RateHawkTransferProvider is not implemented — verify transfer API availability against current RateHawk docs. Use TRAVEL_PROVIDER_MODE=mock."
    );
  }
}
