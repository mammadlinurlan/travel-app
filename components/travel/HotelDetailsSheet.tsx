"use client";

import Image from "next/image";
import { Check, MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatAmount } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import type { HotelOffer, Room } from "@/domain/travel/types";

interface HotelDetailsSheetProps {
  hotel: HotelOffer | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (hotel: HotelOffer, room: Room) => void;
}

/** Read-only hotel details with a room list — opened from a hotel card; "Seç" on a room is what selects it. */
export function HotelDetailsSheet({ hotel, onOpenChange, onSelect }: HotelDetailsSheetProps) {
  const { t } = useLocale();

  return (
    <Sheet open={hotel !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto bg-background p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg **:data-[slot=sheet-close]:bg-navy-deep/40 **:data-[slot=sheet-close]:text-white hover:**:data-[slot=sheet-close]:bg-navy-deep/60"
      >
        {hotel && (
          <>
            <div className="relative h-44 w-full shrink-0 bg-sand">
              {hotel.image && <Image src={hotel.image} alt={hotel.name} fill sizes="576px" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/20 to-transparent" />
              <div className="absolute inset-x-5 bottom-4 flex flex-col gap-1">
                <SheetHeader className="p-0">
                  <SheetTitle className="text-left text-xl font-semibold text-white">{hotel.name}</SheetTitle>
                </SheetHeader>
              </div>
            </div>

            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-0.5 text-gold-deep" aria-label={t.packageCard.starHotelAria(hotel.stars)}>
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star key={i} className="size-3.5" weight="fill" aria-hidden />
                  ))}
                </span>
                {hotel.rating > 0 && (
                  <span className="text-sm text-ink-muted">
                    <span className="font-semibold text-ink">{hotel.rating.toFixed(1)}</span> {t.packageCard.reviews(hotel.reviewCount)}
                  </span>
                )}
              </div>

              <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                <MapPin className="size-4 shrink-0 text-navy" weight="regular" aria-hidden />
                {hotel.address}
              </p>

              {hotel.amenities.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {hotel.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-1.5 text-xs text-ink">
                      <Check className="size-3.5 shrink-0 text-success" weight="bold" aria-hidden />
                      {amenity}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {t.sourceGrouped.roomOptions}
                </p>
                {hotel.rooms.map((room) => (
                  <div
                    key={room.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-4"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{room.name}</p>
                      <p className="text-xs text-ink-muted">
                        {t.mealPlanLabels[room.mealPlan]} ·{" "}
                        {room.refundable ? t.packageDetails.freeCancellation : t.packageDetails.nonRefundable}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {formatAmount(room.price.amount, room.price.currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelect(hotel, room)}
                      className="shrink-0 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2"
                    >
                      {t.sourceGrouped.selectCta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
