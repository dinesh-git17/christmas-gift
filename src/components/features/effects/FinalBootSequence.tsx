"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

import type { JSX } from "react";

export interface FinalBootSequenceProps {
  /** Called when the sequence completes */
  onComplete: () => void;
  /** Delay before starting the typewriter (ms) */
  startDelay?: number;
}

// Terminal log lines
const BOOT_LINES = [
  "> DECRYPTION_COMPLETE. ACCESS_GRANTED.",
  "> SEARCHING_GLOBAL_NETWORK...",
  "> TRIANGULATING_SIGNAL_SOURCE: [DINN]",
  "> TARGET_LOCATED. COORDINATES_LOCKED.",
] as const;

const FINAL_LINE = "> MISSION_STATUS: SUCCESSFUL";

const TYPEWRITER_SPEED_MS = 30;
const LINE_DELAY_MS = 400;
const COMPLETION_DELAY_MS = 1500;

/**
 * FinalBootSequence - Terminal-style boot log with typewriter effect
 */
export function FinalBootSequence({
  onComplete,
  startDelay = 0,
}: FinalBootSequenceProps): JSX.Element {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showFinalLine, setShowFinalLine] = useState(false);
  const [finalLineText, setFinalLineText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Start sequence after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLineIndex(0);
    }, startDelay);

    return (): void => clearTimeout(timer);
  }, [startDelay]);

  // Typewriter effect for main lines
  useEffect(() => {
    if (currentLineIndex < 0 || currentLineIndex >= BOOT_LINES.length) {
      return;
    }

    const currentLine = BOOT_LINES[currentLineIndex];
    if (!currentLine) {
      return;
    }

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

      return (): void => clearTimeout(timer);
    } else {
      // Line complete, move to next after delay
      const timer = setTimeout(() => {
        if (currentLineIndex < BOOT_LINES.length - 1) {
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
        } else {
          // All main lines done, show final line
          setShowFinalLine(true);
        }
      }, LINE_DELAY_MS);

      return (): void => clearTimeout(timer);
    }
  }, [currentLineIndex, currentCharIndex]);

  // Typewriter effect for final line
  useEffect(() => {
    if (!showFinalLine || isComplete) {
      return;
    }

    if (finalLineText.length < FINAL_LINE.length) {
      const timer = setTimeout(() => {
        setFinalLineText(FINAL_LINE.slice(0, finalLineText.length + 1));
      }, TYPEWRITER_SPEED_MS);

      return (): void => clearTimeout(timer);
    } else {
      // Final line complete - set complete and trigger redirect
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 0);

      return (): void => clearTimeout(timer);
    }
  }, [showFinalLine, finalLineText, isComplete]);

  // Handle completion redirect separately
  useEffect(() => {
    if (!isComplete) {
      return;
    }

    const timer = setTimeout(() => {
      onComplete();
    }, COMPLETION_DELAY_MS);

    return (): void => clearTimeout(timer);
  }, [isComplete, onComplete]);

  // Memoized callback check
  const isTypingLine = useCallback(
    (index: number): boolean => {
      const lineLength = BOOT_LINES[index]?.length ?? 0;
      return index === currentLineIndex && currentCharIndex < lineLength;
    },
    [currentLineIndex, currentCharIndex]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-terminal-green/30 w-full max-w-lg rounded-lg border bg-black/80 p-6 backdrop-blur-sm"
    >
      {/* Terminal header */}
      <div className="border-terminal-green/20 mb-4 flex items-center gap-2 border-b pb-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="text-terminal-green/50 ml-2 font-mono text-xs">
          system_access.exe
        </span>
      </div>

      {/* Terminal content */}
      <div className="min-h-[180px] font-mono text-sm leading-relaxed sm:text-base">
        {displayedLines.map((line, index) => (
          <div
            key={index}
            className={`${
              isTypingLine(index)
                ? "text-terminal-green"
                : "text-terminal-green/70"
            }`}
          >
            {line}
            {isTypingLine(index) && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-terminal-green ml-0.5 inline-block h-4 w-2"
              />
            )}
          </div>
        ))}

        {/* Final line with heart */}
        {showFinalLine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-terminal-green mt-2"
          >
            {finalLineText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-terminal-green ml-0.5 inline-block h-4 w-2"
              />
            )}
            {isComplete && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="ml-1 inline-block text-red-400"
              >
                {"<3"}
              </motion.span>
            )}
          </motion.div>
        )}
      </div>

      {/* Status indicator */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-terminal-green/20 mt-4 flex items-center justify-center gap-2 border-t pt-4"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="bg-terminal-green h-2 w-2 rounded-full"
          />
          <span className="text-terminal-green/70 font-mono text-xs">
            Initiating connection...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
