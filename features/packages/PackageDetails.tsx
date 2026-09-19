"use client";

import { Airplane, Bed, Star, Suitcase } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useState } from "react";
import { PackagePrice } from "@/components/travel/PackagePrice";
import { PackageScore } from "@/components/travel/PackageScore";
import { RecommendationBadge } from "@/components/travel/RecommendationBadge";
import { TripTimeline } from "@/components/travel/TripTimeline";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TravelPackage } from "@/domain/travel/types";
import { PackageCustomizer } from "@/features/customization/PackageCustomizer";
import { type Dictionary, type Locale, useLocale } from "@/lib/i18n/locale-context";
import {
  formatDateRange,
  formatDateShort,
  formatDuration,
  formatMoney,
  formatTime,
} from "@/lib/utils/format";
import { OfferRequestForm } from "./OfferRequestForm";
import { PackageOfferDownloadButton } from "./pdf/PackageOfferDownloadButton";

interface PackageDetailsProps {
  pkg: TravelPackage | null;
  allPackages: TravelPackage[];
  travelerCount: number;
  onOpenChange: (open: boolean) => void;
  onUpdated: (pkg: TravelPackage) => void;
}

export function PackageDetails({
  pkg,
  allPackages,
  travelerCount,
  onOpenChange,
  onUpdated,
}: PackageDetailsProps) {
  const { t, locale } = useLocale();
  const [tab, setTab] = useState("itinerary");

  return (
    <Sheet open={pkg !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto bg-background p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        {pkg && (
          <>
            <div className="relative h-52 w-full shrink-0">
              {pkg.hotel.image && (
                <Image src={pkg.hotel.image} alt="" fill className="object-cover" sizes="576px" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/55 to-navy-deep/25" />
              <div className="absolute left-5 top-5">
                <RecommendationBadge category={pkg.score.category} />
              </div>

              <div className="absolute inset-x-5 bottom-5 flex flex-col gap-2 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
                  {pkg.flight.outbound[pkg.flight.outbound.length - 1].destination.city} ·{" "}
                  {formatDateRange(
                    pkg.flight.outbound[0].departureTime,
                    pkg.flight.inbound[0].departureTime,
                    locale,
                  )}
                </p>
                <SheetHeader className="p-0">
                  <SheetTitle className="text-left text-[26px] font-semibold leading-tight tracking-tight text-white">
                    {pkg.hotel.name}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/80">
                  <span
                    className="flex items-center gap-0.5 text-gold"
                    aria-label={t.packageCard.starHotelAria(pkg.hotel.stars)}
                  >
                    {Array.from({ length: pkg.hotel.stars }).map((_, i) => (
                      <Star key={i} className="size-3" weight="fill" aria-hidden />
                    ))}
                  </span>
                  {pkg.hotel.rating > 0 && (
                    <span className="font-medium text-white">{pkg.hotel.rating.toFixed(1)}</span>
                  )}
                  {pkg.hotel.reviewCount > 0 && (
                    <span>{t.packageCard.reviews(pkg.hotel.reviewCount)}</span>
                  )}
                  {pkg.hotel.address && (
                    <span className="w-full truncate text-white/70">{pkg.hotel.address}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-6 py-4">
              <span className="text-sm text-ink-muted">
                {t.packageDetails.totalFor(travelerCount)}
              </span>
              <div className="flex items-center gap-4">
                <PackagePrice
                  price={pkg.price}
                  perPerson={Math.round(pkg.price.total / Math.max(travelerCount, 1))}
                  size="lg"
                />
                <PackageOfferDownloadButton pkg={pkg} travelerCount={travelerCount} />
              </div>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="flex-1">
              <TabsList className="mx-6 mt-5 bg-sand">
                <TabsTrigger
                  value="itinerary"
                  className="data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  {t.packageDetails.tabItinerary}
                </TabsTrigger>
                <TabsTrigger
                  value="customize"
                  className="data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  {t.packageDetails.tabCustomize}
                </TabsTrigger>
                <TabsTrigger
                  value="request"
                  className="data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  {t.packageDetails.tabRequest}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="flex flex-col gap-5 px-6 py-6">
                {pkg.score.reasons.length > 0 && (
                  <DetailCard title={t.packageDetails.whyWePicked}>
                    <PackageScore score={pkg.score} />
                  </DetailCard>
                )}

                <DetailCard title={t.packageDetails.yourItinerary}>
                  <TripTimeline pkg={pkg} />
                </DetailCard>

                <DetailCard
                  title={t.packageDetails.flightDetails}
                  icon={<Airplane className="size-4" weight="regular" />}
                >
                  <FlightLeg
                    label={t.packageDetails.outbound}
                    segments={pkg.flight.outbound}
                    locale={locale}
                  />
                  <FlightLeg
                    label={t.packageDetails.return}
                    segments={pkg.flight.inbound}
                    locale={locale}
                  />
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
                    <DetailRow
                      label={t.packageDetails.cabin}
                      value={t.cabinClass[pkg.flight.outbound[0].cabin]}
                    />
                    <DetailRow label={t.packageDetails.fare} value={pkg.flight.fareBrand} />
                    <DetailRow
                      label={t.packageDetails.checkedBaggage}
                      value={
                        pkg.flight.baggage.checked > 0
                          ? `${pkg.flight.baggage.checked} × ${pkg.flight.baggage.checkedWeightKg ?? 23}kg`
                          : t.packageDetails.notIncluded
                      }
                    />
                    <DetailRow
                      label={t.packageDetails.cabinBaggage}
                      value={`${pkg.flight.baggage.cabin}`}
                    />
                    <DetailRow
                      label={t.packageDetails.refundable}
                      value={pkg.flight.refundable ? t.packageDetails.yes : t.packageDetails.no}
                    />
                    <DetailRow
                      label={t.packageDetails.totalFlightTime}
                      value={formatDuration(pkg.flight.totalDurationMinutes)}
                    />
                  </dl>
                </DetailCard>

                <DetailCard
                  title={t.packageDetails.stayAndTransfer}
                  icon={<Bed className="size-4" weight="regular" />}
                >
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <DetailRow label={t.packageDetails.room} value={pkg.room.name} />
                    <DetailRow
                      label={t.packageDetails.mealPlan}
                      value={t.mealPlanLabels[pkg.room.mealPlan]}
                    />
                    <DetailRow
                      label={t.packageDetails.cancellation}
                      value={
                        pkg.room.refundable
                          ? t.packageDetails.freeCancellation
                          : t.packageDetails.nonRefundable
                      }
                    />
                    {pkg.room.cancellationDeadline && (
                      <DetailRow
                        label={t.packageDetails.cancelBefore}
                        value={formatDateShort(pkg.room.cancellationDeadline, locale)}
                      />
                    )}
                    <DetailRow
                      label={t.packageDetails.transfer}
                      value={
                        pkg.transfer
                          ? `${pkg.transfer.type === "private" ? t.packageDetails.private : t.packageDetails.shared} · ${pkg.transfer.vehicle}`
                          : t.packageDetails.notIncluded
                      }
                    />
                    {pkg.transfer && (
                      <DetailRow
                        label={t.packageDetails.transferTime}
                        value={formatDuration(pkg.transfer.durationMinutes)}
                      />
                    )}
                  </dl>
                  {pkg.hotel.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                      {pkg.hotel.amenities.slice(0, 6).map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-md bg-sand px-2 py-1 text-[11px] font-medium text-ink"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </DetailCard>

                <DetailCard
                  title={t.packageDetails.priceBreakdown}
                  icon={<Suitcase className="size-4" weight="regular" />}
                >
                  <PriceBreakdownList pkg={pkg} t={t} />
                </DetailCard>
              </TabsContent>

              <TabsContent value="customize" className="px-6 py-6">
                <PackageCustomizer current={pkg} allPackages={allPackages} onUpdated={onUpdated} />
              </TabsContent>

              <TabsContent value="request" className="px-6 py-6">
                <OfferRequestForm packageId={pkg.id} onDone={() => onOpenChange(false)} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h4 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}

function FlightLeg({
  label,
  segments,
  locale,
}: {
  label: string;
  segments: TravelPackage["flight"]["outbound"];
  locale: Locale;
}) {
  if (segments.length === 0) return null;
  const first = segments[0];
  const last = segments[segments.length - 1];
  // Door-to-door, including any ground time at a connection — not just time in the air.
  const minutes = Math.round(
    (new Date(last.arrivalTime).getTime() - new Date(first.departureTime).getTime()) / 60000,
  );

  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="whitespace-nowrap font-medium text-ink">
          {first.origin.code} → {last.destination.code}
        </p>
        <p className="truncate text-xs text-ink-muted">{first.airline}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="whitespace-nowrap text-ink">
          {formatTime(first.departureTime, locale)} — {formatTime(last.arrivalTime, locale)}
        </p>
        <p className="whitespace-nowrap text-xs text-ink-muted">
          {formatDateShort(first.departureTime, locale)} · {formatDuration(minutes)}
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function PriceBreakdownList({ pkg, t }: { pkg: TravelPackage; t: Dictionary }) {
  const rows = [
    { label: t.packageDetails.flights, amount: pkg.price.flights },
    { label: t.packageDetails.hotel, amount: pkg.price.hotel },
    { label: t.packageDetails.transferLabel, amount: pkg.price.transfer },
    { label: t.packageDetails.serviceAndBooking, amount: pkg.price.markup },
  ];

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-sm text-ink-muted">
          <span>{row.label}</span>
          <span className="text-ink">
            {formatMoney({ amount: row.amount, currency: pkg.price.currency })}
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-ink">
        <span>{t.packageDetails.total}</span>
        <span>{formatMoney({ amount: pkg.price.total, currency: pkg.price.currency })}</span>
      </div>
    </div>
  );
}
