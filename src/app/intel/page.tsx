"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";

import { useAudio, unlockAudio } from "@/hooks";
import {
  AUDIO_PATHS,
  INTEL_BRIEFING,
  INTEL_BOOT_SEQUENCE,
  INTEL_BOOT_TIMING,
  INTEL_LETTER,
  INTEL_LETTER_TIMING,
} from "@/lib/constants";

import type { JSX } from "react";

type ViewState =
  | "BRIEFING"
  | "DECRYPTING"
  | "GLOWING"
  | "FADING"
  | "DARK_PAUSE"
  | "MUSIC_CUE"
  | "LETTER";

// Intel page background color for iOS Safari safe area
const INTEL_BG_COLOR = "#0f0f11";

/**
 * Briefing Card - Stage 1
 * High-priority intelligence dossier with hacker aesthetic
 */
interface BriefingCardProps {
  onInitiate: () => void;
}

function BriefingCard({ onInitiate }: BriefingCardProps): JSX.Element {
  const [displayedHeader, setDisplayedHeader] = useState("");
  const [isHeaderComplete, setIsHeaderComplete] = useState(false);

  // Typewriter effect for header
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < INTEL_BRIEFING.HEADER.length) {
        currentIndex++;
        setDisplayedHeader(INTEL_BRIEFING.HEADER.slice(0, currentIndex));
      } else {
        clearInterval(interval);
        setIsHeaderComplete(true);
      }
    }, 50);

    return (): void => {
      clearInterval(interval);
    };
  }, []);

  const handleInitiate = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation();
      unlockAudio();
      onInitiate();
    },
    [onInitiate]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="border-terminal-green/40 bg-midnight/60 flex w-full max-w-md flex-col gap-6 rounded-lg border-2 p-6 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="border-terminal-green/30 border-b pb-4">
        <div className="text-terminal-green/60 mb-1 font-mono text-xs tracking-widest uppercase">
          PRIORITY: ALPHA
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

      {/* Subject Image with scanning effect */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex items-center gap-4"
      >
        {/* Glitch effect container */}
        <div className="relative">
          <motion.div
            animate={{
              x: [0, -2, 2, -1, 1, 0],
              opacity: [1, 0.8, 1, 0.9, 1],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="border-romance-gold/60 relative h-20 w-20 overflow-hidden rounded-lg border-2"
          >
            <Image
              src="/assets/characters/dinn_wave.png"
              alt="Subject: Dinn"
              fill
              className="object-contain"
              unoptimized
            />
            {/* Scan grid overlay */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%),
                  linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%)
                `,
                backgroundSize: "8px 8px",
              }}
            />
            {/* Scanline overlay */}
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="via-terminal-green/20 pointer-events-none absolute inset-0 h-4 bg-gradient-to-b from-transparent to-transparent"
            />
          </motion.div>
          {/* Glitch color artifacts */}
          <motion.div
            animate={{
              opacity: [0, 0.3, 0, 0.2, 0],
              x: [0, 3, -2, 1, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 2.5,
            }}
            className="pointer-events-none absolute inset-0 h-20 w-20 overflow-hidden rounded-lg mix-blend-screen"
          >
            <div className="absolute inset-0 translate-x-1 bg-cyan-500/30" />
          </motion.div>
        </div>
        <div>
          <div className="text-terminal-green/60 font-mono text-xs uppercase">
            Subject
          </div>
          <div className="text-romance-gold font-mono text-lg font-bold">
            DINN
          </div>
          <motion.div
            animate={{ opacity: [0.8, 1, 0.6, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-terminal-green flex items-center gap-1 font-mono text-xs"
          >
            <ShieldAlert className="h-3 w-3" />
            <span>SIGNAL SECURED</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Body Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="bg-terminal-green/5 rounded-md p-4"
      >
        <p className="text-terminal-green/90 font-mono text-sm leading-relaxed whitespace-pre-line">
          {INTEL_BRIEFING.BODY}
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleInitiate}
        onTouchEnd={handleInitiate}
        type="button"
        className="bg-terminal-green text-midnight relative mt-2 min-h-[56px] w-full overflow-hidden rounded-lg py-4 font-mono text-lg font-bold transition-colors hover:bg-white"
      >
        {/* Pulsing glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-terminal-green absolute inset-0 rounded-lg blur-md"
        />
        <span className="relative z-10">{INTEL_BRIEFING.CTA}</span>
      </motion.button>
    </motion.div>
  );
}

// Characters used for scrambled/encrypted text effect
const DECRYPT_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEF";

/**
 * Generates a scrambled version of a string with some characters revealed
 */
function getScrambledText(target: string, revealedCount: number): string {
  return target
    .split("")
    .map((char, index) => {
      if (index < revealedCount) {
        return char;
      }
      if (char === " ") {
        return " ";
      }
      return DECRYPT_CHARS[Math.floor(Math.random() * DECRYPT_CHARS.length)];
    })
    .join("");
}

/**
 * Single line that decrypts with scramble effect
 */
interface DecryptingLineProps {
  text: string;
  isActive: boolean;
  isComplete: boolean;
  isLastLine: boolean;
}

function DecryptingLine({
  text,
  isActive,
  isComplete,
  isLastLine,
}: DecryptingLineProps): JSX.Element {
  const [displayedText, setDisplayedText] = useState(
    isComplete ? text : getScrambledText(text, 0)
  );

  useEffect(() => {
    if (!isActive || isComplete) {
      if (isComplete) {
        setDisplayedText(text);
      }
      return undefined;
    }

    const totalChars = text.length;
    const totalSteps = Math.ceil(
      INTEL_BOOT_TIMING.DECRYPT_DURATION_MS /
        INTEL_BOOT_TIMING.DECRYPT_INTERVAL_MS
    );
    let step = 0;

    // Start with scrambled
    setDisplayedText(getScrambledText(text, 0));

    const interval = setInterval(() => {
      step++;
      const revealedCount = Math.floor((step / totalSteps) * totalChars);

      if (revealedCount >= totalChars) {
        clearInterval(interval);
        setDisplayedText(text);
      } else {
        setDisplayedText(getScrambledText(text, revealedCount));
      }
    }, INTEL_BOOT_TIMING.DECRYPT_INTERVAL_MS);

    return (): void => {
      clearInterval(interval);
    };
  }, [isActive, isComplete, text]);

  const showHearts = isLastLine && isComplete;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isComplete ? 0.6 : 1,
        y: 0,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex items-center justify-center gap-2 font-mono text-lg sm:text-xl ${
        isComplete ? "text-terminal-green/60" : "text-terminal-green"
      } ${isLastLine && isComplete ? "!text-terminal-green !opacity-100" : ""}`}
    >
      {showHearts && <Heart className="h-4 w-4 text-red-400" />}
      <span>{displayedText}</span>
      {showHearts && <Heart className="h-4 w-4 text-red-400" />}
    </motion.div>
  );
}

