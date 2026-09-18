import type { Currency } from "@/domain/travel/types";

export interface CurrencyProvider {
  getRates(base: Currency): Promise<Record<Currency, number>>;
  convert(amount: number, from: Currency, to: Currency): Promise<number>;
}

/**
 * Static fallback rates (approximate, AZN-based) used when no CURRENCY_API_KEY
 * is configured. Swap for a real provider (e.g. exchangerate.host, Fixer) by
 * implementing CurrencyProvider and wiring it in where this is constructed —
 * do not hardcode live rates as if they were authoritative.
 */
const APPROX_AZN_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 0.59,
  EUR: 0.54,
  GBP: 0.46,
  TRY: 20.1,
};

export class StaticCurrencyProvider implements CurrencyProvider {
  async getRates(base: Currency): Promise<Record<Currency, number>> {
    const baseRate = APPROX_AZN_RATES[base];
    const result = {} as Record<Currency, number>;
    for (const currency of Object.keys(APPROX_AZN_RATES) as Currency[]) {
      result[currency] = APPROX_AZN_RATES[currency] / baseRate;
    }
    return result;
  }

  async convert(amount: number, from: Currency, to: Currency): Promise<number> {
    const aznAmount = amount / APPROX_AZN_RATES[from];
    return aznAmount * APPROX_AZN_RATES[to];
  }
}

export function getCurrencyProvider(): CurrencyProvider {
  return new StaticCurrencyProvider();
}
