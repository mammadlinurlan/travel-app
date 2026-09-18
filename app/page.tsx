"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TripSearchForm } from "@/features/search/TripSearchForm";
import { useTripSearch } from "@/features/search/use-trip-search";
import { useParseTrip } from "@/features/search/use-parse-trip";
import { defaultTripSearchValues, toTripSearchRequest, type TripSearchFormValues } from "@/features/search/schema";
import { SearchProgress, SEARCH_PROGRESS_MIN_DURATION_MS } from "@/components/travel/SearchProgress";
import { PackageResults } from "@/features/packages/PackageResults";
import { PackageDetails } from "@/features/packages/PackageDetails";
import { useLocale } from "@/lib/i18n/locale-context";
import type { CabinClass, TravelPackage, TripSearchRequest, TripSearchResult } from "@/domain/travel/types";

type View = "landing" | "searching";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [travelerCount, setTravelerCount] = useState(2);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [result, setResult] = useState<TripSearchResult | null>(null);
  const [lastRequest, setLastRequest] = useState<TripSearchRequest | null>(null);
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [nlDraftText, setNlDraftText] = useState("");
  const [nlPrefill, setNlPrefill] = useState<{
    values: Partial<TripSearchFormValues>;
    destinationLabel?: string;
  } | null>(null);
  const search = useTripSearch();
  const parseTrip = useParseTrip();
  const { t } = useLocale();
  const showResults = view === "searching" && result !== null && minDurationElapsed;

  function handleSubmit(request: TripSearchRequest) {
    setTravelerCount(request.travelers.adults + request.travelers.children);
    setResult(null);
    setLastRequest(request);
    setView("searching");
    setMinDurationElapsed(false);
    search.mutate(request, {
      onSuccess: (data) => setResult(data),
    });
  }

  function handleNaturalLanguageSubmit(text: string) {
    setNlError(null);
    setNlPrefill(null);
    setNlDraftText(text);
    // Jump to the loading screen immediately — waiting on a filled-in form
    // and a second manual submit is a needless extra step for the user.
    setResult(null);
    setView("searching");
    setMinDurationElapsed(false);
    parseTrip.mutate(text, {
      onSuccess: (intent) => {
        const missingDestination = !intent.destination;
        const missingDates = !intent.departureDate || !intent.returnDate;

        if (missingDestination || missingDates) {
          setNlError(
            missingDestination && missingDates
              ? t.search.nlMissingBoth
              : missingDestination
                ? t.search.nlMissingDestination
                : t.search.nlMissingDates
          );
          setNlPrefill({
            values: {
              ...(intent.destination && { destination: intent.destination }),
              ...(intent.departureDate && { departureDate: intent.departureDate }),
              ...(intent.returnDate && { returnDate: intent.returnDate }),
              ...(intent.adults && { adults: intent.adults }),
              ...(intent.children !== null && { children: intent.children }),
            },
            destinationLabel: intent.destinationLabel ?? undefined,
          });
          setView("landing");
          return;
        }

        const values: TripSearchFormValues = {
          ...defaultTripSearchValues,
          destination: intent.destination!,
          departureDate: intent.departureDate!,
          returnDate: intent.returnDate!,
          adults: intent.adults ?? defaultTripSearchValues.adults,
          children: intent.children ?? defaultTripSearchValues.children,
        };
        handleSubmit(toTripSearchRequest(values));
      },
      onError: (error) => {
        setNlError(error.message);
        setView("landing");
      },
    });
  }

  function handleNewSearch() {
    setView("landing");
    setResult(null);
    setSelectedPackage(null);
  }

  function handleCabinClassChange(cabinClass: CabinClass) {
    if (!lastRequest) return;
    const request: TripSearchRequest = { ...lastRequest, preferences: { ...lastRequest.preferences, cabinClass } };
    setLastRequest(request);
    search.mutate(request, {
      onSuccess: (data) => setResult(data),
    });
  }

  useEffect(() => {
    if (view !== "searching") return;
    const timer = setTimeout(() => setMinDurationElapsed(true), SEARCH_PROGRESS_MIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [view]);

  function handlePackageUpdated(updated: TravelPackage) {
    setSelectedPackage(updated);
    setResult((prev) =>
      prev
        ? { ...prev, packages: prev.packages.map((p) => (p.id === updated.id ? updated : p)) }
        : prev
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-background">
      {showResults && <SiteHeader variant="solid" onHome={handleNewSearch} />}

      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div key="landing" exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="h-dvh">
            <Hero>
              <TripSearchForm
                onSubmit={handleSubmit}
                isSubmitting={search.isPending}
                onNaturalLanguageSubmit={handleNaturalLanguageSubmit}
                isParsingNaturalLanguage={parseTrip.isPending}
                naturalLanguageError={nlError}
                initialNaturalLanguageText={nlDraftText}
                initialValues={nlPrefill?.values}
                initialDestinationLabel={nlPrefill?.destinationLabel}
              />
            </Hero>
          </motion.div>
        )}

        {view === "searching" && !showResults && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-dvh">
            <SearchProgress onHome={handleNewSearch} />
          </motion.div>
        )}

        {showResults && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
          >
            <PackageResults
              packages={result.packages}
              travelerCount={travelerCount}
              warnings={result.warnings}
              onSelect={setSelectedPackage}
              onNewSearch={handleNewSearch}
              cabinClass={lastRequest?.preferences.cabinClass ?? "economy"}
              onCabinClassChange={handleCabinClassChange}
              isRefetching={search.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PackageDetails
        pkg={selectedPackage}
        allPackages={result?.packages ?? []}
        travelerCount={travelerCount}
        onOpenChange={(open) => !open && setSelectedPackage(null)}
        onUpdated={handlePackageUpdated}
      />
    </main>
  );
}

function Hero({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-navy-deep">
      <Image
        src="/bg-image.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "50% 20%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/75 via-navy-deep/45 to-navy-deep/90" />

      <SiteHeader variant="transparent" />

      <div className="relative mx-auto flex h-full w-full max-w-4xl flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 pb-6 pt-20 text-center sm:gap-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex shrink-0 flex-col items-center gap-2 sm:gap-3"
        >
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[40px]">
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}
          </h1>
          <p className="hidden max-w-lg text-balance text-sm text-white/80 sm:block">{t.hero.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl shrink-0"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