/**
 * Decryption Sequence - Stage 2
 * Lines decrypt one by one, sliding up to reveal the next
 */
interface DecryptionSequenceProps {
  onComplete: () => void;
}

function DecryptionSequence({
  onComplete,
}: DecryptionSequenceProps): JSX.Element {
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
  const hasCompletedRef = useRef(false);

  // Handle line completion timing
  useEffect(() => {
    if (activeLineIndex >= INTEL_BOOT_SEQUENCE.length) {
      // All lines done - trigger completion after hold
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        const timer = setTimeout(() => {
          onComplete();
        }, INTEL_BOOT_TIMING.FINAL_HOLD_MS);
        return (): void => clearTimeout(timer);
      }
      return undefined;
    }

    // Wait for current line to decrypt, then move to next
    const timer = setTimeout(() => {
      setCompletedLines((prev) => new Set([...prev, activeLineIndex]));
      // Small delay before starting next line
      setTimeout(() => {
        setActiveLineIndex((prev) => prev + 1);
      }, 300);
    }, INTEL_BOOT_TIMING.DECRYPT_DURATION_MS);

    return (): void => clearTimeout(timer);
  }, [activeLineIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center gap-3 px-6 text-center"
    >
      {INTEL_BOOT_SEQUENCE.map((line, index) => {
        // Only show lines that have started decrypting
        if (index > activeLineIndex) {
          return null;
        }

        return (
          <DecryptingLine
            key={index}
            text={line}
            isActive={index === activeLineIndex}
            isComplete={completedLines.has(index)}
            isLastLine={index === INTEL_BOOT_SEQUENCE.length - 1}
          />
        );
      })}
    </motion.div>
  );
}

// Height of CTA card area (pt-12 + gap-4 + button height + pb-8 + safe area)
const CTA_SAFE_AREA_HEIGHT = 160;

/**
 * Love Letter - Stage 3
 * Terminal-style typewriter display of the final message
 */
