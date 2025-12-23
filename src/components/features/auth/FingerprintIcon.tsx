import type { JSX } from "react";

export interface FingerprintIconProps {
  className?: string;
}

export function FingerprintIcon({
  className,
}: FingerprintIconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6" />
      <path d="M5 12v6a7 7 0 0 0 14 0v-6" />
      <path d="M8 12a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0v-6" />
      <path d="M11 12a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0v-6" />
    </svg>
  );
}
