"use client";

import { Minus, Plus, Users } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/lib/i18n/locale-context";

interface TravelersValue {
  adults: number;
  children: number;
  infants: number;
}

interface TravelerSelectorProps {
  value: TravelersValue;
  onChange: (value: TravelersValue) => void;
}

export function TravelerSelector({ value, onChange }: TravelerSelectorProps) {
  const { t } = useLocale();
  const total = value.adults + value.children + value.infants;

  const ROWS: { key: keyof TravelersValue; label: string; hint: string; min: number }[] = [
    { key: "adults", label: t.search.adults, hint: t.search.adultsHint, min: 1 },
    { key: "children", label: t.search.children, hint: t.search.childrenHint, min: 0 },
    { key: "infants", label: t.search.infants, hint: t.search.infantsHint, min: 0 },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-navy">{t.search.travelersLabel}</label>
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
          <Users className="size-4 text-navy" weight="regular" />
          <span>{t.search.traveler(total)}</span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="start">
          <div className="flex flex-col gap-3">
            {ROWS.map((row, index) => (
              <div key={row.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{row.label}</p>
                    <p className="text-xs text-ink-muted">{row.hint}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7 rounded-full"
                      disabled={value[row.key] <= row.min}
                      onClick={() => onChange({ ...value, [row.key]: value[row.key] - 1 })}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-4 text-center text-sm font-medium">{value[row.key]}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7 rounded-full"
                      onClick={() => onChange({ ...value, [row.key]: value[row.key] + 1 })}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {index < ROWS.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