interface LoveLetterProps {
  onReplay: () => void;
  onContinue: () => void;
}

function LoveLetter({ onReplay, onContinue }: LoveLetterProps): JSX.Element {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    let charIndex = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      if (charIndex < INTEL_LETTER.length) {
        charIndex++;
        setDisplayedText(INTEL_LETTER.slice(0, charIndex));

        // Smooth auto-scroll as text appears
        if (scrollRef.current) {
          const targetScroll = scrollRef.current.scrollHeight;
          // Only scroll if we need to (prevents fighting with user scroll)
          if (targetScroll > lastScrollRef.current) {
            lastScrollRef.current = targetScroll;
            scrollRef.current.scrollTo({
              top: targetScroll,
              behavior: "smooth",
            });
          }
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setIsComplete(true);
      }
    }, INTEL_LETTER_TIMING.CHAR_DELAY_MS);

    return (): void => {
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 flex flex-col"
    >
      {/* Top fade overlay - covers safe area and fades text smoothly */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 z-10"
        style={{
          height: "calc(env(safe-area-inset-top, 0px) + 3rem)",
          background: `linear-gradient(to bottom, ${INTEL_BG_COLOR} 0%, ${INTEL_BG_COLOR} 60%, transparent 100%)`,
        }}
      />

      {/* Letter container - always scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 255, 65, 0.3) transparent",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="mx-auto max-w-2xl">
          <pre className="text-terminal-green/90 font-mono text-sm leading-relaxed whitespace-pre-wrap sm:text-base md:text-lg">
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="bg-terminal-green inline-block h-4 w-2 sm:h-5"
              />
            )}
          </pre>

          {/* Safe area spacer - always present to keep text above CTA zone */}
          <div style={{ height: CTA_SAFE_AREA_HEIGHT }} />
        </div>
      </div>

      {/* Footer with CTAs - always visible but fades in content */}
      <div className="from-midnight via-midnight/95 pointer-events-none fixed right-0 bottom-0 left-0 bg-gradient-to-t to-transparent px-4 pt-12 pb-8">
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="pointer-events-auto mx-auto flex max-w-md flex-col items-center gap-4"
            >
              {/* End of transmission marker */}
              <div className="text-terminal-green/50 flex items-center gap-2 font-mono text-xs">
                <div className="bg-terminal-green/30 h-px w-8" />
                <span>END OF TRANSMISSION</span>
                <div className="bg-terminal-green/30 h-px w-8" />
              </div>

              {/* CTA Buttons */}
              <div className="flex w-full gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReplay}
                  className="border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 min-h-[48px] flex-1 rounded-lg border px-6 py-3 font-mono text-sm transition-colors"
                >
                  Replay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinue}
                  className="bg-terminal-green text-midnight min-h-[48px] flex-1 rounded-lg px-6 py-3 font-mono text-sm font-bold transition-colors hover:bg-white"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Intel Page - Phase 7 Final Reveal
 * State machine: BRIEFING → DECRYPTING → GLOWING → FADING → DARK_PAUSE → MUSIC_CUE → LETTER
 */
export default function IntelPage(): JSX.Element {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>("BRIEFING");
  const [letterKey, setLetterKey] = useState(0);

  // Audio
  const decryptSound = useAudio(AUDIO_PATHS.DECRYPT, { volume: 0.5 });
  const loveStoryMusic = useAudio(AUDIO_PATHS.LOVE_STORY, {
    loop: true,
    volume: 0.5,
  });

  // Preload audio on mount
  useEffect(() => {
    decryptSound.preload();
    loveStoryMusic.preload();
  }, [decryptSound, loveStoryMusic]);

  // Set body background for iOS Safari safe area
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = INTEL_BG_COLOR;
    document.documentElement.style.backgroundColor = INTEL_BG_COLOR;

    return (): void => {
      document.body.style.backgroundColor = originalBg;
      document.documentElement.style.backgroundColor = originalBg;
    };
  }, []);

  // State machine transitions
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    switch (viewState) {
      case "GLOWING":
        // After glow, start fading
        timer = setTimeout(() => {
          setViewState("FADING");
        }, INTEL_LETTER_TIMING.GLOW_DURATION_MS);
        break;

      case "FADING":
        // After fade, go to dark pause
        timer = setTimeout(() => {
          setViewState("DARK_PAUSE");
        }, INTEL_LETTER_TIMING.FADE_OUT_DURATION_MS);
        break;

      case "DARK_PAUSE":
        // After dark pause, cue music
        timer = setTimeout(() => {
          loveStoryMusic.play();
          setViewState("MUSIC_CUE");
        }, INTEL_LETTER_TIMING.DARK_PAUSE_MS);
        break;

      case "MUSIC_CUE":
        // After music lead-in, show letter
        timer = setTimeout(() => {
          setViewState("LETTER");
        }, INTEL_LETTER_TIMING.MUSIC_LEAD_IN_MS);
        break;
    }

    return (): void => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [viewState, loveStoryMusic]);

  // Handle initiate - start decryption and play decrypt sound
  const handleInitiate = useCallback((): void => {
    setViewState("DECRYPTING");
    decryptSound.play();
  }, [decryptSound]);

  // Handle decryption complete - go to glow phase
  const handleDecryptionComplete = useCallback((): void => {
    decryptSound.stop();
    setViewState("GLOWING");
  }, [decryptSound]);

  // Handle replay - restart letter from beginning
  const handleReplay = useCallback((): void => {
    setLetterKey((prev) => prev + 1);
  }, []);

  // Handle continue - navigate to cipher page
  const handleContinue = useCallback((): void => {
    loveStoryMusic.fadeOut(800);
    router.replace("/cipher");
  }, [loveStoryMusic, router]);

  return (
    <div className="bg-midnight fixed inset-0">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(0, 255, 65, 0.03) 0%, transparent 50%)",
        }}
      />

      {/* Main content */}
      <main className="relative h-full">
        <AnimatePresence mode="wait">
          {viewState === "BRIEFING" && (
            <motion.div
              key="briefing"
              className="flex h-full items-center justify-center p-6"
            >
              <BriefingCard onInitiate={handleInitiate} />
            </motion.div>
          )}

          {viewState === "DECRYPTING" && (
            <motion.div
              key="decrypting"
              className="flex h-full items-center justify-center p-6"
            >
              <DecryptionSequence onComplete={handleDecryptionComplete} />
            </motion.div>
          )}

          {viewState === "GLOWING" && (
            <motion.div
              key="glowing"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
            >
              {/* Glow effect on all lines */}
              {INTEL_BOOT_SEQUENCE.map((line, index) => {
                const isLastLine = index === INTEL_BOOT_SEQUENCE.length - 1;
                return (
                  <motion.div
                    key={index}
                    initial={{ textShadow: "0 0 0px rgba(0, 255, 65, 0)" }}
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(0, 255, 65, 0)",
                        "0 0 20px rgba(0, 255, 65, 0.8)",
                        "0 0 30px rgba(0, 255, 65, 0.6)",
                      ],
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`flex items-center justify-center gap-2 font-mono text-lg sm:text-xl ${
                      isLastLine
                        ? "text-terminal-green"
                        : "text-terminal-green/60"
                    }`}
                  >
                    {isLastLine && <Heart className="h-4 w-4 text-red-400" />}
                    <span>{line}</span>
                    {isLastLine && <Heart className="h-4 w-4 text-red-400" />}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {viewState === "FADING" && (
            <motion.div
              key="fading"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{
                duration: INTEL_LETTER_TIMING.FADE_OUT_DURATION_MS / 1000,
                ease: "easeOut",
              }}
              className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
            >
              {/* Lines fading out with glow */}
              {INTEL_BOOT_SEQUENCE.map((line, index) => {
                const isLastLine = index === INTEL_BOOT_SEQUENCE.length - 1;
                return (
                  <div
                    key={index}
                    style={{ textShadow: "0 0 20px rgba(0, 255, 65, 0.5)" }}
                    className={`flex items-center justify-center gap-2 font-mono text-lg sm:text-xl ${
                      isLastLine
                        ? "text-terminal-green"
                        : "text-terminal-green/60"
                    }`}
                  >
                    {isLastLine && <Heart className="h-4 w-4 text-red-400" />}
                    <span>{line}</span>
                    {isLastLine && <Heart className="h-4 w-4 text-red-400" />}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* DARK_PAUSE and MUSIC_CUE show nothing - just empty screen */}
          {(viewState === "DARK_PAUSE" || viewState === "MUSIC_CUE") && (
            <motion.div
              key="dark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              className="h-full"
            />
          )}

          {viewState === "LETTER" && (
            <LoveLetter
              key={`letter-${letterKey}`}
              onReplay={handleReplay}
              onContinue={handleContinue}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
