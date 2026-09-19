"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TripSearchForm } from "@/features/search/TripSearchForm";
import { useTripSearch } from "@/features/search/use-trip-search";
import { useParseTrip, useParseTripVoice } from "@/features/search/use-parse-trip";
import { defaultTripSearchValues, toTripSearchRequest, type TripSearchFormValues } from "@/features/search/schema";
import type { ParsedTripIntent } from "@/domain/travel/validation";
import { SearchProgress, SEARCH_PROGRESS_MIN_DURATION_MS } from "@/components/travel/SearchProgress";
import { PackageResults } from "@/features/packages/PackageResults";
import { PackageDetails } from "@/features/packages/PackageDetails";
import { BuilderView } from "@/features/builder/BuilderView";
import type { InventoryItemData } from "@/features/builder/types";
import { useLocale } from "@/lib/i18n/locale-context";
import type {
  CabinClass,
  FlightOffer,
  HotelOffer,
  Room,
  TravelPackage,
  TripSearchRequest,
  TripSearchResult,
} from "@/domain/travel/types";

type View = "landing" | "searching" | "builder";

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
  const [builderSeed, setBuilderSeed] = useState<InventoryItemData | null>(null);
  const search = useTripSearch();
  const parseTrip = useParseTrip();
  const parseTripVoice = useParseTripVoice();
  const { t } = useLocale();
  const showResults = view === "searching" && result !== null && minDurationElapsed;
  const showBuilder = view === "builder" && result !== null;

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

  function applyParsedIntent(intent: ParsedTripIntent) {
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
      onSuccess: applyParsedIntent,
      onError: (error) => {
        setNlError(error.message);
        setView("landing");
      },
    });
  }

  function handleVoiceSubmit(audioBase64: string, mimeType: string) {
    setNlError(null);
    setNlPrefill(null);
    parseTripVoice.mutate(
      { audio: audioBase64, mimeType },
      {
        onSuccess: (intent) => {
          setNlDraftText(intent.summary || nlDraftText);
          setResult(null);
          setView("searching");
          setMinDurationElapsed(false);
          applyParsedIntent(intent);
        },
        onError: (error) => {
          setNlError(error.message);
          setView("landing");
        },
      }
    );
  }

  function handleOpenBuilder() {
    setView("builder");
  }

  function handleSelectFlight(flight: FlightOffer) {
    setBuilderSeed({ type: "flight", flightId: flight.id });
    setView("builder");
  }

  function handleSelectHotel(hotel: HotelOffer, room: Room) {
    setBuilderSeed({ type: "hotel", hotelId: hotel.id, roomId: room.id });
    setView("builder");
  }

  function handleBuilderBack() {
    setBuilderSeed(null);
    setView("searching");
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
                onVoiceSubmit={handleVoiceSubmit}
                isTranscribingVoice={parseTripVoice.isPending}
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
              onSelectFlight={handleSelectFlight}
              onSelectHotel={handleSelectHotel}
              onNewSearch={handleNewSearch}
              cabinClass={lastRequest?.preferences.cabinClass ?? "economy"}
              onCabinClassChange={handleCabinClassChange}
              isRefetching={search.isPending}
              onOpenBuilder={handleOpenBuilder}
              request={result.request}
            />
          </motion.div>
        )}

        {showBuilder && result && (
          <motion.div
            key="builder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
          >
            <BuilderView
              searchResult={result}
              travelerCount={travelerCount}
              onBack={handleBuilderBack}
              initialSelection={builderSeed}
              onOfferSent={handleNewSearch}
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
        src="/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-20"
        style={{ objectPosition: "50% 30%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/50 to-navy-deep" />

      {/* Ambient decorative orbs — CSS-driven (not Framer Motion), ported from the mockup's .anim-orb keyframes. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="anim-orb absolute -top-20 -right-20 size-72 rounded-full bg-gold/10 blur-3xl" />
        <div
          className="anim-orb absolute bottom-20 -left-20 size-56 rounded-full bg-navy/25 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="anim-orb absolute bottom-1/3 right-1/4 size-40 rounded-full bg-gold/8 blur-2xl"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      <SiteHeader variant="transparent" />

      {/*
        Desktop (md+): two-column hero — headline block on the left, search
        card on the right, mirroring the mockup's `hidden md:flex` layout.
        Mobile: the same flex container stacks and centers via `flex-col`,
        so the search card renders once (not duplicated per breakpoint) —
        a deliberate deviation from the mockup, which mounts two separate
        copies of the search card; duplicating our real, stateful
        TripSearchForm (voice recording, async parsing) would double-mount
        hooks and side effects, which is unsafe here.
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-4 pb-6 pt-20 sm:gap-10 sm:px-6 md:flex-row md:items-center md:gap-12 md:px-10 md:py-12 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-w-0 shrink-0 flex-col items-center gap-2 text-center sm:gap-3 md:flex-1 md:items-start md:text-left"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">{t.hero.eyebrow}</p>
          <h1
            className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[40px] md:leading-[1.08]"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3.5rem)" }}
          >
            {t.hero.titleLine1}
            <br />
            <span className="text-gold">{t.hero.titleLine2}</span>
          </h1>
          <p className="hidden max-w-lg text-balance text-sm text-white/80 sm:block md:max-w-sm">
            {t.hero.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl shrink-0 md:w-115 md:max-w-none lg:w-125"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
