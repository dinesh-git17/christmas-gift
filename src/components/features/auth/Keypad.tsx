"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";

import { useAudio, unlockAudio } from "@/hooks/use-audio";
import { AUDIO_DURATIONS, AUDIO_PATHS, AUTH_PASSCODE } from "@/lib/constants";

import type { JSX } from "react";

export interface KeypadProps {
  onSuccess: () => void;
}

const KEYPAD_BUTTONS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "",
  "0",
  "",
] as const;

const HINT_TEXT = "// hint: 🎂 (dd/mm)";
const TRANSITION_DELAY_MS = 600; // Brief "Code Accepted" before transition

export function Keypad({ onSuccess }: KeypadProps): JSX.Element {
  const [input, setInput] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const errorAudio = useAudio(AUDIO_PATHS.ERROR_HIT);
  const vaultAudio = useAudio(AUDIO_PATHS.VAULT);

  const handleKeyPress = useCallback(
    (key: string): void => {
      // Unlock audio on key press (backup for iOS PWA)
      unlockAudio();

      if (isSuccess || !key) {
        return;
      }

      const newInput = input + key;
      setInput(newInput);

      if (newInput.length === AUTH_PASSCODE.length) {
        if (newInput === AUTH_PASSCODE) {
          setIsSuccess(true);
          vaultAudio.play();

          // Brief success state, then transition to loading
          setTimeout(() => {
            setIsTransitioning(true);
          }, TRANSITION_DELAY_MS);

          // Wait for vault audio to complete before transitioning
          void vaultAudio.playAndWait(AUDIO_DURATIONS.VAULT).then(() => {
            onSuccess();
          });
        } else {
          errorAudio.play();
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setInput("");
          }, 500);
        }
      }
    },
    [input, isSuccess, errorAudio, vaultAudio, onSuccess]
  );

  const renderDots = (): JSX.Element[] => {
    const dots: JSX.Element[] = [];
    for (let i = 0; i < AUTH_PASSCODE.length; i++) {
      const isFilled = i < input.length;
      dots.push(
        <motion.div
          key={i}
          className={`h-4 w-4 rounded-full border-2 transition-colors duration-150 ${
            isSuccess
              ? "border-terminal-green bg-terminal-green"
              : isFilled
                ? "border-white bg-white"
                : "border-white/30 bg-transparent"
          }`}
          animate={isFilled && !isSuccess ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.15 }}
        />
      );
    }
    return dots;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div
            key="keypad"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-8"
          >
            <p className="font-mono text-sm tracking-widest text-white/60 uppercase">
              Enter Access Code
            </p>

            {/* Dots display */}
            <motion.div
              className="flex gap-4"
              animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {renderDots()}
            </motion.div>

            {/* Developer comment hint - fades in after 1.5s delay */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-terminal-green/50 mb-4 font-mono text-sm"
              aria-live="polite"
            >
              {HINT_TEXT}
            </motion.p>

            {/* Keypad grid */}
            <div className="grid grid-cols-3 gap-4">
              {KEYPAD_BUTTONS.map((key, index) => (
                <div
                  key={index}
                  className="flex h-16 w-16 items-center justify-center"
                >
                  {key !== "" ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeyPress(key)}
                      disabled={isSuccess}
                      className="bg-brand-glass hover:bg-brand-glass-heavy flex h-16 w-16 items-center justify-center rounded-full border border-white/20 font-mono text-2xl text-white transition-colors hover:border-white/40 active:bg-white/20 disabled:opacity-50"
                    >
                      {key}
                    </motion.button>
                  ) : null}
                </div>
              ))}
            </div>

            <p className="text-terminal-green/80 h-5 font-mono text-xs">
              {isSuccess && "Code Accepted"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-6"
          >
            {/* Animated lock icon opening */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <motion.div
                className="border-terminal-green absolute h-full w-full rounded-full border-2"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="border-terminal-green/50 absolute h-full w-full rounded-full border"
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: [1.2, 1.4, 1.2], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <svg
                className="text-terminal-green h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <motion.rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                />
              </svg>
            </div>

            {/* Loading text */}
            <motion.p
              className="text-terminal-green font-mono text-sm tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Preparing secure channel
            </motion.p>

            {/* Animated dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="bg-terminal-green h-1.5 w-1.5 rounded-full"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
