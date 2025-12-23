"use client";

import { Game } from "@/components/features/game";

import type { JSX } from "react";

export default function GamePage(): JSX.Element {
  return (
    <main className="h-svh w-full overflow-hidden">
      <Game />
    </main>
  );
}
