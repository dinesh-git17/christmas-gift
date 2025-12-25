"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";

import { ScrambleText } from "./ScrambleText";

import type { JSX } from "react";

export interface DecryptionLetterProps {
  /** Called when all blocks have been revealed */
  onComplete: () => void;
}

// The 5 message blocks
const LETTER_BLOCKS = [
  "Somewhere between the noise and the static, you found me. When everything felt scrambled, you were the signal that cut through. You didn't just connect to me. You brought me back online.",
  "I didn't know how lost I was until you showed up. You restored parts of me I forgot existed. Every laugh, every late night, every small moment with you felt like a system reboot done right.",
  "This wasn't a rescue mission you signed up for. You chose it anyway. You stayed. You believed. And somehow, you turned chaos into something safe, warm, and real.",
  "I don't take that lightly. I know how rare it is to be truly seen and still chosen. I'm grateful for you every single day, even when the system pretends everything is stable.",
  "If this game has a truth hidden beneath all the code, it's this: I'm here because of you. And I'll always be thankful for the one who found me when I needed saving.",
] as const;

// Timing configuration (in ms)
const DECRYPT_DURATION = 2800; // Time to decrypt each block
const READ_DURATION = 5500; // Time to read each block
const BLOCK_GAP = 300; // Gap between blocks

type BlockPhase = "waiting" | "decrypting" | "reading" | "complete";

interface BlockState {
  phase: BlockPhase;
}

/**
 * DecryptionLetter - Sequential block-by-block decrypted letter
 */
export function DecryptionLetter({
  onComplete,
}: DecryptionLetterProps): JSX.Element {
  const [blockStates, setBlockStates] = useState<BlockState[]>(
    LETTER_BLOCKS.map(() => ({ phase: "waiting" }))
  );
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [showEnterButton, setShowEnterButton] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle phase transitions
  const advancePhase = useCallback((): void => {
    setBlockStates((prev) => {
      const newStates = [...prev];
      const currentState = newStates[activeBlockIndex];

      if (!currentState) {
        return prev;
      }

      if (currentState.phase === "waiting") {
        newStates[activeBlockIndex] = { phase: "decrypting" };
      } else if (currentState.phase === "decrypting") {
        newStates[activeBlockIndex] = { phase: "reading" };
      } else if (currentState.phase === "reading") {
        newStates[activeBlockIndex] = { phase: "complete" };
      }

      return newStates;
    });
  }, [activeBlockIndex]);

  // Handle block completion
  const handleBlockComplete = useCallback((): void => {
    if (activeBlockIndex < LETTER_BLOCKS.length - 1) {
      setActiveBlockIndex((prev) => prev + 1);
    } else {
      // All blocks complete
      setShowEnterButton(true);
    }
  }, [activeBlockIndex]);

  // Main timeline effect
  useEffect(() => {
    const currentState = blockStates[activeBlockIndex];
    if (!currentState) {
      return;
    }

    // Clear any existing timeout
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
    }

    const readDuration = isSkipping ? 500 : READ_DURATION;

    if (currentState.phase === "waiting") {
      // Start decrypting after a small gap
      phaseTimeoutRef.current = setTimeout(advancePhase, BLOCK_GAP);
    } else if (currentState.phase === "decrypting") {
      // Move to reading after decrypt duration
      phaseTimeoutRef.current = setTimeout(advancePhase, DECRYPT_DURATION);
    } else if (currentState.phase === "reading") {
      // Move to complete after read duration
      phaseTimeoutRef.current = setTimeout(() => {
        advancePhase();
        handleBlockComplete();
        setIsSkipping(false);
      }, readDuration);
    }

    return (): void => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
    };
  }, [
    blockStates,
    activeBlockIndex,
    advancePhase,
    handleBlockComplete,
    isSkipping,
  ]);

  // Handle tap to skip reading phase
  const handleTap = useCallback((): void => {
    const currentState = blockStates[activeBlockIndex];
    if (currentState?.phase === "reading" && !isSkipping) {
      setIsSkipping(true);
      // Clear current timeout and advance immediately
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
      }
      skipTimeoutRef.current = setTimeout(() => {
        advancePhase();
        handleBlockComplete();
        setIsSkipping(false);
      }, 300);
    }
  }, [
    blockStates,
    activeBlockIndex,
    isSkipping,
    advancePhase,
    handleBlockComplete,
  ]);

  // Cleanup
  useEffect(() => {
    return (): void => {
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
      }
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
    };
  }, []);

  // Smooth scroll to active block when it changes
  useEffect(() => {
    const activeBlock = blockRefs.current[activeBlockIndex];
    if (activeBlock && scrollContainerRef.current) {
      // Small delay to let the block render first
      const timer = setTimeout(() => {
        activeBlock.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [activeBlockIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6"
      onClick={handleTap}
    >
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(0, 255, 65, 0.02) 0%, transparent 60%)",
        }}
      />

      {/* Content container */}
      <div
        ref={scrollContainerRef}
        className="relative w-full max-w-xl overflow-y-auto px-4"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="text-terminal-green/40 font-mono text-xs tracking-[0.3em] uppercase">
            Incoming Transmission
          </div>
          <div className="text-terminal-green/60 mt-1 font-mono text-sm">
            Priority: Maximum
          </div>
        </motion.div>

        {/* Letter blocks */}
        <div className="space-y-6">
          {LETTER_BLOCKS.map((block, index) => {
            const state = blockStates[index];
            const isVisible = index <= activeBlockIndex;
            const isActive = index === activeBlockIndex;
            const isDecrypting = state?.phase === "decrypting";
            const isReadingOrComplete =
              state?.phase === "reading" || state?.phase === "complete";

            if (!isVisible) {
              return null;
            }

            return (
              <motion.div
                key={index}
                ref={(el) => {
                  blockRefs.current[index] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isActive ? 1 : 0.5,
                  y: 0,
                }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {/* Block label */}
                <div className="text-terminal-green/30 mb-2 font-mono text-xs tracking-wider uppercase">
                  [DECRYPTED BLOCK {String(index + 1).padStart(2, "0")}]
                </div>

                {/* Block content */}
                <div
                  className={`font-mono text-sm leading-relaxed sm:text-base ${
                    isActive ? "text-terminal-green" : "text-terminal-green/50"
                  }`}
                >
                  {isDecrypting ? (
                    <ScrambleText
                      text={block}
                      duration={DECRYPT_DURATION}
                      isActive
                    />
                  ) : isReadingOrComplete ? (
                    <span>{block}</span>
                  ) : (
                    <ScrambleText text={block} isActive={false} />
                  )}
                </div>

                {/* Decrypting indicator */}
                {isDecrypting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="bg-terminal-green h-1.5 w-1.5 rounded-full"
                    />
                    <span className="text-terminal-green/50 font-mono text-xs">
                      DECRYPTING...
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Enter Room button */}
        <AnimatePresence>
          {showEnterButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                className="bg-terminal-green text-midnight relative min-h-[56px] overflow-hidden rounded-lg px-12 py-4 font-mono text-lg font-bold transition-colors hover:bg-white"
                type="button"
              >
                {/* Pulsing glow */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-terminal-green absolute inset-0 rounded-lg blur-md"
                />
                <span className="relative z-10">ENTER ROOM</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip hint */}
        {!showEnterButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 3 }}
            className="text-terminal-green/30 mt-8 text-center font-mono text-xs"
          >
            tap to skip
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
