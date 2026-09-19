"use client";

import { Airplane, ArrowRight, Buildings, Star } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FlightDetailsSheet } from "@/components/travel/FlightDetailsSheet";
import { HotelDetailsSheet } from "@/components/travel/HotelDetailsSheet";
import { cheapestRoomFor } from "@/domain/travel/pricing";
import type { FlightOffer, HotelOffer, Room, TravelPackage } from "@/domain/travel/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatAmount, formatDateShort, formatTime } from "@/lib/utils/format";

interface SourceGroupedResultsProps {
  packages: TravelPackage[];
  onSelectFlight: (flight: FlightOffer) => void;
  onSelectHotel: (hotel: HotelOffer, room: Room) => void;
}

/** One entry per unique flight/hotel, grouped by its own supplier field. */
function groupUnique<S extends string>(
  packages: TravelPackage[],
  idOf: (pkg: TravelPackage) => string,
  supplierOf: (pkg: TravelPackage) => S,
): Map<S, TravelPackage[]> {
  const seen = new Set<string>();
  const groups = new Map<S, TravelPackage[]>();
  for (const pkg of packages) {
    const id = idOf(pkg);
    if (seen.has(id)) continue;
    seen.add(id);
    const supplier = supplierOf(pkg);
    const list = groups.get(supplier);
    if (list) list.push(pkg);
    else groups.set(supplier, [pkg]);
  }
  return groups;
}

/** Both category sections stacked — kept for callers that still want the combined view. */
export function SourceGroupedResults({
  packages,
  onSelectFlight,
  onSelectHotel,
}: SourceGroupedResultsProps) {
  return (
    <div className="flex flex-col gap-10">
      <FlightsList
        packages={packages}
        onSelectFlight={onSelectFlight}
        onSelectHotel={onSelectHotel}
      />
      <HotelsList
        packages={packages}
        onSelectFlight={onSelectFlight}
        onSelectHotel={onSelectHotel}
      />
    </div>
  );
}

