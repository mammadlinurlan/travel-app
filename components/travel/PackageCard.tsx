"use client";

import { Airplane, ArrowRight, Car, Check, Star } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { TravelPackage } from "@/domain/travel/types";
import { type Dictionary, useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";
import { formatAmount, formatDateShort, formatDuration, formatTime } from "@/lib/utils/format";
import { RecommendationBadge } from "./RecommendationBadge";

interface PackageCardProps {
  pkg: TravelPackage;
  travelerCount: number;
  onView: (pkg: TravelPackage) => void;
  index?: number;
}

/** Card-level inclusions, most valuable first. Detail view still shows everything. */
function buildInclusions(pkg: TravelPackage, t: Dictionary): string[] {
  const inclusions: string[] = [];
  if (pkg.room.mealPlan !== "room_only") inclusions.push(t.mealPlanLabels[pkg.room.mealPlan]);
  if (pkg.transfer) inclusions.push(t.filters.airportTransfer);
  if (pkg.room.refundable) inclusions.push(t.filters.freeCancellation);
  if (pkg.flight.baggage.checked > 0) {
    inclusions.push(t.packageCard.checkedBags(pkg.flight.baggage.checked));
  }
  return inclusions;
}

export function PackageCard({ pkg, travelerCount, onView, index = 0 }: PackageCardProps) {
  const { t, locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const headingId = `pkg-${pkg.id}-title`;

  const firstLeg = pkg.flight.outbound[0];
  const lastLeg = pkg.flight.outbound[pkg.flight.outbound.length - 1];
  const outboundMinutes = pkg.flight.outbound.reduce((sum, seg) => sum + seg.durationMinutes, 0);

  const inclusions = buildInclusions(pkg, t);
  const visibleInclusions = inclusions.slice(0, 3);
  const extraInclusions = inclusions.length - visibleInclusions.length;
  const perPerson = Math.round(pkg.price.total / Math.max(travelerCount, 1));

  return (
    <motion.article
      aria-labelledby={headingId}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[18px] border bg-white shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        pkg.score.category === "best_value" ? "border-gold/60 anim-glow-gold" : "border-border",
      )}
    >
      {pkg.score.category === "best_value" && (
        <div className="flex shrink-0 items-center justify-center border-b border-gold/25 bg-gold/15 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
            {t.recommendationBadge.ribbon}
          </span>
        </div>
      )}

      <div className="relative h-[132px] w-full shrink-0 overflow-hidden bg-sand">
        {pkg.hotel.image ? (
          <Image
            src={pkg.hotel.image}
            alt={pkg.hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 380px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-muted">
            {t.packageCard.noPhoto}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/35 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <RecommendationBadge category={pkg.score.category} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <header className="flex flex-col gap-1.5">
          <h3
            id={headingId}
            className="text-[17px] font-semibold leading-snug tracking-tight text-ink"
          >
            <button
              type="button"
              onClick={() => onView(pkg)}
              className="line-clamp-2 text-left underline-offset-4 transition-colors hover:text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2"
            >
              {pkg.hotel.name}
            </button>
          </h3>

          <p className="text-xs font-medium text-ink-muted">{pkg.room.name}</p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            <span
              className="flex items-center gap-0.5 text-gold-deep"
              aria-label={t.packageCard.starHotelAria(pkg.hotel.stars)}
            >
              {Array.from({ length: pkg.hotel.stars }).map((_, i) => (
                <Star key={i} className="size-3" weight="fill" aria-hidden />
              ))}
            </span>
            {pkg.hotel.rating > 0 && (
              <span className="font-medium text-ink">{pkg.hotel.rating.toFixed(1)}</span>
            )}
            {pkg.hotel.reviewCount > 0 && (
              <span>{t.packageCard.reviews(pkg.hotel.reviewCount)}</span>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl bg-sand/70 px-3.5 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white">
              <Airplane className="size-4 text-navy" weight="regular" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <span className="truncate">{firstLeg.airline}</span>
              </div>
              <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink">
                {firstLeg.origin.code} <span className="text-ink-muted">→</span>{" "}
                {lastLeg.destination.code}
              </p>
              <p className="mt-0.5 text-[13px] text-ink">
                {formatDateShort(firstLeg.departureTime, locale)},{" "}
                {formatTime(firstLeg.departureTime, locale)} —{" "}
                {formatTime(lastLeg.arrivalTime, locale)}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {pkg.flight.stops === 0
                  ? t.packageCard.direct
                  : t.packageCard.stops(pkg.flight.stops)}{" "}
                · {formatDuration(outboundMinutes)}
              </p>
            </div>
          </div>

          {pkg.transfer && (
            <div className="flex items-center gap-3 rounded-xl bg-sand/70 px-3.5 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white">
                <Car className="size-4 text-navy" weight="regular" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  {t.packageDetails.transfer}
                </p>
                <p className="mt-0.5 truncate text-[13px] font-medium text-ink">
                  {pkg.transfer.vehicle}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {pkg.transfer.type === "private"
                    ? t.packageDetails.private
                    : t.packageDetails.shared}
                </p>
              </div>
            </div>
          )}
        </div>

        {visibleInclusions.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {visibleInclusions.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-xs text-ink">
                <Check className="size-3.5 shrink-0 text-success" weight="bold" aria-hidden />
                {item}
              </li>
            ))}
            {extraInclusions > 0 && (
              <li className="text-xs font-medium text-ink-muted">
                {t.packageCard.moreInclusions(extraInclusions)}
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[22px] font-semibold leading-none tracking-tight text-ink">
                {formatAmount(pkg.price.total, pkg.price.currency)}
              </span>
              <span className="mt-1 text-[11px] text-ink-muted">
                {formatAmount(perPerson, pkg.price.currency)} {t.packageCard.perPerson}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onView(pkg)}
              aria-label={t.packageCard.viewTripAria(lastLeg.destination.city, pkg.hotel.name)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-medium",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2",
                pkg.score.category === "best_value"
                  ? "bg-gold text-navy-deep hover:bg-gold/90"
                  : "bg-navy text-white hover:bg-navy-deep",
              )}
            >
              {t.packageCard.viewTrip}
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                weight="bold"
                aria-hidden
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onView(pkg)}
            className="w-full rounded-lg border border-border py-2 text-xs font-medium text-ink-muted transition-colors hover:border-navy/30 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
          >
            {t.packageCard.viewDetailsCta}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
