"use client";

import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateShort } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/locale-context";

interface TravelDatePickerProps {
  departureDate: string;
  returnDate: string;
  onChange: (departureDate: string, returnDate: string) => void;
  error?: string;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function TravelDatePicker({ departureDate, returnDate, onChange, error }: TravelDatePickerProps) {
  const { t, locale } = useLocale();
  const range: DateRange | undefined = departureDate
    ? { from: new Date(departureDate), to: returnDate ? new Date(returnDate) : undefined }
    : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-navy">{t.search.datesLabel}</label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              type="button"
              className="h-12 w-full justify-start gap-2 border-border bg-white font-normal text-ink hover:bg-sand/60"
            />
          }
        >
          <CalendarBlank className="size-4 text-navy" weight="regular" />
          {departureDate && returnDate ? (
            <span>
              {formatDateShort(departureDate, locale)} — {formatDateShort(returnDate, locale)}
            </span>
          ) : (
            <span className="text-ink-muted">{t.search.datesPlaceholder}</span>
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
