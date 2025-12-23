import { RoomScene } from "@/components/features/room";

import type { JSX } from "react";

export default function RoomPage(): JSX.Element {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,_#2d1810_0%,_#1a0d08_35%,_#0a0404_70%,_#000000_100%)]">
      <RoomScene />
    </main>
  );
}
