"use client";

import { Airplane, Bed, Car } from "@phosphor-icons/react/dist/ssr";
import type { TravelPackage } from "@/domain/travel/types";
import { RecommendationBadge } from "./RecommendationBadge";
import { formatAmount, formatDateShort, formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

interface PackageOfferCardProps {
  pkg: TravelPackage;
  travelerCount: number;
  onView: (pkg: TravelPackage) => void;
}

/**
 * The "3 offers" card (cheapest / best value / premium) — an itemized-row
 * layout distinct from the photo-hero PackageCard used in the results grid,
 * matching the dedicated build-summary screen.
 */
export function PackageOfferCard({ pkg, travelerCount, onView }: PackageOfferCardProps) {
  const { t, locale } = useLocale();
  const firstLeg = pkg.flight.outbound[0];
  const lastLeg = pkg.flight.outbound[pkg.flight.outbound.length - 1];
  const perPerson = Math.round(pkg.price.total / Math.max(travelerCount, 1));
  const isBestValue = pkg.score.category === "best_value";
  const categoryLabel = pkg.score.category === "alternative" ? "" : t.recommendationBadge[pkg.score.category];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-white p-5",
        isBestValue ? "border-gold shadow-card-hover anim-glow-gold" : "border-border shadow-card"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-ink">{categoryLabel}</h3>
        {isBestValue && <RecommendationBadge category={pkg.score.category} />}
      </div>

      <div>
        <span className="text-[28px] font-semibold leading-none tracking-tight text-ink">
          {formatAmount(pkg.price.total, pkg.price.currency)}
        </span>
        <span className="ml-1.5 text-xs text-ink-muted">
          · {formatAmount(perPerson, pkg.price.currency)} {t.packageCard.perPerson}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-sand/70 px-3.5 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white">
            <Airplane className="size-4 text-navy" weight="regular" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">{t.filters.flight}</p>
            <p className="mt-0.5 truncate text-[13px] font-medium text-ink">{firstLeg.airline}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {firstLeg.origin.code} → {lastLeg.destination.code} · {formatDateShort(firstLeg.departureTime, locale)},{" "}
              {formatTime(firstLeg.departureTime, locale)} – {formatTime(lastLeg.arrivalTime, locale)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-sand/70 px-3.5 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white">
            <Bed className="size-4 text-navy" weight="regular" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              {t.filters.hotelCategory}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-medium text-ink">{pkg.hotel.name}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {"★".repeat(pkg.hotel.stars)} · {pkg.room.name}
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
              <p className="mt-0.5 truncate text-[13px] font-medium text-ink">{pkg.transfer.vehicle}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {pkg.transfer.type === "private" ? t.packageDetails.private : t.packageDetails.shared}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={() => onView(pkg)}
          className={cn(
            "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2",
            isBestValue ? "bg-gold text-navy-deep hover:bg-gold/90" : "bg-navy text-white hover:bg-navy-deep"
          )}
        >
          {t.packageCard.viewTrip}
        </button>
        <button
          type="button"
          onClick={() => onView(pkg)}
          className="w-full rounded-lg border border-border py-2 text-xs font-medium text-ink-muted transition-colors hover:border-navy/30 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
        >
          {t.packageCard.viewDetailsCta}
        </button>
      </div>
    </div>
  );
}
