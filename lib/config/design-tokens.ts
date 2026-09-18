/**
 * Central design tokens for the travel platform.
 * Source of truth for the exact palette from the product spec.
 * CSS custom properties (app/globals.css) are the runtime source; this file
 * exists for places that need the raw values in JS/TS (e.g. chart configs,
 * email templates, canvas rendering) rather than Tailwind classes.
 */
export const colors = {
  navy: "#102A43",
  navyDeep: "#0B1F33",
  ivory: "#FAF8F3",
  sand: "#F1EDE4",
  gold: "#C6A15B",
  ink: "#17212B",
  inkMuted: "#667085",
  border: "#E4E0D8",
  success: "#2F7D5C",
  error: "#B54747",
} as const;

export const fontFamily = {
  sans: "var(--font-sans)",
} as const;

export const radii = {
  sm: "calc(var(--radius) * 0.6)",
  md: "calc(var(--radius) * 0.8)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) * 1.4)",
} as const;

export const motion = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  easeOut: [0.16, 1, 0.3, 1] as const,
} as const;
