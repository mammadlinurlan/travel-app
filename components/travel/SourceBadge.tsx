import { cn } from "@/lib/utils";
import type { FlightOffer, HotelOffer, TransferOffer } from "@/domain/travel/types";
import { useLocale } from "@/lib/i18n/locale-context";

interface SourceBadgeProps {
  kind: "flight" | "hotel" | "transfer";
  supplier: FlightOffer["supplier"] | HotelOffer["supplier"] | TransferOffer["supplier"];
  className?: string;
}

/**
 * Small, honest source label — never renders a vendor name we don't
 * actually have data from (e.g. never "Booking.com"/"Airbnb"). Labels come
 * from the locale dictionary's `sourceLabels`, keyed by the real
 * `supplier` field already on FlightOffer/HotelOffer/TransferOffer.
 */
export function SourceBadge({ kind, supplier, className }: SourceBadgeProps) {
  const { t } = useLocale();
  const labels = t.sourceBadge[kind] as Record<string, string>;
  const label = labels[supplier] ?? supplier;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-border bg-sand/70 px-2 py-0.5 text-[11px] font-medium text-ink-muted",
        className
      )}
    >
      {label}
    </span>
  );
}
