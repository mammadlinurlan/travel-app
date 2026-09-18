import { calculatePriceBreakdown } from "@/domain/travel/pricing";
import type { CustomizationRequest, TravelPackage } from "@/domain/travel/types";
import { getFlightProvider, getHotelProvider, getTransferProvider } from "@/providers";
import { travelStore } from "./store";

export class RecalculationError extends Error {}

export async function recalculatePackage(
  packageId: string,
  customization: CustomizationRequest
): Promise<TravelPackage> {
  const current = travelStore.getPackage(packageId);
  if (!current) throw new RecalculationError("Package not found.");

  const search = travelStore.getSearchForPackage(packageId);
  if (!search) throw new RecalculationError("Original search context expired — please search again.");

  const { request } = search;
  const travelerCount = request.travelers.adults + request.travelers.children;

  const [flights, hotels, transfers] = await Promise.all([
    getFlightProvider().searchFlights({
      origin: request.origin,
      destination: request.destination,
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      travelers: request.travelers,
      cabin: request.preferences.cabinClass,
    }),
    getHotelProvider().searchHotels({
      destination: request.destination,
      checkIn: request.departureDate,
      checkOut: request.returnDate,
      travelers: request.travelers,
      starRatings: request.preferences.hotelStars,
    }),
    getTransferProvider().searchTransfers({ destination: request.destination, travelers: request.travelers }),
  ]);

  const flight = customization.flightId
    ? flights.find((f) => f.id === customization.flightId) ?? current.flight
    : current.flight;

  const hotel = customization.hotelId ? hotels.find((h) => h.id === customization.hotelId) : undefined;
  const activeHotel = hotel ?? current.hotel;

  let room = current.room;
  if (customization.roomId) {
    const found = activeHotel.rooms.find((r) => r.id === customization.roomId);
    if (!found) throw new RecalculationError("Selected room is no longer available.");
    room = found;
  } else if (hotel) {
    const fallback = hotel.rooms.find((r) => r.maxOccupancy >= travelerCount) ?? hotel.rooms[0];
    if (!fallback) throw new RecalculationError("Selected hotel has no available rooms.");
    room = fallback;
  }

  if (room.maxOccupancy < travelerCount) {
    throw new RecalculationError("Selected room doesn't fit your travelers.");
  }

  let transfer = current.transfer;
  if (customization.transferId === null) {
    transfer = null;
  } else if (customization.transferId) {
    const found = transfers.find((t) => t.id === customization.transferId);
    if (!found) throw new RecalculationError("Selected transfer is no longer available.");
    if (found.maxPassengers < travelerCount) {
      throw new RecalculationError("Selected transfer doesn't have enough capacity.");
    }
    transfer = found;
  }

  const price = calculatePriceBreakdown(flight, room, transfer);

  const updated: TravelPackage = {
    ...current,
    flight,
    hotel: activeHotel,
    room,
    transfer,
    price,
  };

  travelStore.updatePackage(updated);
  return updated;
}
