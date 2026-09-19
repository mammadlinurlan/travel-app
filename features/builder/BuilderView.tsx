"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { ArrowLeft, Airplane, Basket, Bed, Car, ListBullets, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HotelDetailsSheet } from "@/components/travel/HotelDetailsSheet";
import { OfferRequestForm } from "@/features/packages/OfferRequestForm";
import { recalculatePackage } from "@/lib/api/client";
import { formatAmount, formatDateRange, formatDateShort, formatTime } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";
import type { CustomizationRequest, HotelOffer, Room, TravelPackage, TripSearchResult } from "@/domain/travel/types";
import { deriveBuilderInventory, pickSeedPackage } from "./builder-inventory";
import { InventoryPanel } from "./InventoryPanel";
import { BuilderSlot } from "./BuilderSlot";
import type { InventoryItemData } from "./types";

interface BuilderViewProps {
  searchResult: TripSearchResult;
  travelerCount: number;
  onBack: () => void;
  /** Pre-fills one slot (e.g. a flight/hotel picked from the results tabs) on open. */
  initialSelection?: InventoryItemData | null;
  /** Called once the offer request succeeds and its confirmation is dismissed. */
  onOfferSent: () => void;
}

type MobileTab = "list" | "canvas";

export function BuilderView({ searchResult, travelerCount, onBack, initialSelection, onOfferSent }: BuilderViewProps) {
  const { t, locale } = useLocale();
  const inventory = useMemo(() => deriveBuilderInventory(searchResult.packages), [searchResult.packages]);
  const seedPackage = useMemo(() => pickSeedPackage(searchResult.packages), [searchResult.packages]);

  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("list");
  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [pendingHotel, setPendingHotel] = useState<HotelOffer | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  // Price is only ever what the server returns from the same, already-tested
  // recalculate endpoint that PackageDetails' customizer uses — never
  // computed or summed client-side.
  const recalc = useMutation<TravelPackage, Error, CustomizationRequest>({
    mutationFn: (customization) => {
      if (!seedPackage) throw new Error("No package available to build from.");
      return recalculatePackage(seedPackage.id, customization);
    },
  });

  const canPrice = Boolean(selectedFlightId && selectedHotelId && selectedRoomId);

  function triggerRecalc(next: {
    flightId?: string | null;
    hotelId?: string | null;
    roomId?: string | null;
    transferId?: string | null;
  }) {
    const flightId = next.flightId !== undefined ? next.flightId : selectedFlightId;
    const hotelId = next.hotelId !== undefined ? next.hotelId : selectedHotelId;
    const roomId = next.roomId !== undefined ? next.roomId : selectedRoomId;
    const transferId = next.transferId !== undefined ? next.transferId : selectedTransferId;
    if (!flightId || !hotelId || !roomId) return;
    recalc.mutate({
      flightId,
      hotelId,
      roomId,
      transferId: transferId ?? null,
    });
  }

  function applyHotelSelection(hotel: HotelOffer, room: Room) {
    setSelectedHotelId(hotel.id);
    setSelectedRoomId(room.id);
    triggerRecalc({ hotelId: hotel.id, roomId: room.id });
    setMobileTab("canvas");
    setPendingHotel(null);
  }

  function applySelection(data: InventoryItemData) {
    if (data.type === "flight") {
      setSelectedFlightId(data.flightId);
      triggerRecalc({ flightId: data.flightId });
      setMobileTab("canvas");
    } else if (data.type === "hotel") {
      setSelectedHotelId(data.hotelId);
      setSelectedRoomId(data.roomId);
      triggerRecalc({ hotelId: data.hotelId, roomId: data.roomId });
      setMobileTab("canvas");
    } else if (data.type === "hotel-picker") {
      const hotel = inventory.hotelRooms.find((h) => h.hotel.id === data.hotelId)?.hotel;
      if (hotel) setPendingHotel(hotel);
    } else {
      setSelectedTransferId(data.transferId);
      triggerRecalc({ transferId: data.transferId });
      setMobileTab("canvas");
    }
  }

  useEffect(() => {
    // Seeds the canvas (state + a real recalculate call) from a flight/hotel
    // the user picked in the results tabs before opening the builder — a
    // genuine one-time external side effect, not state derivable at render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialSelection) applySelection(initialSelection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelection]);

  function clearTransfer() {
    setSelectedTransferId(null);
    triggerRecalc({ transferId: null });
  }

  function handleDragEnd(event: DragEndEvent) {
    const overType = event.over?.data.current?.type as InventoryItemData["type"] | undefined;
    const activeData = event.active.data.current as InventoryItemData | undefined;
    if (!overType || !activeData) return;
    const matches = activeData.type === overType || (activeData.type === "hotel-picker" && overType === "hotel");
    if (!matches) return;
    applySelection(activeData);
  }

  const selectedFlight = inventory.flights.find((f) => f.flight.id === selectedFlightId)?.flight;
  const selectedHotelRoom = inventory.hotelRooms.find(
    (h) => h.hotel.id === selectedHotelId && h.room.id === selectedRoomId
  );
  const selectedTransfer = inventory.transfers.find((tr) => tr.transfer.id === selectedTransferId)?.transfer;

  const draft = recalc.data;
  const total = draft && recalc.isSuccess ? draft.price.total : null;
  const filledCount = [selectedFlight, selectedHotelRoom, selectedTransfer].filter(Boolean).length;
  const tripSummary = `${searchResult.request.destination} · ${formatDateRange(
    searchResult.request.departureDate,
    searchResult.request.returnDate,
    locale
  )} · ${t.search.traveler(travelerCount)}`;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 pb-24">
        <button
          type="button"
          onClick={onBack}
          className="group flex w-fit items-center gap-1.5 rounded-lg text-sm font-medium text-ink-muted transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" weight="bold" aria-hidden />
          {t.builder.back}
        </button>

        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[32px]">
            {t.builder.title}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{t.builder.subtitle}</p>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex gap-1 rounded-xl bg-sand p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
              mobileTab === "list" ? "bg-navy text-ivory shadow-sm" : "text-ink-muted"
            )}
          >
            <ListBullets className="size-3.5" weight="bold" aria-hidden />
            {t.builder.tabList}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("canvas")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all",
              mobileTab === "canvas" ? "bg-navy text-ivory shadow-sm" : "text-ink-muted"
            )}
          >
            <Basket className="size-3.5" weight="bold" aria-hidden />
            {t.builder.tabPackage}
            {filledCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-extrabold text-navy-deep">
                {filledCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <aside className={cn("w-full shrink-0 lg:block lg:w-80", mobileTab === "list" ? "block" : "hidden lg:block")}>
            <div className="flex max-h-[65vh] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-panel lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)]">
              <InventoryPanel
                inventory={inventory}
                onSelect={applySelection}
                onPickHotel={setPendingHotel}
                selectedFlightId={selectedFlightId}
                selectedHotelId={selectedHotelId}
                selectedTransferId={selectedTransferId}
              />
            </div>
          </aside>

          <div className={cn("min-w-0 flex-1", mobileTab === "canvas" ? "block" : "hidden lg:block")}>
            <div className="flex flex-col rounded-2xl border border-border bg-white p-4 shadow-panel sm:p-5">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-ink">{t.builder.canvasTitle}</h2>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{tripSummary}</p>
                </div>
                {total !== null && (
                  <div className="shrink-0 rounded-xl bg-sand px-3 py-2 text-right">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">{t.builder.total}</p>
                    <p className="text-lg font-extrabold leading-tight text-ink">
                      {formatAmount(total, draft!.price.currency)}
                    </p>
                  </div>
                )}
              </div>

              {!canPrice && <p className="mb-3 text-xs text-ink-muted">{t.builder.summaryPending}</p>}
              {canPrice && recalc.isPending && <p className="mb-3 text-xs text-ink-muted">{t.builder.summaryCalculating}</p>}
              {canPrice && recalc.isError && <p className="mb-3 text-xs text-error">{t.builder.summaryError}</p>}

              <div className="flex flex-col gap-3">
                <BuilderSlot
                  slotType="flight"
                  label={t.builder.slotFlight}
                  icon={<Airplane className="size-4" weight={selectedFlight ? "fill" : "regular"} aria-hidden />}
                  filled={Boolean(selectedFlight)}
                  title={
                    selectedFlight &&
                    `${selectedFlight.outbound[0].airline} · ${selectedFlight.outbound[0].origin.code}→${selectedFlight.outbound[selectedFlight.outbound.length - 1].destination.code}`
                  }
                  detail={
                    selectedFlight &&
                    `${formatDateShort(selectedFlight.outbound[0].departureTime, locale)}, ${formatTime(
                      selectedFlight.outbound[0].departureTime,
                      locale
                    )} — ${formatTime(
                      selectedFlight.outbound[selectedFlight.outbound.length - 1].arrivalTime,
                      locale
                    )}`
                  }
                  price={selectedFlight && formatAmount(selectedFlight.price.amount, selectedFlight.price.currency)}
                />

                <BuilderSlot
                  slotType="hotel"
                  label={t.builder.slotHotel}
                  icon={<Bed className="size-4" weight={selectedHotelRoom ? "fill" : "regular"} aria-hidden />}
                  filled={Boolean(selectedHotelRoom)}
                  title={selectedHotelRoom?.hotel.name}
                  detail={selectedHotelRoom?.room.name}
                  price={
                    selectedHotelRoom &&
                    formatAmount(selectedHotelRoom.room.price.amount, selectedHotelRoom.room.price.currency)
                  }
                />

                <BuilderSlot
                  slotType="transfer"
                  label={t.builder.slotTransfer}
                  icon={<Car className="size-4" weight={selectedTransfer ? "fill" : "regular"} aria-hidden />}
                  filled={Boolean(selectedTransfer)}
                  title={selectedTransfer?.vehicle}
                  price={selectedTransfer && formatAmount(selectedTransfer.price.amount, selectedTransfer.price.currency)}
                  onClear={selectedTransfer ? clearTransfer : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar — fill progress + total on the left, send CTA (disabled until priceable) on the right. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-white px-4 py-3 sm:px-6 lg:px-8">
        {total !== null ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium text-ink-muted">{t.builder.selectedProgress(filledCount, 3)}</p>
            <p className="text-lg font-extrabold leading-none text-ink">{formatAmount(total, draft!.price.currency)}</p>
          </div>
        ) : (
          <p className="flex-1 text-xs text-ink-muted">{t.builder.completePrompt}</p>
        )}
        <button
          type="button"
          disabled={!canPrice}
          onClick={() => setOfferFormOpen(true)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition-colors",
            canPrice ? "bg-gold text-ivory hover:bg-gold-deep" : "cursor-not-allowed bg-sand text-ink-muted/50"
          )}
        >
          <PaperPlaneTilt className="size-3.5" weight="fill" aria-hidden />
          {t.builder.sendOfferCta}
        </button>
      </div>

      <HotelDetailsSheet
        hotel={pendingHotel}
        onOpenChange={(open) => !open && setPendingHotel(null)}
        onSelect={applyHotelSelection}
      />

      {/* Confirmation flow — the offer form's own success state (checkmark, title, body, single CTA) doubles as the mockup's success modal. */}
      <Dialog open={offerFormOpen} onOpenChange={setOfferFormOpen}>
        <DialogContent className="rounded-2xl p-8 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">{t.builder.sendOfferCta}</DialogTitle>
          </DialogHeader>
          {draft && (
            <OfferRequestForm
              packageId={draft.id}
              onDone={() => {
                setOfferFormOpen(false);
                onOfferSent();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
