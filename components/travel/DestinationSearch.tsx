"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass, MapPin } from "@phosphor-icons/react/dist/ssr";
import { searchAirports } from "@/lib/api/client";
import { DESTINATION_OPTIONS } from "@/providers/mock-data/destinations-client";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Airport } from "@/domain/travel/types";

interface DestinationSearchProps {
  value: string;
  label?: string;
  onChange: (code: string, label?: string) => void;
  error?: string;
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function DestinationSearch({ value, label: externalLabel, onChange, error }: DestinationSearchProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("");
  const [open, setOpen] = useState(false);
  const [syncedLabel, setSyncedLabel] = useState(externalLabel);
  const debouncedQuery = useDebouncedValue(query, 300);

  // Adjust state during render (React's recommended pattern) instead of an
  // effect: keeps `label` in sync whenever a new externalLabel arrives (e.g.
  // the AI parser resolves a destination) without an extra render pass.
  if (externalLabel !== syncedLabel) {
    setSyncedLabel(externalLabel);
    if (externalLabel) setLabel(externalLabel);
  }

  const { data: airports, isFetching } = useQuery({
    queryKey: ["airport-search", debouncedQuery],
    queryFn: () => searchAirports(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  function select(code: string, cityLabel: string) {
    onChange(code, cityLabel);
    setLabel(cityLabel);
    setQuery("");
    setOpen(false);
  }

  const showLiveResults = query.trim().length >= 2;
  const suggestions: Airport[] = showLiveResults ? (airports ?? []) : [];

  return (
    <div className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ivory/90">{t.search.destinationLabel}</label>

      <div className="relative">
        <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold" weight="regular" />
        <input
          value={open ? query : label || value || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLabel("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          placeholder={t.search.destinationPlaceholder}
          className="h-12 w-full rounded-lg border border-ivory/15 bg-ivory/[0.05] pl-9 pr-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
        />
      </div>

      {open && (
        <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white shadow-lg">
          {!showLiveResults && (
            <div className="flex flex-col">
              <p className="px-3 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {t.search.popularDestinations}
              </p>
              {DESTINATION_OPTIONS.map((d) => (
                <button
                  key={d.code}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(d.code, d.city);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-sand/60"
                >
                  <MapPin className="size-4 text-navy" weight="regular" />
                  <span className="font-medium">{d.city}</span>
                  <span className="text-ink-muted">{d.country}</span>
                </button>
              ))}
            </div>
          )}

          {showLiveResults && isFetching && (
            <p className="px-3 py-3 text-sm text-ink-muted">{t.search.searching}</p>
          )}

          {showLiveResults && !isFetching && suggestions.length === 0 && (
            <p className="px-3 py-3 text-sm text-ink-muted">{t.search.noAirports}</p>
          )}

          {showLiveResults &&
            suggestions.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(airport.code, airport.city);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-sand/60"
              >
                <MapPin className="size-4 shrink-0 text-navy" weight="regular" />
                <span className="flex-1 truncate">
                  <span className="font-medium">{airport.city}</span>{" "}
                  <span className="text-ink-muted">— {airport.name}</span>
                </span>
                <span className={cn("shrink-0 text-xs font-semibold text-ink-muted")}>{airport.code}</span>
              </button>
            ))}
        </div>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
