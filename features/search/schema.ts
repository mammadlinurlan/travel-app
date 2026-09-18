import { z } from "zod";
import type { TripSearchRequest } from "@/domain/travel/types";
import { ORIGIN } from "@/providers/mock-data/destinations";

/** Broad defaults for fields that moved from the landing form to post-search filters (star rating, cabin class). */
const DEFAULT_HOTEL_STARS = [3, 4, 5];
const DEFAULT_CABIN_CLASS = "economy" as const;

export interface TripSearchFormMessages {
  chooseDestination: string;
  pickDepartureDate: string;
  pickReturnDate: string;
  returnAfterDeparture: string;
}

export function createTripSearchFormSchema(messages: TripSearchFormMessages) {
  return z
    .object({
      destination: z.string().min(3, messages.chooseDestination),
      departureDate: z.string().min(1, messages.pickDepartureDate),
      returnDate: z.string().min(1, messages.pickReturnDate),
      adults: z.number().int().min(1).max(9),
      children: z.number().int().min(0).max(6),
      infants: z.number().int().min(0).max(4),
      transferRequired: z.boolean(),
    })
    .refine((data) => !data.departureDate || !data.returnDate || data.returnDate > data.departureDate, {
      message: messages.returnAfterDeparture,
      path: ["returnDate"],
    });
}

export type TripSearchFormValues = z.infer<ReturnType<typeof createTripSearchFormSchema>>;

export const defaultTripSearchValues: TripSearchFormValues = {
  destination: "",
  departureDate: "",
  returnDate: "",
  adults: 2,
  children: 0,
  infants: 0,
  transferRequired: true,
};

export function toTripSearchRequest(values: TripSearchFormValues): TripSearchRequest {
  return {
    origin: ORIGIN.code,
    destination: values.destination,
    departureDate: values.departureDate,
    returnDate: values.returnDate,
    travelers: {
      adults: values.adults,
      children: values.children,
      infants: values.infants,
    },
    preferences: {
      hotelStars: DEFAULT_HOTEL_STARS,
      transferRequired: values.transferRequired,
      cabinClass: DEFAULT_CABIN_CLASS,
    },
  };
}
