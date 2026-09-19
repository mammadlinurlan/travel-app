"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { PackageCard } from "@/components/travel/PackageCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type {
  CabinClass,
  FlightOffer,
  HotelOffer,
  MealPlan,
  Room,
  TravelPackage,
  TripSearchRequest,
} from "@/domain/travel/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDateRange } from "@/lib/utils/format";
import { PackageFilters, type SortMode } from "./PackageFilters";
import { PackagesOfferView } from "./PackagesOfferView";
import { ResultsToolbar, type ResultsViewMode } from "./ResultsToolbar";
import { ResultsTopBar } from "./ResultsTopBar";
import { FlightsList, HotelsList } from "./SourceGroupedResults";

/** Results shown per page; "Load more" reveals the next batch. */
const PAGE_SIZE = 9;
const DEFAULT_STARS = [3, 4, 5];

interface PackageResultsProps {
  packages: TravelPackage[];
  travelerCount: number;
  warnings: string[];
  onSelect: (pkg: TravelPackage) => void;
  onSelectFlight: (flight: FlightOffer) => void;
  onSelectHotel: (hotel: HotelOffer, room: Room) => void;
  onNewSearch: () => void;
  cabinClass: CabinClass;
  onCabinClassChange: (cabin: CabinClass) => void;
  isRefetching?: boolean;
  onOpenBuilder: () => void;
  request: TripSearchRequest;
}

type ResultsScreen = "grid" | "packages";

