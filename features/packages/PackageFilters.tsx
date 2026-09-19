"use client";

import { Star } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import type { CabinClass, MealPlan } from "@/domain/travel/types";

export type SortMode = "recommended" | "cheapest" | "best_hotel" | "shortest_flight";

export const SORT_MODES: SortMode[] = ["recommended", "cheapest", "best_hotel", "shortest_flight"];

const STAR_OPTIONS = [3, 4, 5];
const RATING_OPTIONS = [7, 8, 9];
const CABIN_OPTIONS: CabinClass[] = ["economy", "business"];

export interface PriceBounds {
  min: number;
  max: number;
}

interface PackageFiltersProps {
  stars: number[];
  onStarsChange: (stars: number[]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  directOnly: boolean;
  onDirectOnlyChange: (value: boolean) => void;
  refundableOnly: boolean;
  onRefundableOnlyChange: (value: boolean) => void;
  transferOnly: boolean;
  onTransferOnlyChange: (value: boolean) => void;
  airlines: string[];
  selectedAirlines: string[];
  onSelectedAirlinesChange: (airlines: string[]) => void;
  mealPlans: MealPlan[];
  selectedMealPlans: MealPlan[];
  onSelectedMealPlansChange: (mealPlans: MealPlan[]) => void;
  priceRange: [number, number];
  priceBounds: PriceBounds;
  onPriceRangeChange: (range: [number, number]) => void;
  currency: string;
  cabinClass: CabinClass;
  onCabinClassChange: (cabin: CabinClass) => void;
  isRefetching?: boolean;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function PackageFilters({
  stars,
  onStarsChange,
  minRating,
  onMinRatingChange,
  directOnly,
  onDirectOnlyChange,
  refundableOnly,
  onRefundableOnlyChange,
  transferOnly,
  onTransferOnlyChange,
  airlines,
  selectedAirlines,
  onSelectedAirlinesChange,
  mealPlans,
  selectedMealPlans,
  onSelectedMealPlansChange,
  priceRange,
  priceBounds,
  onPriceRangeChange,
  currency,
  cabinClass,
  onCabinClassChange,
  isRefetching,
  onReset,
  hasActiveFilters,
}: PackageFiltersProps) {
  const { t } = useLocale();

  function toggleStar(value: number) {
    onStarsChange(stars.includes(value) ? stars.filter((s) => s !== value) : [...stars, value].sort());
  }

  // An empty selection means "all airlines". Expand it before toggling so that
  // unchecking one airline removes just that one instead of selecting only it.
  function toggleAirline(airline: string) {
    const current = selectedAirlines.length === 0 ? airlines : selectedAirlines;
    const next = current.includes(airline)
      ? current.filter((a) => a !== airline)
      : [...current, airline];
    onSelectedAirlinesChange(next.length === airlines.length ? [] : next);
  }

  // Same "empty selection means all" convention as toggleAirline.
  function toggleMealPlan(mealPlan: MealPlan) {
    const current = selectedMealPlans.length === 0 ? mealPlans : selectedMealPlans;
    const next = current.includes(mealPlan)
      ? current.filter((m) => m !== mealPlan)
      : [...current, mealPlan];
    onSelectedMealPlansChange(next.length === mealPlans.length ? [] : next);
  }

  function commitPrice(index: 0 | 1, raw: string) {
    const fallback = index === 0 ? priceBounds.min : priceBounds.max;
    const parsed = raw === "" ? fallback : Number(raw);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.min(Math.max(parsed, priceBounds.min), priceBounds.max);
    const next: [number, number] = index === 0 ? [clamped, priceRange[1]] : [priceRange[0], clamped];
    if (next[0] > next[1]) return;
    onPriceRangeChange(next);
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{t.filters.title}</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="rounded text-xs font-medium text-navy underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
          >
            {t.filters.clearAll}
          </button>
        )}
      </div>

      <Section label={t.filters.hotelCategory}>
        <div className="flex flex-wrap gap-1.5">
          {STAR_OPTIONS.map((value) => {
            const active = stars.includes(value);
            return (
              <button
                type="button"
                key={value}
                onClick={() => toggleStar(value)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40",
                  active
                    ? "border-navy bg-navy text-white"
                    : "border-border bg-white text-ink hover:border-navy/30 hover:bg-sand"
                )}
              >
                {value}
                <Star className="size-3" weight={active ? "fill" : "regular"} aria-hidden />
              </button>
            );
          })}
        </div>
      </Section>

