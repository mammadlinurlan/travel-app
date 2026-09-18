import type { FlightOffer, HotelOffer, PriceBreakdown, Room, TransferOffer } from "./types";
import { PRICING_CONFIG } from "@/lib/config/pricing-config";

export function calculatePriceBreakdown(
  flight: FlightOffer,
  room: Room,
  transfer: TransferOffer | null
): PriceBreakdown {
  const supplierCost = flight.price.amount + room.price.amount + (transfer?.price.amount ?? 0);
  const markup = Math.max(
    Math.round(supplierCost * PRICING_CONFIG.markupPercentage),
    PRICING_CONFIG.minimumMarkup
  );

  return {
    flights: flight.price.amount,
    hotel: room.price.amount,
    transfer: transfer?.price.amount ?? 0,
    markup,
    total: supplierCost + markup,
    currency: flight.price.currency,
  };
}

export function cheapestRoomFor(hotel: HotelOffer): Room {
  return hotel.rooms.reduce((min, room) => (room.price.amount < min.price.amount ? room : min), hotel.rooms[0]);
}
