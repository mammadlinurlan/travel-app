import { z } from "zod";

export const currencySchema = z.enum(["AZN", "USD", "EUR", "GBP", "TRY"]);

export const travelersSchema = z.object({
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(6),
  infants: z.number().int().min(0).max(4),
});

export const mealPlanSchema = z.enum([
  "room_only",
  "breakfast",
  "half_board",
  "full_board",
  "all_inclusive",
]);

export const cabinClassSchema = z.enum(["economy", "premium_economy", "business", "first"]);

export const tripSearchSchema = z
  .object({
    origin: z.string().min(3).max(4),
    destination: z.string().min(3).max(4),
    departureDate: z.string().date(),
    returnDate: z.string().date(),
    travelers: travelersSchema,
    preferences: z.object({
      hotelStars: z.array(z.number().int().min(1).max(5)).min(1),
      transferRequired: z.boolean(),
      cabinClass: cabinClassSchema,
    }),
  })
  .refine((data) => new Date(data.returnDate) > new Date(data.departureDate), {
    message: "Return date must be after the departure date.",
    path: ["returnDate"],
  });

export type TripSearchInput = z.infer<typeof tripSearchSchema>;

export const customizationSchema = z.object({
  hotelId: z.string().optional(),
  roomId: z.string().optional(),
  flightId: z.string().optional(),
  transferId: z.string().nullable().optional(),
});

export type CustomizationInput = z.infer<typeof customizationSchema>;

export const offerRequestSchema = z.object({
  packageId: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(30).optional(),
  notes: z.string().max(1000).optional(),
});

export type OfferRequestInput = z.infer<typeof offerRequestSchema>;

export const nlpTripRequestSchema = z.object({
  text: z.string().min(3).max(1000),
});

/** Base64-encoded audio clip recorded in the browser (MediaRecorder), for voice search. */
export const nlpVoiceTripRequestSchema = z.object({
  audio: z.string().min(1),
  mimeType: z.string().min(1).max(100),
});

export type NlpVoiceTripRequestInput = z.infer<typeof nlpVoiceTripRequestSchema>;

/** Structured output the AI parser must conform to — validated before use. */
export const parsedTripIntentSchema = z.object({
  destination: z.string().nullable(),
  destinationLabel: z.string().nullable(),
  originCity: z.string().nullable(),
  departureDate: z.string().nullable(),
  returnDate: z.string().nullable(),
  adults: z.number().int().min(1).nullable(),
  children: z.number().int().min(0).nullable(),
  hotelStars: z.array(z.number().int().min(1).max(5)).nullable(),
  summary: z.string(),
});

export type ParsedTripIntent = z.infer<typeof parsedTripIntentSchema>;
