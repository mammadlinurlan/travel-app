import type { Currency, Money } from "@/domain/travel/types";
import type { Locale } from "@/lib/i18n/locale-context";

const INTL_LOCALE: Record<Locale, string> = { az: "az-AZ", en: "en-US" };

// Browser ICU data doesn't reliably spell out az-AZ month names via Intl
// (falls back to garbled digits), so month labels are mapped by hand.
const MONTH_NAMES: Record<Locale, string[]> = {
  az: [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "İyun",
    "İyul",
    "Avqust",
    "Sentyabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

const CURRENCY_SYMBOL: Record<Currency, string> = {
  AZN: "₼",
  USD: "$",
  EUR: "€",
  GBP: "£",
  TRY: "₺",
};

export function formatMoney(money: Money): string {
  return `${CURRENCY_SYMBOL[money.currency]}${Math.round(money.amount).toLocaleString()}`;
}

export function formatAmount(amount: number, currency: Currency): string {
  return formatMoney({ amount, currency });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

export function formatDateShort(iso: string, locale: Locale = "az"): string {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTH_NAMES[locale][date.getMonth()]}`;
}

export function formatTime(iso: string, locale: Locale = "az"): string {
  return new Date(iso).toLocaleTimeString(INTL_LOCALE[locale], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateRange(startIso: string, endIso: string, locale: Locale = "az"): string {
  return `${formatDateShort(startIso, locale)} — ${formatDateShort(endIso, locale)}`;
}
