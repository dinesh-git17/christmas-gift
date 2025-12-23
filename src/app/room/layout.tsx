import type { Metadata, Viewport } from "next";
import type { JSX, ReactNode } from "react";

// Room-specific theme color to match the warm gradient background
// iOS 26+ uses this for Safari's tab tinting / safe area coloring
export const viewport: Viewport = {
  themeColor: "#1a0d08",
};

export const metadata: Metadata = {
  title: "Christmas Gift | Room",
};

export interface RoomLayoutProps {
  children: ReactNode;
}

export default function RoomLayout({ children }: RoomLayoutProps): JSX.Element {
  return <>{children}</>;
}
