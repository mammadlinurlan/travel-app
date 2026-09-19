"use client";

import { ArrowLeft, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { PackageOfferCard } from "@/components/travel/PackageOfferCard";
import { useLocale } from "@/lib/i18n/locale-context";
import type { TravelPackage } from "@/domain/travel/types";

interface PackagesOfferViewProps {
  packages: TravelPackage[];
  travelerCount: number;
  tripSummary: string;
  onSelect: (pkg: TravelPackage) => void;
  onBack: () => void;
}

/** The dedicated "Paket Qur" result: cheapest / best value / premium, three cards only. */
export function PackagesOfferView({ packages, travelerCount, tripSummary, onSelect, onBack }: PackagesOfferViewProps) {
  const { t } = useLocale();
  const offers = packages.filter(
    (pkg) => pkg.score.category === "cheapest" || pkg.score.category === "best_value" || pkg.score.category === "premium"
  );

  return (
    <div className="flex flex-col items-center gap-8 py-4 text-center">
      <button
        type="button"
        onClick={onBack}
        className="group flex w-fit items-center gap-1.5 self-start rounded-lg text-sm font-medium text-ink-muted transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" weight="bold" aria-hidden />
        {t.packagesOffer.backToResults}
      </button>

      <div className="flex flex-col items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
          <Sparkle className="size-3.5" weight="fill" aria-hidden />
          {t.packagesOffer.eyebrow}
        </span>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          {t.packagesOffer.title(offers.length)}
        </h1>
        <p className="text-sm text-ink-muted">{tripSummary}</p>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-ink">{t.packagesOffer.emptyTitle}</h2>
          <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{t.packagesOffer.emptyBody}</p>
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 items-start gap-5 text-left sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((pkg) => (
            <PackageOfferCard key={pkg.id} pkg={pkg} travelerCount={travelerCount} onView={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
