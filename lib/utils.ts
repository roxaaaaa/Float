import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyEurFromPence(pence: number | null | undefined): string {
  if (pence === null || pence === undefined || Number.isNaN(pence)) return "EUR 0.00";
  const euros = pence / 100;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(euros);
}

export function formatDateLabel(date: string | Date) {
  return new Intl.DateTimeFormat("en-IE", {
    month: "short",
    day: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function tryJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