      <Section label={t.filters.guestRating}>
        <div className="flex flex-wrap gap-1.5">
          {[0, ...RATING_OPTIONS].map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => onMinRatingChange(value)}
              aria-pressed={minRating === value}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40",
                minRating === value
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-white text-ink hover:border-navy/30 hover:bg-sand"
              )}
            >
              {value === 0 ? t.filters.any : `${value}+`}
            </button>
          ))}
        </div>
      </Section>

      <Section label={t.filters.flight}>
        <fieldset className="flex flex-col gap-2" disabled={isRefetching}>
          <legend className="sr-only">{t.filters.cabinClassLegend}</legend>
          {CABIN_OPTIONS.map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 text-sm text-ink transition-opacity",
                isRefetching && "opacity-50"
              )}
            >
              <input
                type="radio"
                name="cabin-class"
                value={option}
                checked={cabinClass === option}
                onChange={() => onCabinClassChange(option)}
                className="size-4 accent-navy"
              />
              {t.cabinClass[option]}
              {isRefetching && cabinClass === option && (
                <span className="text-xs text-ink-muted">{t.filters.updating}</span>
              )}
            </label>
          ))}
        </fieldset>

        <label className="mt-3 flex cursor-pointer items-center justify-between gap-2.5 text-sm text-ink">
          <span>{t.filters.directOnly}</span>
          <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-border transition-colors has-checked:bg-navy">
            <input
              type="checkbox"
              checked={directOnly}
              onChange={(e) => onDirectOnlyChange(e.target.checked)}
              className="peer sr-only"
            />
            <span className="pointer-events-none absolute left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>

        {airlines.length > 1 && (
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <span className="text-xs font-medium text-ink-muted">{t.filters.airlines}</span>
            {airlines.map((airline) => (
              <label key={airline} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selectedAirlines.length === 0 || selectedAirlines.includes(airline)}
                  onChange={() => toggleAirline(airline)}
                  className="size-4 rounded accent-navy"
                />
                <span className="truncate">{airline}</span>
              </label>
            ))}
          </div>
        )}
      </Section>

      {mealPlans.length > 1 && (
        <Section label={t.filters.mealPlan}>
          <div className="flex flex-col gap-2">
            {mealPlans.map((mealPlan) => (
              <label key={mealPlan} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={selectedMealPlans.length === 0 || selectedMealPlans.includes(mealPlan)}
                  onChange={() => toggleMealPlan(mealPlan)}
                  className="size-4 rounded accent-navy"
                />
                {t.mealPlanLabels[mealPlan]}
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section label={t.filters.included}>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={transferOnly}
              onChange={(e) => onTransferOnlyChange(e.target.checked)}
              className="size-4 rounded accent-navy"
            />
            {t.filters.airportTransfer}
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={refundableOnly}
              onChange={(e) => onRefundableOnlyChange(e.target.checked)}
              className="size-4 rounded accent-navy"
            />
            {t.filters.freeCancellation}
          </label>
        </div>
      </Section>

      <Section label={t.filters.price} last>
        <div className="flex items-center gap-2">
          <PriceInput
            label={t.filters.minPriceSr}
            value={priceRange[0]}
            currency={currency}
            onCommit={(raw) => commitPrice(0, raw)}
          />
          <span className="text-ink-muted" aria-hidden>
            —
          </span>
          <PriceInput
            label={t.filters.maxPriceSr}
            value={priceRange[1]}
            currency={currency}
            onCommit={(raw) => commitPrice(1, raw)}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={cn("border-t border-border py-4", last && "pb-0")}>
      <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</h3>
      {children}
    </section>
  );
}

function PriceInput({
  label,
  value,
  currency,
  onCommit,
}: {
  label: string;
  value: number;
  currency: string;
  onCommit: (raw: string) => void;
}) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
        {currency === "USD" ? "$" : ""}
      </span>
      <input
        type="number"
        inputMode="numeric"
        defaultValue={value}
        key={value}
        onBlur={(e) => onCommit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className={cn(
          "w-full rounded-lg border border-border bg-white py-2 pr-2 text-sm text-ink transition-colors",
          "focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20",
          currency === "USD" ? "pl-5" : "pl-2.5"
        )}
      />
    </label>
  );
}
