/**
 * Client-safe destination list (no provider logic). Mirrors providers/mock-data/destinations.ts
 * for use in UI selectors without pulling server-only code into client bundles.
 */
export interface DestinationOption {
  code: string;
  city: string;
  country: string;
  image: string;
  description: string;
}

export const DESTINATION_OPTIONS: DestinationOption[] = [
  {
    code: "HKT",
    city: "Phuket",
    country: "Thailand",
    image:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1200&auto=format&fit=crop",
    description: "Andaman Sea beaches and island hopping",
  },
  {
    code: "DXB",
    city: "Dubai",
    country: "UAE",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    description: "Skyline luxury and year-round sun",
  },
  {
    code: "AYT",
    city: "Antalya",
    country: "Turkey",
    image:
      "https://images.unsplash.com/photo-1601921804005-5fdb1e5da881?q=80&w=1200&auto=format&fit=crop",
    description: "All-inclusive Mediterranean coastline",
  },
  {
    code: "CDG",
    city: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
    description: "Museums, cafés and slow walking",
  },
];
