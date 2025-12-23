"use client";

import { motion } from "framer-motion";
import { LockOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAudio } from "@/hooks";
import { AUDIO_PATHS, WIN_SCORE } from "@/lib/constants";

import type { JSX } from "react";

export interface MissionSuccessProps {
  score: number;
}

const HEADER_TEXT = "CONNECTION ESTABLISHED";

export function MissionSuccess({ score }: MissionSuccessProps): JSX.Element {
  const router = useRouter();
  const [displayedHeader, setDisplayedHeader] = useState("");
  const [isHeaderComplete, setIsHeaderComplete] = useState(false);

  const { play: playSuccessSound } = useAudio(AUDIO_PATHS.SUCCESS_UNLOCK, {
    volume: 0.6,
  });

  // Play success sound on mount
  useEffect(() => {
    playSuccessSound();
  }, [playSuccessSound]);

  // Typewriter effect for header
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < HEADER_TEXT.length) {
        currentIndex++;
        setDisplayedHeader(HEADER_TEXT.slice(0, currentIndex));
      } else {
        clearInterval(interval);
        setIsHeaderComplete(true);
      }
    }, 60);

    return (): void => {
      clearInterval(interval);
    };
  }, []);

  const handleEnterRoom = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation();
      router.push("/room");
    },
    [router]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-midnight/90 absolute inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md"
    >
      {/* HUD Frame - Success Green Theme */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="border-terminal-green/40 bg-midnight/60 flex w-full max-w-md flex-col gap-6 rounded-lg border-2 p-6 backdrop-blur-sm"
      >
        {/* Glowing Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="flex justify-center"
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0, 255, 65, 0.3)",
                  "0 0 40px rgba(0, 255, 65, 0.5)",
                  "0 0 20px rgba(0, 255, 65, 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="border-terminal-green/60 bg-terminal-green/10 flex h-20 w-20 items-center justify-center rounded-full border-2"
            >
              <LockOpen className="text-terminal-green h-10 w-10" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Header */}
        <div className="border-terminal-green/30 border-b pb-4">
          <div className="text-terminal-green/60 mb-1 font-mono text-xs tracking-widest uppercase">
            MISSION COMPLETE
          </div>
          <h1 className="text-terminal-green font-mono text-xl font-bold sm:text-2xl">
            {displayedHeader}
            {!isHeaderComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-terminal-green ml-1 inline-block h-5 w-2"
              />
            )}
          </h1>
        </div>

        {/* Status Report */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="border-terminal-green/30 bg-terminal-green/5 space-y-4 rounded-md border p-4"
        >
          {/* Signal Strength with animated bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-terminal-green/60 font-mono text-xs">
                SIGNAL STRENGTH:
              </span>
              <span className="text-terminal-green font-mono text-sm font-bold">
                100%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                className="bg-terminal-green h-full"
              />
            </div>
          </div>

          {/* Packets Recovered */}
          <div className="flex items-center justify-between">
            <span className="text-terminal-green/60 font-mono text-xs">
              PACKETS RECOVERED:
            </span>
            <span className="font-mono text-sm font-bold text-white">
              {score}/{WIN_SCORE}
            </span>
          </div>

          {/* Encryption Status */}
          <div className="flex items-center justify-between">
            <span className="text-terminal-green/60 font-mono text-xs">
              ENCRYPTION:
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="text-terminal-green font-mono text-sm font-bold"
            >
              BYPASSED
            </motion.span>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnterRoom}
          onTouchEnd={handleEnterRoom}
          type="button"
          className="bg-terminal-green text-midnight mt-2 min-h-[56px] w-full rounded-lg py-4 font-mono text-lg font-bold transition-colors hover:bg-white"
        >
          <motion.span
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            OPEN SECURE CHANNEL
          </motion.span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
