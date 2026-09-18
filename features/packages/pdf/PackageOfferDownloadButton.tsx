"use client";

import dynamic from "next/dynamic";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import type { TravelPackage } from "@/domain/travel/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { PackageOfferDocument } from "./PackageOfferDocument";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex h-10 items-center rounded-lg border border-border bg-white px-3 text-sm font-medium text-ink-muted">
        …
      </span>
    ),
  }
);

interface PackageOfferDownloadButtonProps {
  pkg: TravelPackage;
  travelerCount: number;
}

export function PackageOfferDownloadButton({ pkg, travelerCount }: PackageOfferDownloadButtonProps) {
  const { t, locale } = useLocale();
  const destinationSlug = pkg.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <PDFDownloadLink
      document={<PackageOfferDocument pkg={pkg} travelerCount={travelerCount} t={t} locale={locale} />}
      fileName={`ixtour-${destinationSlug}-${pkg.id}.pdf`}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-ink transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40"
    >
      {({ loading }) => (
        <>
          <DownloadSimple className="size-4" weight="regular" aria-hidden />
          {loading ? t.pdf.generating : t.pdf.downloadCta}
        </>
      )}
    </PDFDownloadLink>
  );
}
