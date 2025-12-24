import type { Metadata, Viewport } from "next";
import type { JSX, ReactNode } from "react";

// Room-specific theme color to match the warm gradient background edge
// iOS 26+ uses body background for Safari's safe area coloring
export const viewport: Viewport = {
  themeColor: "#0a0404",
};

export const metadata: Metadata = {
  title: "Holiday.EXE | Room",
};

export interface RoomLayoutProps {
  children: ReactNode;
}

export default function RoomLayout({ children }: RoomLayoutProps): JSX.Element {
  return <>{children}</>;
}
