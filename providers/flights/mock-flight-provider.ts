import type { FlightOffer, FlightSegment } from "@/domain/travel/types";
import { hashSeed, mulberry32, pick, range } from "@/lib/server/random";
import { ORIGIN, resolveDestination } from "@/providers/mock-data/destinations";
import type { FlightProvider, FlightSearchRequest } from "./flight-provider";

function buildSegment(
  id: string,
  airline: { name: string; code: string },
  origin: FlightSegment["origin"],
  destination: FlightSegment["destination"],
  departure: Date,
  durationMinutes: number,
  cabin: FlightSegment["cabin"],
): FlightSegment {
  const arrival = new Date(departure.getTime() + durationMinutes * 60_000);
  return {
    id,
    airline: airline.name,
    airlineCode: airline.code,
    flightNumber: `${airline.code}${100 + Math.floor(Math.random() * 800)}`,
    origin,
    destination,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    durationMinutes,
    cabin,
  };
}

export class MockFlightProvider implements FlightProvider {
  async searchFlights(request: FlightSearchRequest): Promise<FlightOffer[]> {
    const profile = resolveDestination(request.destination);
    if (!profile) return [];

    const rng = mulberry32(
      hashSeed(`flight:${request.destination}:${request.departureDate}:${request.cabin}`),
    );
    const payingTravelers = request.travelers.adults + request.travelers.children;
    const offers: FlightOffer[] = [];

    const variants: { stops: number; cabinUpgrade: boolean; label: string }[] = [
      { stops: 0, cabinUpgrade: false, label: "direct" },
      { stops: 1, cabinUpgrade: false, label: "one-stop-1" },
      { stops: 1, cabinUpgrade: false, label: "one-stop-2" },
      { stops: 0, cabinUpgrade: true, label: "direct-premium" },
    ];

    variants.forEach((variant, index) => {
      const airline = pick(rng, profile.airlines);
      const cabin = variant.cabinUpgrade
        ? request.cabin === "economy"
          ? "premium_economy"
          : request.cabin
        : request.cabin;

      const durationOut =
        profile.flightDurationMinutes +
        (variant.stops > 0 ? range(rng, 90, 240) : range(rng, -20, 20));
      const durationIn =
        profile.flightDurationMinutes +
        (variant.stops > 0 ? range(rng, 90, 240) : range(rng, -20, 20));

      const departureHour = String(8 + Math.floor(rng() * 10)).padStart(2, "0");
      const returnHour = String(8 + Math.floor(rng() * 10)).padStart(2, "0");
      const departure = new Date(`${request.departureDate}T${departureHour}:00:00Z`);
      const returning = new Date(`${request.returnDate}T${returnHour}:00:00Z`);

      const outbound: FlightSegment[] = [
        buildSegment(
          `${variant.label}-out`,
          airline,
          ORIGIN,
          profile.airport,
          departure,
          Math.round(durationOut),
          cabin,
        ),
      ];
      const inbound: FlightSegment[] = [
        buildSegment(
          `${variant.label}-in`,
          airline,
          profile.airport,
          ORIGIN,
          returning,
          Math.round(durationIn),
          cabin,
        ),
      ];

      const stopMultiplier = variant.stops > 0 ? 0.82 : 1;
      const cabinMultiplier = variant.cabinUpgrade ? 1.55 : 1;
      const jitter = range(rng, 0.92, 1.08);
      const perPersonPrice = profile.basePriceUsd * stopMultiplier * cabinMultiplier * jitter;
      const totalPrice = Math.round(perPersonPrice * Math.max(payingTravelers, 1));

      offers.push({
        id: `flight-${profile.code}-${index}`,
        outbound,
        inbound,
        stops: variant.stops,
        totalDurationMinutes: Math.round(durationOut + durationIn),
        baggage: {
          checked: variant.cabinUpgrade ? 2 : cabin === "economy" ? 1 : 2,
          checkedWeightKg: 23,
          cabin: 1,
        },
        price: { amount: totalPrice, currency: "USD" },
        fareBrand: variant.cabinUpgrade ? "Flex" : "Standard",
        refundable: variant.cabinUpgrade,
        supplier: "mock",
      });
    });

    return offers;
  }
}
