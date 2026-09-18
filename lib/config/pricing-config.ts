/** Business markup configuration — the only place commission rates should change. */
export const PRICING_CONFIG = {
  markupPercentage: 0.12,
  minimumMarkup: 15, // USD, applied when percentage markup would round to less
} as const;
