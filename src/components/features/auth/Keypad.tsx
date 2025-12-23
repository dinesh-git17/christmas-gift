"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

import { useAudio } from "@/hooks/use-audio";
import {
  AUDIO_PATHS,
  AUTH_PASSCODE,
  SUCCESS_AUDIO_DELAY_MS,
} from "@/lib/constants";

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

export function Keypad({ onSuccess }: KeypadProps): JSX.Element {
  const [input, setInput] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const errorAudio = useAudio(AUDIO_PATHS.ERROR_HIT);
  const successAudio = useAudio(AUDIO_PATHS.SUCCESS_UNLOCK);

  const handleKeyPress = useCallback(
    (key: string): void => {
      if (isSuccess || !key) {
        return;
      }

      const newInput = input + key;
      setInput(newInput);

      if (newInput.length === AUTH_PASSCODE.length) {
        if (newInput === AUTH_PASSCODE) {
          setIsSuccess(true);
          successAudio.play();
          setTimeout(() => {
            onSuccess();
          }, SUCCESS_AUDIO_DELAY_MS);
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
    [input, isSuccess, errorAudio, successAudio, onSuccess]
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
    </div>
  );
}