/** "Uçuşlar" tab — one card per unique flight, grouped by real supplier. Click opens read-only details; "Seç" there is what selects it. */
export function FlightsList({ packages, onSelectFlight }: SourceGroupedResultsProps) {
  const { t, locale } = useLocale();
  const [openFlight, setOpenFlight] = useState<FlightOffer | null>(null);

  const flightGroups = useMemo(
    () =>
      groupUnique(
        packages,
        (pkg) => pkg.flight.id,
        (pkg) => pkg.flight.supplier,
      ),
    [packages],
  );
  const flightCount = useMemo(
    () => [...flightGroups.values()].reduce((sum, items) => sum + items.length, 0),
    [flightGroups],
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy/8">
            <Airplane className="size-4 text-navy" weight="regular" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">{t.sourceGrouped.flightsHeading}</h2>
            <p className="text-[11px] text-ink-muted">
              {t.sourceGrouped.resultsCount(flightCount)}
            </p>
          </div>
        </div>
        {flightGroups.size === 0 ? (
          <p className="text-sm text-ink-muted">{t.sourceGrouped.emptyFlights}</p>
        ) : (
          [...flightGroups.entries()].map(([supplier, items]) => (
            <div key={supplier} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((pkg) => {
                  const firstLeg = pkg.flight.outbound[0];
                  const lastLeg = pkg.flight.outbound[pkg.flight.outbound.length - 1];
                  return (
                    <button
                      key={pkg.flight.id}
                      type="button"
                      onClick={() => setOpenFlight(pkg.flight)}
                      className="group flex flex-col gap-2 rounded-xl border border-border bg-white p-4 text-left shadow-sm transition-colors hover:border-navy/30 hover:bg-sand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                        <Airplane className="size-3.5" weight="regular" aria-hidden />
                        <span className="truncate">{firstLeg.airline}</span>
                      </div>
                      <p className="text-[15px] font-semibold tracking-tight text-ink">
                        {firstLeg.origin.code} <span className="text-ink-muted">→</span>{" "}
                        {lastLeg.destination.code}
                      </p>
                      <p className="text-[13px] text-ink">
                        {formatDateShort(firstLeg.departureTime, locale)},{" "}
                        {formatTime(firstLeg.departureTime, locale)} —{" "}
                        {formatTime(lastLeg.arrivalTime, locale)}
                      </p>
                      <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                        <span className="text-sm font-semibold text-ink">
                          {t.sourceGrouped.fromPrice}{" "}
                          {formatAmount(pkg.flight.price.amount, pkg.flight.price.currency)}
                        </span>
                        <ArrowRight
                          className="size-4 text-navy transition-transform duration-200 group-hover:translate-x-0.5"
                          weight="bold"
                          aria-hidden
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      <FlightDetailsSheet
        flight={openFlight}
        onOpenChange={(open) => !open && setOpenFlight(null)}
        onSelect={(flight) => {
          onSelectFlight(flight);
          setOpenFlight(null);
        }}
      />
    </div>
  );
}

/** "Otellər" tab — one card per unique hotel, grouped by real supplier. Click opens details + room list; "Seç" on a room is what selects it. */
export function HotelsList({ packages, onSelectHotel }: SourceGroupedResultsProps) {
  const { t } = useLocale();
  const [openHotel, setOpenHotel] = useState<HotelOffer | null>(null);

  const hotelGroups = useMemo(
    () =>
      groupUnique(
        packages,
        (pkg) => pkg.hotel.id,
        (pkg) => pkg.hotel.supplier,
      ),
    [packages],
  );
  const hotelCount = useMemo(
    () => [...hotelGroups.values()].reduce((sum, items) => sum + items.length, 0),
    [hotelGroups],
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy/8">
            <Buildings className="size-4 text-navy" weight="regular" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink">{t.sourceGrouped.hotelsHeading}</h2>
            <p className="text-[11px] text-ink-muted">{t.sourceGrouped.resultsCount(hotelCount)}</p>
          </div>
        </div>
        {hotelGroups.size === 0 ? (
          <p className="text-sm text-ink-muted">{t.sourceGrouped.emptyHotels}</p>
        ) : (
          [...hotelGroups.entries()].map(([supplier, items]) => (
            <div key={supplier} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((pkg) => (
                  <HotelSourceCard
                    key={pkg.hotel.id}
                    hotel={pkg.hotel}
                    onSelect={() => setOpenHotel(pkg.hotel)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <HotelDetailsSheet
        hotel={openHotel}
        onOpenChange={(open) => !open && setOpenHotel(null)}
        onSelect={(hotel, room) => {
          onSelectHotel(hotel, room);
          setOpenHotel(null);
        }}
      />
    </div>
  );
}

function HotelSourceCard({ hotel, onSelect }: { hotel: HotelOffer; onSelect: () => void }) {
  const { t } = useLocale();
  const cheapestRoom = cheapestRoomFor(hotel);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white text-left shadow-sm transition-colors hover:border-navy/30 hover:bg-sand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
    >
      <div className="relative h-[96px] w-full shrink-0 overflow-hidden bg-sand">
        {hotel.image ? (
          <Image src={hotel.image} alt={hotel.name} fill sizes="240px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-muted">
            {t.packageCard.noPhoto}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <p className="line-clamp-1 text-sm font-semibold text-ink">{hotel.name}</p>
        <span
          className="flex items-center gap-0.5 text-gold-deep"
          aria-label={t.packageCard.starHotelAria(hotel.stars)}
        >
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star key={i} className="size-3" weight="fill" aria-hidden />
          ))}
        </span>
        <span className="text-sm font-semibold text-ink">
          {t.sourceGrouped.fromPrice}{" "}
          {formatAmount(cheapestRoom.price.amount, cheapestRoom.price.currency)}
        </span>
      </div>
    </button>
  );
}
