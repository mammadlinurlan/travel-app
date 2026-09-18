import { Document, Page, View, Text, Font, StyleSheet } from "@react-pdf/renderer";
import type { TravelPackage } from "@/domain/travel/types";
import type { Dictionary, Locale } from "@/lib/i18n/locale-context";
import { formatDateRange, formatDateShort, formatDuration, formatMoney, formatTime } from "@/lib/utils/format";

Font.register({
  family: "Inter",
  fonts: [{ src: "/fonts/Inter-Regular.ttf" }],
});

const NAVY = "#0f2a43";
const INK = "#1c2733";
const INK_MUTED = "#6b7785";
const BORDER = "#e2e6ea";
const SAND = "#f4f1ea";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    color: INK,
    padding: 36,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brandName: {
    fontSize: 16,
    color: NAVY,
  },
  docTitle: {
    fontSize: 10,
    color: INK_MUTED,
  },
  heroTitle: {
    fontSize: 18,
    color: NAVY,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 10,
    color: INK_MUTED,
    marginBottom: 16,
  },
  section: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    color: NAVY,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: INK_MUTED,
  },
  value: {
    color: INK,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  totalLabel: {
    fontSize: 11,
    color: NAVY,
  },
  totalValue: {
    fontSize: 13,
    color: NAVY,
  },
  legTitle: {
    fontSize: 9,
    color: INK_MUTED,
    marginBottom: 2,
    marginTop: 6,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: INK_MUTED,
    textAlign: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  badge: {
    backgroundColor: SAND,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 8,
    color: INK,
  },
});

interface PackageOfferDocumentProps {
  pkg: TravelPackage;
  travelerCount: number;
  t: Dictionary;
  locale: Locale;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function FlightLegBlock({
  label,
  segments,
  t,
  locale,
}: {
  label: string;
  segments: TravelPackage["flight"]["outbound"];
  t: Dictionary;
  locale: Locale;
}) {
  const first = segments[0];
  const last = segments[segments.length - 1];
  return (
    <View>
      <Text style={styles.legTitle}>{label}</Text>
      <DetailRow
        label={`${first.origin.code} → ${last.destination.code}`}
        value={`${formatDateShort(first.departureTime, locale)} · ${formatTime(first.departureTime, locale)} — ${formatTime(last.arrivalTime, locale)}`}
      />
      <DetailRow label={t.packageDetails.fare} value={`${first.airline} · ${t.cabinClass[first.cabin]}`} />
    </View>
  );
}

export function PackageOfferDocument({ pkg, travelerCount, t, locale }: PackageOfferDocumentProps) {
  const generatedOn = formatDateShort(new Date().toISOString(), locale);
  const destinationCity = pkg.flight.outbound[pkg.flight.outbound.length - 1].destination.city;

  return (
    <Document title={`${t.pdf.documentTitle} — ${pkg.hotel.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>{t.brand.name}</Text>
          <Text style={styles.docTitle}>{t.pdf.generatedOn(generatedOn)}</Text>
        </View>

        <Text style={styles.heroTitle}>
          {destinationCity} · {pkg.hotel.name}
        </Text>
        <Text style={styles.heroSubtitle}>
          {formatDateRange(pkg.flight.outbound[0].departureTime, pkg.flight.inbound[0].departureTime, locale)} ·{" "}
          {t.pdf.traveler(travelerCount)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.pdf.hotelSection}</Text>
          <DetailRow label={pkg.hotel.name} value={`${pkg.hotel.stars}★`} />
          {pkg.hotel.address && <DetailRow label={t.packageDetails.room} value={pkg.hotel.address} />}
          <DetailRow label={t.packageDetails.room} value={pkg.room.name} />
          <DetailRow label={t.packageDetails.mealPlan} value={t.mealPlanLabels[pkg.room.mealPlan]} />
          <DetailRow
            label={t.packageDetails.cancellation}
            value={pkg.room.refundable ? t.packageDetails.freeCancellation : t.packageDetails.nonRefundable}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.pdf.flightSection}</Text>
          <FlightLegBlock label={t.packageDetails.outbound} segments={pkg.flight.outbound} t={t} locale={locale} />
          <FlightLegBlock label={t.packageDetails.return} segments={pkg.flight.inbound} t={t} locale={locale} />
          <View style={{ marginTop: 6 }}>
            <DetailRow
              label={t.packageDetails.checkedBaggage}
              value={
                pkg.flight.baggage.checked > 0
                  ? `${pkg.flight.baggage.checked} × ${pkg.flight.baggage.checkedWeightKg ?? 23}kg`
                  : t.packageDetails.notIncluded
              }
            />
            <DetailRow label={t.packageDetails.totalFlightTime} value={formatDuration(pkg.flight.totalDurationMinutes)} />
          </View>
        </View>

        {pkg.transfer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.pdf.transferSection}</Text>
            <DetailRow
              label={pkg.transfer.type === "private" ? t.packageDetails.private : t.packageDetails.shared}
              value={pkg.transfer.vehicle}
            />
            <DetailRow label={t.packageDetails.transferTime} value={formatDuration(pkg.transfer.durationMinutes)} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.pdf.priceSection}</Text>
          <DetailRow label={t.packageDetails.flights} value={formatMoney({ amount: pkg.price.flights, currency: pkg.price.currency })} />
          <DetailRow label={t.packageDetails.hotel} value={formatMoney({ amount: pkg.price.hotel, currency: pkg.price.currency })} />
          <DetailRow label={t.packageDetails.transferLabel} value={formatMoney({ amount: pkg.price.transfer, currency: pkg.price.currency })} />
          <DetailRow label={t.packageDetails.serviceAndBooking} value={formatMoney({ amount: pkg.price.markup, currency: pkg.price.currency })} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.pdf.total}</Text>
            <Text style={styles.totalValue}>{formatMoney({ amount: pkg.price.total, currency: pkg.price.currency })}</Text>
          </View>
        </View>

        <Text style={styles.footer}>{t.pdf.contactFooter}</Text>
      </Page>
    </Document>
  );
}
