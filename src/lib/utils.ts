import { type ClassValue, clsx } from "clsx";
import makeFetchCookie from "fetch-cookie";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CF_API_HEADER = {
  "Connection-Key": env.CF_API_KEY,
};

export const fetchSession = makeFetchCookie(fetch);

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
