/** Package ranking weights (must sum to 1). See spec §29. */
export const SCORING_WEIGHTS = {
  price: 0.3,
  hotelQuality: 0.25,
  flightQuality: 0.2,
  location: 0.1,
  includedServices: 0.1,
  preferenceMatch: 0.05,
} as const;
