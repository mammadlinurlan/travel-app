"use client";

import { ArrowLeft, MapPin, Sparkle, Wrench } from "@phosphor-icons/react/dist/ssr";
import { IxLogo } from "@/components/layout/IxLogo";
import { useLocale } from "@/lib/i18n/locale-context";

interface ResultsTopBarProps {
  tripSummary: string;
  onBack: () => void;
  onOpenBuilder: () => void;
  onBuild?: () => void;
  showBuildCta?: boolean;
}

/**
 * Full-bleed dark sticky bar for the results/packages/builder screens —
 * replaces the light SiteHeader there so the mockup's navy top bar shows
 * through. Meant to be rendered inside a `-mx-*` bleed wrapper so it spans
 * edge to edge even though its parent is horizontally padded.
 */
export function ResultsTopBar({
  tripSummary,
  onBack,
  onOpenBuilder,
  onBuild,
  showBuildCta,
}: ResultsTopBarProps) {
  const { t } = useLocale();
  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 overflow-hidden bg-navy px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        aria-label={t.toolbar.newSearch}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/40 sm:size-9"
      >
        <ArrowLeft className="size-4" weight="bold" aria-hidden />
      </button>

      <IxLogo height={36} className="hidden shrink-0 sm:flex" />

      <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-full bg-ivory/10 px-2.5 py-1.5 text-[11px] font-medium text-ivory/80 sm:ml-3 sm:px-3 sm:text-xs">
        <MapPin className="size-3.5 shrink-0 text-gold" weight="fill" aria-hidden />
        <span className="truncate">{tripSummary}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenBuilder}
          aria-label={t.toolbar.openBuilderAria}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-ivory/15 bg-ivory/[0.05] text-ivory transition-colors hover:bg-ivory/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/40 sm:size-auto sm:gap-1.5 sm:px-3.5 sm:py-2"
        >
          <Wrench className="size-3.5" weight="regular" aria-hidden />
          <span className="hidden sm:inline">{t.toolbar.openBuilder}</span>
        </button>

        {showBuildCta && onBuild && (
          <button
            type="button"
            onClick={onBuild}
            className="flex shrink-0 items-center gap-1 rounded-full bg-gold px-2.5 py-1.5 text-[11px] font-semibold text-navy-deep transition-colors hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/40 sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-xs"
          >
            <Sparkle className="size-3.5 shrink-0" weight="fill" aria-hidden />
            <span className="truncate">{t.toolbar.buildCta}</span>
          </button>
        )}
      </div>
    </div>
  );
}
