import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates an SMS deep link that works on both iOS and Android
 * iOS uses '&' separator, Android uses '?'
 */
export function getSMSLink(phone: string, body: string): string {
  // Check if running in browser
  if (typeof navigator === "undefined") {
    return `sms:${phone}`;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? "&" : "?";
  return `sms:${phone}${separator}body=${encodeURIComponent(body)}`;
}
