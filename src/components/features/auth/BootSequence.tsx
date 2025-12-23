"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  BOOT_COMPLETE_DELAY_MS,
  BOOT_MESSAGE_DELAY_MS,
  BOOT_SEQUENCE_MESSAGES,
  TYPEWRITER_CHAR_DELAY_MS,
} from "@/lib/constants";
import { useAuthStore } from "@/lib/store";

import type { JSX } from "react";

interface MessageLineProps {
  text: string;
  isTyping: boolean;
  onComplete?: () => void;
}

function MessageLine({
  text,
  isTyping,
  onComplete,
}: MessageLineProps): JSX.Element {
  const [displayedText, setDisplayedText] = useState(isTyping ? "" : text);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    hasCompletedRef.current = false;
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(interval);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete?.();
        }
      }
    }, TYPEWRITER_CHAR_DELAY_MS);

    return (): void => {
      clearInterval(interval);
    };
  }, [text, isTyping, onComplete]);

  return (
    <p className="mb-2">
      {displayedText}
      {isTyping && displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="bg-terminal-green inline-block h-4 w-2"
        />
      )}
    </p>
  );
}

export function BootSequence(): JSX.Element {
  const router = useRouter();
  const setAuthStage = useAuthStore((state) => state.setAuthStage);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleMessageComplete = useCallback((): void => {
    if (currentMessageIndex < BOOT_SEQUENCE_MESSAGES.length - 1) {
      setTimeout(() => {
        setCurrentMessageIndex((prev) => prev + 1);
      }, BOOT_MESSAGE_DELAY_MS);
    } else {
      setIsComplete(true);
    }
  }, [currentMessageIndex]);

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    const timeout = setTimeout(() => {
      setAuthStage("AUTHENTICATED");
      router.push("/game");
    }, BOOT_COMPLETE_DELAY_MS);

    return (): void => {
      clearTimeout(timeout);
    };
  }, [isComplete, router, setAuthStage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-svh flex-col items-start justify-center p-8"
    >
      <div className="text-terminal-green font-mono text-sm leading-relaxed">
        {BOOT_SEQUENCE_MESSAGES.map((message, index) => {
          if (index > currentMessageIndex) {
            return null;
          }

          return (
            <MessageLine
              key={index}
              text={message}
              isTyping={index === currentMessageIndex && !isComplete}
              onComplete={
                index === currentMessageIndex
                  ? handleMessageComplete
                  : undefined
              }
            />
          );
        })}

        {isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="bg-terminal-green inline-block h-4 w-2"
          />
        )}
      </div>
    </motion.div>
  );
}
