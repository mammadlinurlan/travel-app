"use client";

import { Airplane, Suitcase } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatAmount, formatDateShort, formatDuration, formatTime } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { FlightOffer } from "@/domain/travel/types";

interface FlightDetailsSheetProps {
  flight: FlightOffer | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (flight: FlightOffer) => void;
}

/** Read-only flight details — opened from a flight card; "Seç" is the only action that selects it. */
export function FlightDetailsSheet({ flight, onOpenChange, onSelect }: FlightDetailsSheetProps) {
  const { t, locale } = useLocale();

  return (
    <Sheet open={flight !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto bg-background p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
      >
        {flight && (
          <>
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle className="text-left text-lg font-semibold text-ink">
                {t.sourceGrouped.flightDetailsTitle}
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-5 py-5">
              <FlightLegs flight={flight} locale={locale} />

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-white p-4 text-sm">
                <InfoRow label={t.packageDetails.totalFlightTime} value={formatDuration(flight.totalDurationMinutes)} />
                <InfoRow
                  label={t.packageCard.direct}
                  value={flight.stops === 0 ? t.packageDetails.yes : t.packageCard.stops(flight.stops)}
                />
                <InfoRow label={t.packageDetails.checkedBaggage} value={String(flight.baggage.checked)} />
                <InfoRow label={t.packageDetails.cabinBaggage} value={String(flight.baggage.cabin)} />
                <InfoRow label={t.packageDetails.fare} value={flight.fareBrand} />
                <InfoRow
                  label={t.packageDetails.refundable}
                  value={flight.refundable ? t.packageDetails.yes : t.packageDetails.no}
                />
              </div>
            </div>

            <div className="sticky bottom-0 mt-auto flex items-center justify-between gap-4 border-t border-border bg-white px-5 py-4">
              <span className="text-xl font-semibold text-ink">{formatAmount(flight.price.amount, flight.price.currency)}</span>
              <button
                type="button"
                onClick={() => onSelect(flight)}
                className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2"
              >
                {t.sourceGrouped.selectCta}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function FlightLegs({ flight, locale }: { flight: FlightOffer; locale: Parameters<typeof formatTime>[1] }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-4">
      <Leg title={t.packageDetails.outbound} segments={flight.outbound} locale={locale} />
      {flight.inbound.length > 0 && <Leg title={t.packageDetails.return} segments={flight.inbound} locale={locale} />}
    </div>
  );
}

function Leg({
  title,
  segments,
  locale,
}: {
  title: string;
  segments: FlightOffer["outbound"];
  locale: Parameters<typeof formatTime>[1];
}) {
  const { t } = useLocale();
  const first = segments[0];
  const last = segments[segments.length - 1];
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{title}</p>
      <p className="text-[15px] font-semibold tracking-tight text-ink">
        {first.origin.code} <span className="text-ink-muted">→</span> {last.destination.code}
      </p>
      <p className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Suitcase className="size-3.5" weight="regular" aria-hidden />
        {first.origin.city} → {last.destination.city}
      </p>

      {segments.map((segment, i) => (
        <div key={segment.id} className="flex flex-col gap-2">
          {i > 0 && (
            <p className="rounded-lg bg-sand/70 px-2.5 py-1.5 text-xs font-medium text-ink-muted">
              {t.packageDetails.layoverAt(
                segment.origin.code,
                formatDuration(
                  (new Date(segment.departureTime).getTime() -
                    new Date(segments[i - 1].arrivalTime).getTime()) /
                    60000
                )
              )}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Airplane className="size-4 text-navy" weight="regular" aria-hidden />
            <span className="text-sm font-medium text-ink">{segment.airline}</span>
            <span className="text-xs text-ink-muted">· {segment.flightNumber}</span>
          </div>
          <p className="text-sm text-ink">
            {segment.origin.code} → {segment.destination.code} · {formatDateShort(segment.departureTime, locale)},{" "}
            {formatTime(segment.departureTime, locale)} —{" "}
            {formatDateShort(segment.arrivalTime, locale) !== formatDateShort(segment.departureTime, locale) &&
              `${formatDateShort(segment.arrivalTime, locale)}, `}
            {formatTime(segment.arrivalTime, locale)}
          </p>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-[0.06em] text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
