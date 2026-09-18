import type { HotelOffer, Travelers } from "@/domain/travel/types";

export interface HotelSearchRequest {
  destination: string;
  checkIn: string;
  checkOut: string;
  travelers: Travelers;
  starRatings: number[];
}

export interface HotelProvider {
  searchHotels(request: HotelSearchRequest): Promise<HotelOffer[]>;
}
