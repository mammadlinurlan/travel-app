import type { Airport } from "@/domain/travel/types";

export interface DestinationProfile {
  code: string; // city/airport code used as the destination key
  airport: Airport;
  city: string;
  country: string;
  image: string;
  description: string;
  beachDestination: boolean;
  /** Search center for hotel providers that require coordinates (e.g. Duffel Stays). */
  coordinates: { latitude: number; longitude: number };
  airlines: { name: string; code: string }[];
  hotels: {
    name: string;
    stars: 1 | 2 | 3 | 4 | 5;
    rating: number;
    reviewCount: number;
    image: string;
    address: string;
    beachDistanceMeters?: number;
    centerDistanceMeters?: number;
    amenities: string[];
    nightlyPriceUsd: number;
  }[];
  flightDurationMinutes: number; // one-way, from Baku
  basePriceUsd: number; // round-trip economy base
}

const ORIGIN_AIRPORT: Airport = {
  code: "GYD",
  name: "Heydar Aliyev International Airport",
  city: "Baku",
  country: "Azerbaijan",
};

export const ORIGIN = ORIGIN_AIRPORT;

export const DESTINATIONS: Record<string, DestinationProfile> = {
  HKT: {
    code: "HKT",
    airport: { code: "HKT", name: "Phuket International Airport", city: "Phuket", country: "Thailand" },
    city: "Phuket",
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1600&auto=format&fit=crop",
    description: "Andaman Sea beaches, warm water, and easy island hopping.",
    beachDestination: true,
    coordinates: { latitude: 7.8804, longitude: 98.2963 },
    airlines: [
      { name: "Turkish Airlines", code: "TK" },
      { name: "Qatar Airways", code: "QR" },
      { name: "Emirates", code: "EK" },
    ],
    hotels: [
      {
        name: "Katathani Phuket Beach Resort",
        stars: 5,
        rating: 9.2,
        reviewCount: 4310,
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1600&auto=format&fit=crop",
        address: "Kata Noi Beach, Phuket",
        beachDistanceMeters: 20,
        amenities: ["Private beach", "3 pools", "Spa", "Kids club"],
        nightlyPriceUsd: 210,
      },
      {
        name: "Angsana Laguna Phuket",
        stars: 5,
        rating: 8.8,
        reviewCount: 2870,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1600&auto=format&fit=crop",
        address: "Bang Tao Beach, Phuket",
        beachDistanceMeters: 150,
        amenities: ["Lagoon access", "Golf nearby", "Spa"],
        nightlyPriceUsd: 165,
      },
      {
        name: "Amari Phuket",
        stars: 4,
        rating: 8.5,
        reviewCount: 3120,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1600&auto=format&fit=crop",
        address: "Patong Beach, Phuket",
        beachDistanceMeters: 80,
        amenities: ["Rooftop bar", "Pool", "Gym"],
        nightlyPriceUsd: 95,
      },
      {
        name: "Ibis Phuket Kata",
        stars: 3,
        rating: 8.1,
        reviewCount: 1560,
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop",
        address: "Kata Beach, Phuket",
        beachDistanceMeters: 400,
        amenities: ["Pool", "Breakfast buffet"],
        nightlyPriceUsd: 55,
      },
    ],
    flightDurationMinutes: 620,
    basePriceUsd: 520,
  },
  DXB: {
    code: "DXB",
    airport: { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
    city: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
    description: "Skyline luxury, desert excursions, and year-round sun.",
    beachDestination: true,
    coordinates: { latitude: 25.1412, longitude: 55.1852 },
    airlines: [
      { name: "Azerbaijan Airlines", code: "J2" },
      { name: "Emirates", code: "EK" },
      { name: "flydubai", code: "FZ" },
    ],
    hotels: [
      {
        name: "Jumeirah Beach Hotel",
        stars: 5,
        rating: 9.0,
        reviewCount: 6200,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop",
        address: "Jumeirah Beach Road, Dubai",
        beachDistanceMeters: 10,
        amenities: ["Private beach", "Waterpark access", "Spa"],
        nightlyPriceUsd: 340,
      },
      {
        name: "Rove Downtown",
        stars: 4,
        rating: 8.6,
        reviewCount: 5400,
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1600&auto=format&fit=crop",
        address: "Downtown Dubai",
        centerDistanceMeters: 300,
        amenities: ["Rooftop pool", "Burj Khalifa view", "Gym"],
        nightlyPriceUsd: 110,
      },
      {
        name: "Atlantis The Palm",
        stars: 5,
        rating: 9.4,
        reviewCount: 8900,
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=1600&auto=format&fit=crop",
        address: "Palm Jumeirah, Dubai",
        beachDistanceMeters: 5,
        amenities: ["Aquaventure Waterpark", "Private beach", "Aquarium"],
        nightlyPriceUsd: 420,
      },
    ],
    flightDurationMinutes: 240,
    basePriceUsd: 310,
  },
  AYT: {
    code: "AYT",
    airport: { code: "AYT", name: "Antalya Airport", city: "Antalya", country: "Turkey" },
    city: "Antalya",
    country: "Turkey",
    image: "https://images.unsplash.com/photo-1601921804005-5fdb1e5da881?q=80&w=1600&auto=format&fit=crop",
    description: "All-inclusive Mediterranean resorts and turquoise coastline.",
    beachDestination: true,
    coordinates: { latitude: 36.8474, longitude: 30.7654 },
    airlines: [
      { name: "Azerbaijan Airlines", code: "J2" },
      { name: "Turkish Airlines", code: "TK" },
      { name: "Pegasus", code: "PC" },
    ],
    hotels: [
      {
        name: "Rixos Premium Belek",
        stars: 5,
        rating: 9.1,
        reviewCount: 5100,
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1600&auto=format&fit=crop",
        address: "Belek, Antalya",
        beachDistanceMeters: 30,
        amenities: ["All-inclusive", "Aquapark", "Golf nearby"],
        nightlyPriceUsd: 260,
      },
      {
        name: "Delphin Imperial",
        stars: 5,
        rating: 8.7,
        reviewCount: 4700,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1600&auto=format&fit=crop",
        address: "Lara Beach, Antalya",
        beachDistanceMeters: 50,
        amenities: ["All-inclusive", "Private beach", "Spa"],
        nightlyPriceUsd: 180,
      },
      {
        name: "Kirman Hotels Sidera Park",
        stars: 4,
        rating: 8.3,
        reviewCount: 2100,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop",
        address: "Kemer, Antalya",
        beachDistanceMeters: 200,
        amenities: ["All-inclusive", "Pool", "Kids club"],
        nightlyPriceUsd: 90,
      },
    ],
    flightDurationMinutes: 150,
    basePriceUsd: 210,
  },
  CDG: {
    code: "CDG",
    airport: { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
    city: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop",
    description: "Museums, cafés, and boulevards built for slow walking.",
    beachDestination: false,
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
    airlines: [
      { name: "Azerbaijan Airlines", code: "J2" },
      { name: "Air France", code: "AF" },
      { name: "Turkish Airlines", code: "TK" },
    ],
    hotels: [
      {
        name: "Hôtel Le Walt",
        stars: 4,
        rating: 8.9,
        reviewCount: 1900,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1600&auto=format&fit=crop",
        address: "7th Arrondissement, Paris",
        centerDistanceMeters: 900,
        amenities: ["Boutique design", "Bar", "Breakfast room"],
        nightlyPriceUsd: 240,
      },
      {
        name: "Citadines Saint-Germain-des-Prés",
        stars: 4,
        rating: 8.4,
        reviewCount: 2600,
        image: "https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=1600&auto=format&fit=crop",
        address: "Saint-Germain, Paris",
        centerDistanceMeters: 500,
        amenities: ["Kitchenette", "Gym"],
        nightlyPriceUsd: 175,
      },
      {
        name: "Ibis Paris Tour Eiffel",
        stars: 3,
        rating: 8.0,
        reviewCount: 3400,
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop",
        address: "15th Arrondissement, Paris",
        centerDistanceMeters: 1800,
        amenities: ["Breakfast buffet", "Bar"],
        nightlyPriceUsd: 110,
      },
    ],
    flightDurationMinutes: 300,
    basePriceUsd: 380,
  },
};

export function resolveDestination(code: string): DestinationProfile | null {
  const key = code.trim().toUpperCase();
  return DESTINATIONS[key] ?? null;
}

export function listDestinations(): DestinationProfile[] {
  return Object.values(DESTINATIONS);
}
