"use client";

import { useEffect, useRef } from "react";

import { GAME_ASSETS, WIN_SCORE } from "@/lib/constants";

import type { JSX } from "react";

export interface GameHUDProps {
  score: number;
}

export function GameHUD({ score }: GameHUDProps): JSX.Element {
  const heartRef = useRef<HTMLImageElement>(null);
  const previousScoreRef = useRef(score);

  // Pulse heart on score increase using Web Animations API
  useEffect(() => {
    if (score > previousScoreRef.current && heartRef.current) {
      heartRef.current.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.25)" },
          { transform: "scale(1)" },
        ],
        { duration: 200, easing: "ease-out" }
      );
    }
    previousScoreRef.current = score;
  }, [score]);

  // Calculate progress percentage
  const progressPercent = (score / WIN_SCORE) * 100;

  // Format score with leading zero
  const formattedScore = score.toString().padStart(2, "0");
  const formattedTarget = WIN_SCORE.toString().padStart(2, "0");

  return (
    <div className="absolute top-6 left-1/2 z-40 -translate-x-1/2">
      {/* Glass Pill Container */}
      <div className="shadow-terminal-green/10 bg-midnight/60 flex items-center gap-3 rounded-full border border-white/10 px-5 py-2.5 shadow-lg backdrop-blur-md">
        {/* Heart Token Icon */}
        <div className="relative flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance */}
          <img
            ref={heartRef}
            src={GAME_ASSETS.TOKEN_HEART}
            alt="Heart"
            className="h-7 w-7 object-contain"
            draggable={false}
          />
        </div>

        {/* Score and Signal Meter */}
        <div className="flex flex-col gap-1">
          {/* Label */}
          <span className="font-mono text-[10px] tracking-widest text-gray-400">
            SIGNAL STRENGTH
          </span>

          {/* Score Display */}
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-terminal-green text-lg leading-none font-bold">
              {formattedScore}
            </span>
            <span className="text-sm leading-none text-gray-500">/</span>
            <span className="text-sm leading-none text-gray-400">
              {formattedTarget}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-700">
            <div
              className="bg-terminal-green h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
