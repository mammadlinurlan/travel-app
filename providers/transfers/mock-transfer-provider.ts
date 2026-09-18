import type { TransferOffer } from "@/domain/travel/types";
import { hashSeed, mulberry32, range } from "@/lib/server/random";
import { resolveDestination } from "@/providers/mock-data/destinations";
import type { TransferProvider, TransferSearchRequest } from "./transfer-provider";

export class MockTransferProvider implements TransferProvider {
  async searchTransfers(request: TransferSearchRequest): Promise<TransferOffer[]> {
    const profile = resolveDestination(request.destination);
    if (!profile) return [];

    const rng = mulberry32(hashSeed(`transfer:${profile.code}`));
    const occupants = request.travelers.adults + request.travelers.children;

    const offers: TransferOffer[] = [
      {
        id: `transfer-${profile.code}-private`,
        type: "private",
        vehicle: occupants > 4 ? "Private Van" : "Private Sedan",
        maxPassengers: Math.max(4, occupants),
        durationMinutes: Math.round(range(rng, 25, 55)),
        price: { amount: Math.round(range(rng, 25, 45)), currency: "USD" },
        supplier: "mock",
      },
      {
        id: `transfer-${profile.code}-shared`,
        type: "shared",
        vehicle: "Shared Shuttle",
        maxPassengers: 12,
        durationMinutes: Math.round(range(rng, 45, 90)),
        price: { amount: Math.round(range(rng, 10, 18)) * Math.max(occupants, 1), currency: "USD" },
        supplier: "mock",
      },
    ];

    return offers;
  }
}
