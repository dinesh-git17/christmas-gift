"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { JSX } from "react";

export interface MissionUplinkProps {
  onInitialize: () => void;
}

// Typewriter lines to display
const UPLINK_LINES = [
  "> SCANNING BIOMETRICS...",
  "> MATCH FOUND: \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
  "> STATUS: VIP CLEARANCE",
];

const TYPEWRITER_SPEED_MS = 30;
const LINE_DELAY_MS = 400;

/**
 * Mission Uplink screen - shown on iOS PWA to force a page reload
 * which reinitializes the audio context properly.
 * Disguised as a cool boot sequence / mission briefing.
 */
export function MissionUplink({
  onInitialize,
}: MissionUplinkProps): JSX.Element {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Derive typing complete from state (avoids setState in effect body)
  const isTypingComplete = currentLineIndex >= UPLINK_LINES.length;

  // Typewriter effect for terminal lines
  useEffect(() => {
    if (currentLineIndex >= UPLINK_LINES.length) {
      return;
    }

    const currentLine = UPLINK_LINES[currentLineIndex] ?? "";

    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.slice(
            0,
            currentCharIndex + 1
          );
          return newLines;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, TYPEWRITER_SPEED_MS);

      return (): void => {
        clearTimeout(timer);
      };
    } else {
      // Line complete, move to next after delay
      const timer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, LINE_DELAY_MS);

      return (): void => {
        clearTimeout(timer);
      };
    }
  }, [currentLineIndex, currentCharIndex]);

  const handleInitialize = useCallback((): void => {
    onInitialize();
  }, [onInitialize]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden overscroll-none p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="border-terminal-green/40 bg-midnight/80 w-full max-w-md rounded-lg border-2 p-6 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="border-terminal-green/30 mb-6 flex items-center gap-3 border-b pb-4">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Radio className="text-terminal-green h-5 w-5" />
          </motion.div>
          <div>
            <div className="text-terminal-green/60 font-mono text-xs tracking-widest uppercase">
              Incoming Transmission
            </div>
            <h1 className="text-terminal-green font-mono text-xl font-bold">
              PRIORITY ALPHA
            </h1>
          </div>
        </div>

        {/* Terminal output */}
        <div className="bg-terminal-green/5 mb-6 rounded-md p-4 font-mono text-sm">
          {displayedLines.map((line, index) => (
            <div
              key={index}
              className={`${
                index === currentLineIndex && !isTypingComplete
                  ? "text-terminal-green"
                  : "text-terminal-green/70"
              }`}
            >
              {line}
              {index === currentLineIndex && !isTypingComplete && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="bg-terminal-green ml-0.5 inline-block h-4 w-2"
                />
              )}
            </div>
          ))}
        </div>

        {/* Mission text - appears after typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isTypingComplete ? 1 : 0,
            y: isTypingComplete ? 0 : 10,
          }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-terminal-green/90 font-mono text-sm leading-relaxed">
            Agent, your presence has been requested at a secure North Pole
            facility.
          </p>
          <p className="text-terminal-green/70 mt-3 font-mono text-sm">
            Initialize system to begin mission briefing.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: isTypingComplete ? 1 : 0,
            scale: isTypingComplete ? 1 : 0.9,
          }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleInitialize}
          disabled={!isTypingComplete}
          type="button"
          className="bg-terminal-green text-midnight relative min-h-[56px] w-full overflow-hidden rounded-lg py-4 font-mono text-lg font-bold transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* Pulsing glow effect */}
          <motion.div
            animate={{
              opacity: isTypingComplete ? [0.3, 0.6, 0.3] : 0,
              scale: isTypingComplete ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-terminal-green absolute inset-0 rounded-lg blur-md"
          />
          <span className="relative z-10">INITIALIZE UPLINK</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
