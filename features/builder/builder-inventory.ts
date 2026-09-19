import type {
  FlightOffer,
  HotelOffer,
  Room,
  TransferOffer,
  TravelPackage,
} from "@/domain/travel/types";

export interface FlightInventoryItem {
  flight: FlightOffer;
}

export interface HotelInventoryItem {
  hotel: HotelOffer;
  room: Room;
}

export interface TransferInventoryItem {
  transfer: TransferOffer;
}

export interface BuilderInventory {
  flights: FlightInventoryItem[];
  hotelRooms: HotelInventoryItem[];
  transfers: TransferInventoryItem[];
}

/**
 * Distinct flight/hotel-room/transfer options available for manual
 * selection, derived purely from the packages already returned by the
 * current search — no new provider calls, per spec.
 */
export function deriveBuilderInventory(packages: TravelPackage[]): BuilderInventory {
  const flights = new Map<string, FlightOffer>();
  const hotels = new Map<string, HotelOffer>();
  const transfers = new Map<string, TransferOffer>();

  for (const pkg of packages) {
    if (!flights.has(pkg.flight.id)) flights.set(pkg.flight.id, pkg.flight);
    if (!hotels.has(pkg.hotel.id)) hotels.set(pkg.hotel.id, pkg.hotel);
    if (pkg.transfer && !transfers.has(pkg.transfer.id))
      transfers.set(pkg.transfer.id, pkg.transfer);
  }

  const hotelRooms: HotelInventoryItem[] = [];
  const seenRooms = new Set<string>();
  for (const hotel of hotels.values()) {
    for (const room of hotel.rooms) {
      const key = `${hotel.id}::${room.id}`;
      if (seenRooms.has(key)) continue;
      seenRooms.add(key);
      hotelRooms.push({ hotel, room });
    }
  }

  return {
    flights: [...flights.values()].map((flight) => ({ flight })),
    hotelRooms,
    transfers: [...transfers.values()].map((transfer) => ({ transfer })),
  };
}

/** Seed package to drive the recalculate endpoint against — prefer the "cheapest" pick. */
export function pickSeedPackage(packages: TravelPackage[]): TravelPackage | undefined {
  return packages.find((pkg) => pkg.score.category === "cheapest") ?? packages[0];
}
