"use client";

import { Airplane, Bed, Car, DoorOpen, HourglassMedium } from "@phosphor-icons/react/dist/ssr";
import type { FlightSegment, TravelPackage } from "@/domain/travel/types";
import { formatDateShort, formatTime } from "@/lib/utils/format";
import { useLocale, type Dictionary, type Locale } from "@/lib/i18n/locale-context";

interface TimelineStep {
  icon: typeof Airplane;
  title: string;
  subtitle: string;
}

/** One step per segment, with a layover step spliced in between connections. */
function flightSteps(segments: FlightSegment[], t: Dictionary, locale: Locale): TimelineStep[] {
  const steps: TimelineStep[] = [];
  segments.forEach((segment, index) => {
    if (index > 0) {
      const previous = segments[index - 1];
      const layoverMinutes = Math.round(
        (new Date(segment.departureTime).getTime() - new Date(previous.arrivalTime).getTime()) / 60000
      );
      steps.push({
        icon: HourglassMedium,
        title: t.timeline.connectingFlightIn(previous.destination.city),
        subtitle:
          layoverMinutes > 0
            ? t.timeline.layover(Math.floor(layoverMinutes / 60), layoverMinutes % 60)
            : t.timeline.layoverShort,
      });
    }
    const departsOnDifferentDay =
      formatDateShort(segment.arrivalTime, locale) !== formatDateShort(segment.departureTime, locale);
    const arrival = departsOnDifferentDay
      ? `${formatTime(segment.arrivalTime, locale)} (${formatDateShort(segment.arrivalTime, locale)})`
      : formatTime(segment.arrivalTime, locale);

    steps.push({
      icon: Airplane,
      title: `${segment.origin.city} → ${segment.destination.city}`,
      subtitle: `${formatDateShort(segment.departureTime, locale)} · ${formatTime(segment.departureTime, locale)} — ${arrival} · ${segment.airline}`,
    });
  });
  return steps;
}

export function TripTimeline({ pkg }: { pkg: TravelPackage }) {
  const { t, locale } = useLocale();
  const inbound = pkg.flight.inbound[0];

  const steps: TimelineStep[] = [
    ...flightSteps(pkg.flight.outbound, t, locale),
    ...(pkg.transfer
      ? [
          {
            icon: Car,
            title: t.timeline.airportTransfer,
            subtitle: `${pkg.transfer.type === "private" ? t.packageDetails.private : t.packageDetails.shared} · ${pkg.transfer.vehicle}`,
          },
        ]
      : []),
    { icon: DoorOpen, title: t.timeline.checkIn, subtitle: pkg.hotel.name },
    {
      icon: Bed,
      title: t.timeline.stayAtHotel,
      subtitle: `${pkg.room.name} · ${pkg.hotel.stars}★`,
    },
    {
      icon: DoorOpen,
      title: t.timeline.checkOut,
      subtitle: formatDateShort(inbound.departureTime, locale),
    },
    ...(pkg.transfer
      ? [
          {
            icon: Car,
            title: t.timeline.airportTransfer,
            subtitle: t.timeline.backToAirport,
          },
        ]
      : []),
    ...flightSteps(pkg.flight.inbound, t, locale),
  ];

  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;
        return (
          <li key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sand text-navy">
                <Icon className="size-4" weight="duotone" />
              </span>
              {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className="pb-6">
              <p className="text-sm font-medium text-ink">{step.title}</p>
              <p className="text-xs text-ink-muted">{step.subtitle}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
