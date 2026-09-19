"use client";

import { useDroppable } from "@dnd-kit/core";
import { X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";
import type { SlotType } from "./types";

interface BuilderSlotProps {
  slotType: SlotType;
  label: string;
  icon: React.ReactNode;
  filled: boolean;
  badge?: React.ReactNode;
  title?: React.ReactNode;
  detail?: React.ReactNode;
  price?: React.ReactNode;
  onClear?: () => void;
}

export function BuilderSlot({ slotType, label, icon, filled, badge, title, detail, price, onClear }: BuilderSlotProps) {
  const { t } = useLocale();
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotType}`, data: { type: slotType } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border-2 border-dashed transition-colors",
        isOver ? "drag-over" : filled ? "border-transparent bg-sand" : "border-border/70 bg-white"
      )}
    >
      {filled ? (
        <div className="flex items-center gap-3 p-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</span>
              {badge}
            </div>
            <p className="truncate text-sm font-semibold text-ink">{title}</p>
            {detail && <p className="truncate text-xs text-ink-muted">{detail}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="text-base font-bold text-ink">{price}</span>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                aria-label={t.builder.remove}
                className="text-ink-muted transition-colors hover:text-error"
              >
                <X className="size-4" weight="bold" aria-hidden />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 p-7 text-center">
          <span className="text-navy/40">{icon}</span>
          <p className="text-[11px] font-medium text-ink-muted">
            {label} — {t.builder.dropPlaceholder}
            <span className="mt-0.5 block text-[10px] text-ink-muted/70 sm:hidden">{t.builder.tapToAdd}</span>
          </p>
        </div>
      )}
    </div>
  );
}
