const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: "₽",
  USD: "$",
  EUR: "€",
  UAH: "₴",
  KZT: "₸",
  GBP: "£",
  JPY: "¥",
};

export function formatPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${formatted} ${symbol}`;
}
