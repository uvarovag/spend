// Hermes на iOS не для всех валют знает узкий символ и в этом случае возвращает
// сам код валюты (например "RUB" вместо "₽") — подстраховываемся для частых валют.
const CURRENCY_SYMBOL_FALLBACKS: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Единое правило отображения дробной части для всех денежных значений в приложении:
// максимум два знака после запятой, без хвостовых нулей (100 вместо 100.00, 100.5 вместо 100.50).
const MAX_MONEY_FRACTION_DIGITS = 2;

export function formatCurrency(amount: number, currency: string, locale: string): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: MAX_MONEY_FRACTION_DIGITS,
  }).format(amount);

  const fallbackSymbol = CURRENCY_SYMBOL_FALLBACKS[currency];
  return fallbackSymbol && formatted.includes(currency) ? formatted.replace(currency, fallbackSymbol) : formatted;
}

// Explicit sign for a value that can be either an inflow or an outflow (net total for a period):
// "+1 200 ₽" / "-300 ₽" / "0 ₽" — no sign for zero. The sign is decided on the value as it will
// be displayed (rounded to MAX_MONEY_FRACTION_DIGITS, -0 normalized to 0), not on the raw float,
// so float dust from summing user amounts (0.1 + 0.2 - 0.3) renders as "0 ₽", not "+0 ₽" / "-0 ₽".
export function formatSignedCurrency(amount: number, currency: string, locale: string): string {
  const scale = 10 ** MAX_MONEY_FRACTION_DIGITS;
  const rounded = Math.round(amount * scale) / scale || 0;
  return `${rounded > 0 ? '+' : ''}${formatCurrency(rounded, currency, locale)}`;
}

// Для чисел без привязки к валюте (курс обмена, суммы без известного счёта) — то же правило дробной части.
export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: MAX_MONEY_FRACTION_DIGITS }).format(value);
}

export function currencySymbol(currency: string, locale: string): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).format(0);
  const symbol = formatted.replace(/[\d\s.,]/g, '');
  return symbol === currency ? (CURRENCY_SYMBOL_FALLBACKS[currency] ?? currency) : symbol || currency;
}
