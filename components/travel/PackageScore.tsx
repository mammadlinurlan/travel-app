"use client";

import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import type { PackageScore as PackageScoreType, ScoreReason } from "@/domain/travel/types";
import { type Dictionary, useLocale } from "@/lib/i18n/locale-context";

interface PackageScoreProps {
  score: PackageScoreType;
}

function describeReason(reason: ScoreReason, t: Dictionary): string {
  switch (reason.key) {
    case "topHotel":
      return t.scoreReasons.topHotel(reason.hotelStars ?? 0, reason.hotelName ?? "");
    case "mealPlan":
      return t.scoreReasons.mealPlan(reason.mealPlan ? t.mealPlanLabels[reason.mealPlan] : "");
    default:
      return t.scoreReasons[reason.key];
  }
}

export function PackageScore({ score }: PackageScoreProps) {
  const { t } = useLocale();
  if (score.reasons.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1">
      {score.reasons.map((reason, index) => (
        <li key={index} className="flex items-start gap-1.5 text-xs text-ink-muted">
          <Sparkle className="mt-0.5 size-3 shrink-0 text-gold-deep" weight="fill" />
          {describeReason(reason, t)}
        </li>
      ))}
    </ul>
  );
}
