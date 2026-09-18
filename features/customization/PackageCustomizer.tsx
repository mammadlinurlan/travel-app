"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Check } from "@phosphor-icons/react/dist/ssr";
import type { FlightOffer, HotelOffer, Room, TransferOffer, TravelPackage } from "@/domain/travel/types";
import { cn } from "@/lib/utils";
import { formatMoney, formatDuration } from "@/lib/utils/format";
import { useRecalculatePackage } from "./use-recalculate";
import { useLocale, type Dictionary } from "@/lib/i18n/locale-context";

interface PackageCustomizerProps {
  current: TravelPackage;
  allPackages: TravelPackage[];
  onUpdated: (pkg: TravelPackage) => void;
}

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    result.push(item);
  }
  return result;
}

export function PackageCustomizer({ current, allPackages, onUpdated }: PackageCustomizerProps) {
  const { t } = useLocale();
  const recalculate = useRecalculatePackage(current.id);

  const flights = useMemo(() => uniqueBy(allPackages.map((p) => p.flight), (f) => f.id), [allPackages]);
  const hotelRoomPairs = useMemo(
    () => uniqueBy(allPackages.map((p) => ({ hotel: p.hotel, room: p.room })), (p) => `${p.hotel.id}:${p.room.id}`),
    [allPackages]
  );
  const transfers = useMemo(
    () => uniqueBy(allPackages.map((p) => p.transfer).filter((t): t is TransferOffer => t !== null), (t) => t.id),
    [allPackages]
  );

  async function apply(customization: Parameters<ReturnType<typeof useRecalculatePackage>["mutateAsync"]>[0]) {
    const updated = await recalculate.mutateAsync(customization);
    onUpdated(updated);
  }

  return (
    <div className="flex flex-col gap-6">
      <CustomizerSection title={t.customize.flight}>
        {flights.map((flight) => (
          <FlightOption
            key={flight.id}
            flight={flight}
            selected={flight.id === current.flight.id}
            disabled={recalculate.isPending}
            onSelect={() => apply({ flightId: flight.id })}
            t={t}
          />
        ))}
      </CustomizerSection>

      <CustomizerSection title={t.customize.hotelAndRoom}>
        {hotelRoomPairs.map(({ hotel, room }) => (
          <HotelRoomOption
            key={`${hotel.id}:${room.id}`}
            hotel={hotel}
            room={room}
            selected={hotel.id === current.hotel.id && room.id === current.room.id}
            disabled={recalculate.isPending}
            onSelect={() => apply({ hotelId: hotel.id, roomId: room.id })}
            t={t}
          />
        ))}
      </CustomizerSection>

      <CustomizerSection title={t.customize.transfer}>
        <TransferOption
          label={t.customize.noTransfer}
          price={null}
          selected={current.transfer === null}
          disabled={recalculate.isPending}
          onSelect={() => apply({ transferId: null })}
        />
        {transfers.map((transfer) => (
          <TransferOption
            key={transfer.id}
            label={`${transfer.type === "private" ? t.packageDetails.private : t.packageDetails.shared} · ${transfer.vehicle}`}
            price={transfer.price}
            selected={current.transfer?.id === transfer.id}
            disabled={recalculate.isPending}
            onSelect={() => apply({ transferId: transfer.id })}
          />
        ))}
      </CustomizerSection>

      {recalculate.isError && (
        <p className="text-sm text-error">{(recalculate.error as Error).message}</p>
      )}
    </div>
  );
}

function CustomizerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-navy">{title}</h4>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function OptionShell({
  selected,
  disabled,
  onSelect,
  children,
}: {
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled || selected}
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default",
        selected ? "border-navy bg-navy/5" : "border-border bg-white hover:bg-sand/50"
      )}
    >
      {children}
      {selected && <Check className="size-4 shrink-0 text-navy" weight="bold" />}
    </button>
  );
}

function FlightOption({
  flight,
  selected,
  disabled,
  onSelect,
  t,
}: {
  flight: FlightOffer;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  t: Dictionary;
}) {
  return (
    <OptionShell selected={selected} disabled={disabled} onSelect={onSelect}>
      <div>
        <p className="font-medium text-ink">
          {flight.outbound[0].airline} · {flight.stops === 0 ? t.customize.direct : t.customize.stop(flight.stops)}
        </p>
        <p className="text-xs text-ink-muted">
          {formatDuration(flight.totalDurationMinutes)} {t.customize.total}
        </p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-navy">{formatMoney(flight.price)}</span>
    </OptionShell>
  );
}

function HotelRoomOption({
  hotel,
  room,
  selected,
  disabled,
  onSelect,
  t,
}: {
  hotel: HotelOffer;
  room: Room;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  t: Dictionary;
}) {
  return (
    <OptionShell selected={selected} disabled={disabled} onSelect={onSelect}>
      <div className="flex min-w-0 items-center gap-3">
        {hotel.image ? (
          <Image
            src={hotel.image}
            alt=""
            width={44}
            height={44}
            className="size-11 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="size-11 shrink-0 rounded-md bg-sand" aria-hidden />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">
            {hotel.name} · {hotel.stars}★
          </p>
          <p className="text-xs text-ink-muted">{t.mealPlanLabels[room.mealPlan]}</p>
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold text-navy">{formatMoney(room.price)}</span>
    </OptionShell>
  );
}

function TransferOption({
  label,
  price,
  selected,
  disabled,
  onSelect,
}: {
  label: string;
  price: { amount: number; currency: "AZN" | "USD" | "EUR" | "GBP" | "TRY" } | null;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <OptionShell selected={selected} disabled={disabled} onSelect={onSelect}>
      <p className="font-medium text-ink">{label}</p>
      <span className="shrink-0 text-sm font-semibold text-navy">{price ? formatMoney(price) : "—"}</span>
    </OptionShell>
  );
}
