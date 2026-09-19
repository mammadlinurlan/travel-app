"use client";

import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDateShort } from "@/lib/utils/format";

interface TravelDatePickerProps {
  departureDate: string;
  returnDate: string;
  onChange: (departureDate: string, returnDate: string) => void;
  error?: string;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function TravelDatePicker({
  departureDate,
  returnDate,
  onChange,
  error,
}: TravelDatePickerProps) {
  const { t, locale } = useLocale();
  const range: DateRange | undefined = departureDate
    ? { from: new Date(departureDate), to: returnDate ? new Date(returnDate) : undefined }
    : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ivory/90">{t.search.datesLabel}</label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              type="button"
              className="h-12 w-full justify-start gap-2 overflow-hidden border-ivory/15 bg-ivory/[0.05] font-normal text-ivory hover:bg-ivory/10"
            />
          }
        >
          <CalendarBlank className="size-4 shrink-0 text-gold" weight="regular" />
          {departureDate && returnDate ? (
            <span className="min-w-0 flex-1 truncate text-left">
              {formatDateShort(departureDate, locale)} — {formatDateShort(returnDate, locale)}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-left text-ivory/40">
              {t.search.datesPlaceholder}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={(next) => {
              if (next?.from) {
                onChange(toIsoDate(next.from), next.to ? toIsoDate(next.to) : "");
              }
            }}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
