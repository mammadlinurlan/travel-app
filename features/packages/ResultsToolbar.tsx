"use client";

import { ArrowLeft, MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SORT_MODES, type SortMode } from "./PackageFilters";
import { useLocale } from "@/lib/i18n/locale-context";

interface ResultsToolbarProps {
  resultCount: number;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  onNewSearch: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  hotelQuery: string;
  onHotelQueryChange: (query: string) => void;
}

export function ResultsToolbar({
  resultCount,
  sortMode,
  onSortModeChange,
  onNewSearch,
  onOpenFilters,
  activeFilterCount,
  hotelQuery,
  onHotelQueryChange,
}: ResultsToolbarProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onNewSearch}
        className="group flex w-fit items-center gap-1.5 rounded-lg text-sm font-medium text-ink-muted transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2"
      >
        <ArrowLeft
          className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          weight="bold"
          aria-hidden
        />
        {t.toolbar.newSearch}
      </button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[32px]">
            {t.toolbar.heading(resultCount)}
          </h1>
          <p className="text-sm text-ink-muted">{t.toolbar.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">{t.toolbar.searchHotelSr}</span>
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              weight="regular"
              aria-hidden
            />
            <input
              type="text"
              value={hotelQuery}
              onChange={(e) => onHotelQueryChange(e.target.value)}
              placeholder={t.toolbar.searchHotelPlaceholder}
              className="h-10 w-[200px] rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </label>

          <button
            type="button"
            onClick={onOpenFilters}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 lg:hidden"
          >
            <SlidersHorizontal className="size-4" weight="regular" aria-hidden />
            {t.toolbar.filters}
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="hidden shrink-0 text-sm text-ink-muted sm:inline">
            {t.toolbar.resultsCount(resultCount)}
          </span>

          <Select value={sortMode} onValueChange={(value) => onSortModeChange(value as SortMode)}>
            <SelectTrigger
              aria-label={t.toolbar.sortAria}
              className="h-10 w-[168px] rounded-lg border-border bg-white text-sm text-ink shadow-none"
            >
              <span className="flex flex-1 text-left">{t.sort[sortMode]}</span>
            </SelectTrigger>
            <SelectContent>
              {SORT_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {t.sort[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
