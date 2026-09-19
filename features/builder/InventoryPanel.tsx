"use client";

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Airplane, Bed, Car, DotsSixVertical, Star } from "@phosphor-icons/react/dist/ssr";
import { cheapestRoomFor } from "@/domain/travel/pricing";
import { formatAmount, formatDateShort, formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import type { HotelOffer } from "@/domain/travel/types";
import type { BuilderInventory } from "./builder-inventory";
import type { InventoryItemData } from "./types";

interface InventoryPanelProps {
  inventory: BuilderInventory;
  onSelect: (data: InventoryItemData) => void;
  onPickHotel: (hotel: HotelOffer) => void;
  selectedFlightId: string | null;
  selectedHotelId: string | null;
  selectedTransferId: string | null;
}

const TYPE_STYLES = {
  flight: { chip: "bg-navy/8 text-navy", icon: Airplane },
  hotel: { chip: "bg-sand text-navy", icon: Bed },
  "hotel-picker": { chip: "bg-sand text-navy", icon: Bed },
  transfer: { chip: "bg-success/8 text-success", icon: Car },
} as const;

function Row({
  id,
  data,
  active,
  onClick,
  children,
}: {
  id: string;
  data: InventoryItemData;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  const Icon = TYPE_STYLES[data.type].icon;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-grab select-none items-center gap-2.5 p-3 text-left text-sm transition-colors active:scale-[0.99] active:cursor-grabbing",
        active ? "bg-navy/5" : "hover:bg-sand/60",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <DotsSixVertical className="hidden size-3.5 shrink-0 text-border lg:block" aria-hidden />
      <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", TYPE_STYLES[data.type].chip)}>
        <Icon className="size-3.5" weight="regular" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
      <span className="shrink-0 text-[10px] font-semibold text-gold lg:hidden">{t.builder.tapToAdd}</span>
    </button>
  );
}

export function InventoryPanel({
  inventory,
  onSelect,
  onPickHotel,
  selectedFlightId,
  selectedHotelId,
  selectedTransferId,
}: InventoryPanelProps) {
  const { t, locale } = useLocale();
  const [categoryFilter, setCategoryFilter] = useState<"all" | "flight" | "hotel" | "transfer">("all");

  const categories: { key: "all" | "flight" | "hotel" | "transfer"; label: string }[] = [
    { key: "all", label: t.builder.filterAll },
    { key: "hotel", label: t.toolbar.viewTab.hotels },
    { key: "flight", label: t.toolbar.viewTab.flights },
    { key: "transfer", label: t.packageDetails.transfer },
  ];

  const showFlights = categoryFilter === "all" || categoryFilter === "flight" ? inventory.flights : [];
  const showHotelsCategory = categoryFilter === "all" || categoryFilter === "hotel";

  // One row per hotel (not per room) — its room/meal-plan choice happens in
  // the picker modal opened on click/drop, not inline in this list.
  const hotels = useMemo(() => {
    if (!showHotelsCategory) return [];
    const seen = new Set<string>();
    const result: HotelOffer[] = [];
    for (const { hotel } of inventory.hotelRooms) {
      if (seen.has(hotel.id)) continue;
      seen.add(hotel.id);
      result.push(hotel);
    }
    return result;
  }, [inventory.hotelRooms, showHotelsCategory]);
  const showTransfers = categoryFilter === "all" || categoryFilter === "transfer" ? inventory.transfers : [];

  return (
    <div className="flex flex-col">
      <div className="border-b border-border p-3.5">
        <p className="mb-2.5 text-xs font-semibold text-ink">{t.builder.selectAndAdd}</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoryFilter(key)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                categoryFilter === key ? "bg-navy text-ivory" : "bg-sand text-ink-muted hover:text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[calc(100vh-320px)] flex-1 divide-y divide-border overflow-y-auto lg:max-h-[calc(100vh-280px)]">
        {showFlights.map(({ flight }) => {
          const firstLeg = flight.outbound[0];
          const lastLeg = flight.outbound[flight.outbound.length - 1];
          const data: InventoryItemData = { type: "flight", flightId: flight.id };
          return (
            <Row
              key={flight.id}
              id={`flight-${flight.id}`}
              data={data}
              active={selectedFlightId === flight.id}
              onClick={() => onSelect(data)}
            >
              <p className="truncate text-xs font-semibold text-ink">
                {firstLeg.airline} · {firstLeg.origin.code}→{lastLeg.destination.code}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {formatDateShort(firstLeg.departureTime, locale)}, {formatTime(firstLeg.departureTime, locale)} —{" "}
                {formatTime(lastLeg.arrivalTime, locale)}
              </p>
              <span className="mt-0.5 text-[11px] font-bold text-ink">{formatAmount(flight.price.amount, flight.price.currency)}</span>
            </Row>
          );
        })}

        {hotels.map((hotel) => {
          const cheapestRoom = cheapestRoomFor(hotel);
          const data: InventoryItemData = { type: "hotel-picker", hotelId: hotel.id };
          return (
            <Row
              key={hotel.id}
              id={`hotel-${hotel.id}`}
              data={data}
              active={selectedHotelId === hotel.id}
              onClick={() => onPickHotel(hotel)}
            >
              <p className="truncate text-xs font-semibold text-ink">{hotel.name}</p>
              <span className="flex items-center gap-0.5 text-gold-deep">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} className="size-2.5" weight="fill" aria-hidden />
                ))}
              </span>
              <span className="mt-0.5 text-[11px] font-bold text-ink">
                {t.sourceGrouped.fromPrice} {formatAmount(cheapestRoom.price.amount, cheapestRoom.price.currency)}
              </span>
            </Row>
          );
        })}

        {showTransfers.length === 0 && categoryFilter !== "flight" && categoryFilter !== "hotel" && inventory.transfers.length === 0 && (
          <p className="p-3.5 text-xs text-ink-muted">{t.customize.noTransfer}</p>
        )}
        {showTransfers.map(({ transfer }) => {
          const data: InventoryItemData = { type: "transfer", transferId: transfer.id };
          return (
            <Row
              key={transfer.id}
              id={`transfer-${transfer.id}`}
              data={data}
              active={selectedTransferId === transfer.id}
              onClick={() => onSelect(data)}
            >
              <p className="truncate text-xs font-semibold text-ink">{transfer.vehicle}</p>
              <span className="mt-0.5 text-[11px] font-bold text-ink">{formatAmount(transfer.price.amount, transfer.price.currency)}</span>
            </Row>
          );
        })}
      </div>
    </div>
  );
}
