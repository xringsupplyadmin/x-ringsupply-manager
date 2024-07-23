import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let dateFormatter: (date: Date) => string;

try {
  const intl = new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "long",
    timeZone: "America/New_York",
  });
  dateFormatter = intl.format.bind(intl);
} catch {
  console.warn("Client does not support Intl.DateTimeFormat");
  dateFormatter = (date: Date) =>
    date.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
}

export function formatDate(date: Date): string;
export function formatDate(date?: Date): string | undefined;
export function formatDate(date?: Date) {
  return date ? dateFormatter(date) : undefined;
}
