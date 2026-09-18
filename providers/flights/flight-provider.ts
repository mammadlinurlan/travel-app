import type { CabinClass, FlightOffer, Travelers } from "@/domain/travel/types";

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: Travelers;
  cabin: CabinClass;
}

export interface FlightProvider {
  searchFlights(request: FlightSearchRequest): Promise<FlightOffer[]>;
}