export function PackageResults({
  packages,
  travelerCount,
  warnings,
  onSelect,
  onSelectFlight,
  onSelectHotel,
  onNewSearch,
  cabinClass,
  onCabinClassChange,
  isRefetching,
  onOpenBuilder,
  request,
}: PackageResultsProps) {
  const { t, locale } = useLocale();
  const [screen, setScreen] = useState<ResultsScreen>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [viewMode, setViewMode] = useState<ResultsViewMode>("flights");
  const [stars, setStars] = useState<number[]>(DEFAULT_STARS);
  const [minRating, setMinRating] = useState(0);
  const [directOnly, setDirectOnly] = useState(false);
  const [refundableOnly, setRefundableOnly] = useState(false);
  const [transferOnly, setTransferOnly] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedMealPlans, setSelectedMealPlans] = useState<MealPlan[]>([]);
  const [hotelQuery, setHotelQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const airlines = useMemo(
    () =>
      [...new Set(packages.map((pkg) => pkg.flight.outbound[0].airline))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [packages],
  );

  const mealPlans = useMemo(
    () => [...new Set(packages.map((pkg) => pkg.room.mealPlan))],
    [packages],
  );

  const priceBounds = useMemo(() => {
    if (packages.length === 0) return { min: 0, max: 0 };
    const totals = packages.map((pkg) => pkg.price.total);
    return { min: Math.floor(Math.min(...totals)), max: Math.ceil(Math.max(...totals)) };
  }, [packages]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    priceBounds.min,
    priceBounds.max,
  ]);
  const [boundsSignature, setBoundsSignature] = useState(`${priceBounds.min}:${priceBounds.max}`);

  // Re-seed the price range when a new result set arrives (e.g. after switching
  // cabin class) — adjusting during render rather than in an effect.
  const currentSignature = `${priceBounds.min}:${priceBounds.max}`;
  if (currentSignature !== boundsSignature) {
    setBoundsSignature(currentSignature);
    setPriceRange([priceBounds.min, priceBounds.max]);
  }

  const currency = packages[0]?.price.currency ?? "USD";

  const activeFilterCount =
    (stars.length !== DEFAULT_STARS.length ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (directOnly ? 1 : 0) +
    (refundableOnly ? 1 : 0) +
    (transferOnly ? 1 : 0) +
    (selectedAirlines.length > 0 && selectedAirlines.length !== airlines.length ? 1 : 0) +
    (selectedMealPlans.length > 0 && selectedMealPlans.length !== mealPlans.length ? 1 : 0) +
    (priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max ? 1 : 0);

  function resetFilters() {
    setStars(DEFAULT_STARS);
    setMinRating(0);
    setDirectOnly(false);
    setRefundableOnly(false);
    setTransferOnly(false);
    setSelectedAirlines([]);
    setSelectedMealPlans([]);
    setHotelQuery("");
    setPriceRange([priceBounds.min, priceBounds.max]);
  }

  const filtered = useMemo(() => {
    let result = packages.filter((pkg) => stars.includes(pkg.hotel.stars));
    if (minRating > 0) result = result.filter((pkg) => pkg.hotel.rating >= minRating);
    if (directOnly) result = result.filter((pkg) => pkg.flight.stops === 0);
    if (refundableOnly) result = result.filter((pkg) => pkg.room.refundable);
    if (transferOnly) result = result.filter((pkg) => pkg.transfer !== null);
    if (selectedAirlines.length > 0) {
      result = result.filter((pkg) => selectedAirlines.includes(pkg.flight.outbound[0].airline));
    }
    if (selectedMealPlans.length > 0) {
      result = result.filter((pkg) => selectedMealPlans.includes(pkg.room.mealPlan));
    }
    if (hotelQuery.trim() !== "") {
      const query = hotelQuery.trim().toLowerCase();
      result = result.filter((pkg) => pkg.hotel.name.toLowerCase().includes(query));
    }
    result = result.filter(
      (pkg) => pkg.price.total >= priceRange[0] && pkg.price.total <= priceRange[1],
    );

    const copy = [...result];
    switch (sortMode) {
      case "cheapest":
        return copy.sort((a, b) => a.price.total - b.price.total);
      case "best_hotel":
        return copy.sort(
          (a, b) => b.hotel.stars - a.hotel.stars || b.hotel.rating - a.hotel.rating,
        );
      case "shortest_flight":
        return copy.sort((a, b) => a.flight.totalDurationMinutes - b.flight.totalDurationMinutes);
      default:
        return copy;
    }
  }, [
    packages,
    sortMode,
    stars,
    minRating,
    directOnly,
    refundableOnly,
    transferOnly,
    selectedAirlines,
    selectedMealPlans,
    hotelQuery,
    priceRange,
  ]);

  // Reset pagination whenever the filtered set changes shape, so switching
  // filters doesn't strand the user on a page past the new (shorter) list.
  const filteredSignature = `${filtered.length}:${filtered[0]?.id ?? ""}`;
  const [lastFilteredSignature, setLastFilteredSignature] = useState(filteredSignature);
  if (filteredSignature !== lastFilteredSignature) {
    setLastFilteredSignature(filteredSignature);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // The header count/heading must reflect whichever tab is active — a
  // bundled-package count is meaningless while browsing flights or hotels
  // on their own, since many packages can share the same flight/hotel.
  const flightCount = useMemo(() => new Set(filtered.map((pkg) => pkg.flight.id)).size, [filtered]);
  const hotelCount = useMemo(() => new Set(filtered.map((pkg) => pkg.hotel.id)).size, [filtered]);
  const activeResultCount =
    viewMode === "flights" ? flightCount : viewMode === "hotels" ? hotelCount : filtered.length;

  const filterPanel = (
    <PackageFilters
      stars={stars}
      onStarsChange={setStars}
      minRating={minRating}
      onMinRatingChange={setMinRating}
      directOnly={directOnly}
      onDirectOnlyChange={setDirectOnly}
      refundableOnly={refundableOnly}
      onRefundableOnlyChange={setRefundableOnly}
      transferOnly={transferOnly}
      onTransferOnlyChange={setTransferOnly}
      airlines={airlines}
      selectedAirlines={selectedAirlines}
      onSelectedAirlinesChange={setSelectedAirlines}
      mealPlans={mealPlans}
      selectedMealPlans={selectedMealPlans}
      onSelectedMealPlansChange={setSelectedMealPlans}
      priceRange={priceRange}
      priceBounds={priceBounds}
      onPriceRangeChange={setPriceRange}
      currency={currency}
      cabinClass={cabinClass}
      onCabinClassChange={onCabinClassChange}
      isRefetching={isRefetching}
      onReset={resetFilters}
      hasActiveFilters={activeFilterCount > 0}
    />
  );

  const tripSummary = `${request.destination} · ${formatDateRange(
    request.departureDate,
    request.returnDate,
    locale,
  )} · ${t.search.traveler(travelerCount)}`;

  return (
    <div className="flex flex-col">
      <ResultsTopBar
        tripSummary={tripSummary}
        onBack={screen === "packages" ? () => setScreen("grid") : onNewSearch}
        onOpenBuilder={onOpenBuilder}
        onBuild={() => setScreen("packages")}
        showBuildCta={screen === "grid"}
      />
      {/* Spacer for the fixed top bar above (h-16) — `fixed` is used instead of
          `sticky` because this tree sits under Framer Motion's AnimatePresence,
          where an animated ancestor's transform can silently break `position:
          sticky`; `fixed` has no such dependency and is also trivially full-width. */}
      <div className="h-14 sm:h-16" aria-hidden />

      {screen === "packages" ? (
        <PackagesOfferView
          packages={packages}
          travelerCount={travelerCount}
          tripSummary={tripSummary}
          onSelect={onSelect}
          onBack={() => setScreen("grid")}
        />
      ) : (
        <>
          <ResultsToolbar
            resultCount={activeResultCount}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            onNewSearch={onNewSearch}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
            hotelQuery={hotelQuery}
            onHotelQueryChange={setHotelQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {warnings.length > 0 && (
            <div className="mt-6 flex flex-col gap-1.5 rounded-xl border border-gold/50 bg-gold/15 px-4 py-3">
              {warnings.map((warning) => (
                <p key={warning} className="flex items-start gap-2 text-sm text-ink">
                  <WarningCircle
                    className="mt-0.5 size-4 shrink-0 text-gold-deep"
                    weight="fill"
                    aria-hidden
                  />
                  {t.warnings[warning as keyof typeof t.warnings] ?? warning}
                </p>
              ))}
            </div>
          )}

          <div className="mt-8 flex gap-8">
            <aside className="hidden w-[248px] shrink-0 lg:block">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-panel">
                {filterPanel}
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              {packages.length === 0 ? (
                <EmptyState
                  title={t.results.noTripTitle}
                  body={
                    warnings[0]
                      ? (t.warnings[warnings[0] as keyof typeof t.warnings] ?? warnings[0])
                      : t.results.tryAdjusting
                  }
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title={t.results.noMatchTitle}
                  body={t.results.noMatchBody}
                  action={
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2"
                    >
                      {t.results.clearFilters}
                    </button>
                  }
                />
              ) : viewMode === "flights" ? (
                <FlightsList
                  packages={filtered}
                  onSelectFlight={onSelectFlight}
                  onSelectHotel={onSelectHotel}
                />
              ) : viewMode === "hotels" ? (
                <HotelsList
                  packages={filtered}
                  onSelectFlight={onSelectFlight}
                  onSelectHotel={onSelectHotel}
                />
              ) : (
                <>
                  <div className="card-stagger grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((pkg, index) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        travelerCount={travelerCount}
                        onView={onSelect}
                        index={index}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                        className="rounded-lg border border-border bg-white px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-navy/30 hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
                      >
                        {t.results.loadMore(filtered.length - visible.length)}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="left"
          className="gap-0 overflow-y-auto p-0 data-[side=left]:w-full data-[side=left]:sm:max-w-sm"
        >
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="text-base font-semibold text-ink">
              {t.results.filtersTitle}
            </SheetTitle>
          </SheetHeader>

          <div className="px-5 pb-28 pt-2">{filterPanel}</div>

          <div className="sticky bottom-0 border-t border-border bg-white px-5 py-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="w-full rounded-lg bg-navy py-3 text-sm font-medium text-white transition-colors hover:bg-navy-deep"
            >
              {t.results.showTrips(filtered.length)}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-20 text-center">
      <WarningCircle className="size-8 text-ink-muted" weight="regular" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{body}</p>
      {action}
    </div>
  );
}
