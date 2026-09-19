"use client";

import type { PackageCategory } from "@/domain/travel/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";

const STYLE: Record<PackageCategory, { className: string; dot: string } | null> = {
  cheapest: { className: "bg-white/95 text-navy", dot: "bg-success" },
  best_value: { className: "bg-success/10 text-success", dot: "bg-success" },
  premium: { className: "bg-navy/90 text-white", dot: "bg-gold" },
  alternative: null,
};

export function RecommendationBadge({ category }: { category: PackageCategory }) {
  const { t } = useLocale();
  const style = STYLE[category];
  if (!style || category === "alternative") return null;
  const label = t.recommendationBadge[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] shadow-sm backdrop-blur-sm",
        style.className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
      {label}
    </span>
  );
}
