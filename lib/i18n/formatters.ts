import type { Locale } from "./config";

export function interpretationsCount(n: number, lang: Locale): string {
  if (lang === "ru") {
    const last = n % 10;
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return `${n} интерпретаций`;
    if (last === 1) return `${n} интерпретация`;
    if (last >= 2 && last <= 4) return `${n} интерпретации`;
    return `${n} интерпретаций`;
  }
  return n === 1 ? `${n} interpretation` : `${n} interpretations`;
}

export function objectsCount(n: number, lang: Locale): string {
  if (lang === "ru") {
    const last = n % 10;
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return `${n} объектов`;
    if (last === 1) return `${n} объект`;
    if (last >= 2 && last <= 4) return `${n} объекта`;
    return `${n} объектов`;
  }
  return n === 1 ? `${n} object` : `${n} objects`;
}
