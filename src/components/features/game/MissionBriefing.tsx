"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { JSX } from "react";

export interface MissionBriefingProps {
  onInitiate: () => void;
}

const MISSION_TITLE = "MISSION: RESTORE CONNECTION";

export function MissionBriefing({
  onInitiate,
}: MissionBriefingProps): JSX.Element {
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [isTitleComplete, setIsTitleComplete] = useState(false);

  // Typewriter effect for mission title
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < MISSION_TITLE.length) {
        currentIndex++;
        setDisplayedTitle(MISSION_TITLE.slice(0, currentIndex));
      } else {
        clearInterval(interval);
        setIsTitleComplete(true);
      }
    }, 60);

    return (): void => {
      clearInterval(interval);
    };
  }, []);

  const handleInitiate = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation();
      onInitiate();
    },
    [onInitiate]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-midnight/90 absolute inset-0 z-50 flex flex-col items-center justify-center p-6"
    >
      {/* HUD Frame */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="border-terminal-green/40 bg-midnight/60 flex w-full max-w-md flex-col gap-6 rounded-lg border-2 p-6 backdrop-blur-sm"
      >
        {/* Mission Header */}
        <div className="border-terminal-green/30 border-b pb-4">
          <div className="text-terminal-green/60 mb-1 font-mono text-xs tracking-widest uppercase">
            CLASSIFIED BRIEFING
          </div>
          <h1 className="text-terminal-green font-mono text-xl font-bold sm:text-2xl">
            {displayedTitle}
            {!isTitleComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-terminal-green ml-1 inline-block h-5 w-2"
              />
            )}
          </h1>
        </div>

        {/* Target Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex items-center gap-4"
        >
          <div className="border-romance-gold/60 relative h-16 w-16 overflow-hidden rounded-lg border-2">
            <Image
              src="/assets/characters/dinn_heart.png"
              alt="Subject: Dinn"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="text-terminal-green/60 font-mono text-xs uppercase">
              Target
            </div>
            <div className="text-romance-gold font-mono text-lg font-bold">
              SUBJECT: DINN
            </div>
            <div className="text-terminal-green/80 font-mono text-xs">
              Status: SIGNAL WEAK
            </div>
          </div>
        </motion.div>

        {/* Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="space-y-3"
        >
          {/* Objective */}
          <div className="flex items-center gap-3">
            <div className="text-romance-gold flex h-8 w-8 shrink-0 items-center justify-center text-xl">
              ❤️
            </div>
            <div>
              <div className="text-terminal-green/60 font-mono text-xs uppercase">
                Objective
              </div>
              <div className="text-terminal-green font-mono text-sm">
                Collect hearts to boost signal
              </div>
            </div>
          </div>

          {/* Hazard */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <div className="font-mono text-xs text-red-400/80 uppercase">
                Hazard
              </div>
              <div className="font-mono text-sm text-red-400">
                Avoid glitches to prevent disconnect
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="bg-terminal-green/10 rounded-md p-3 text-center"
        >
          <div className="text-terminal-green/80 font-mono text-xs">
            TAP / SPACE / ↑ to jump
          </div>
        </motion.div>

        {/* Initiate Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleInitiate}
          onTouchEnd={handleInitiate}
          type="button"
          className="bg-terminal-green text-midnight relative mt-2 min-h-[56px] w-full rounded-lg py-4 font-mono text-lg font-bold transition-colors hover:bg-white"
        >
          <motion.span
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            INITIATE SEQUENCE
          </motion.span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
