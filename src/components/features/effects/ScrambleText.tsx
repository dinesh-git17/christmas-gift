"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import type { JSX } from "react";

export interface ScrambleTextProps {
  /** The final text to reveal */
  text: string;
  /** Duration of the scramble animation in ms */
  duration?: number;
  /** Delay before starting the animation in ms */
  delay?: number;
  /** Called when the animation completes */
  onComplete?: () => void;
  /** Whether the animation should be active */
  isActive?: boolean;
  /** Additional className for styling */
  className?: string;
}

// Matrix-style characters for scrambling
const SCRAMBLE_CHARS =
  "!@#$%^&*()_+-=[]{}|;:,.<>?/~0123456789アイウエオカキクケコ";

/**
 * ScrambleText - Animates text from scrambled matrix characters to readable text
 * Characters resolve progressively from left to right with some randomness
 */
export function ScrambleText({
  text,
  duration = 2500,
  delay = 0,
  onComplete,
  isActive = true,
  className = "",
}: ScrambleTextProps): JSX.Element {
  const [displayText, setDisplayText] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const resolvedIndicesRef = useRef<Set<number>>(new Set());

  const getRandomChar = useCallback((): string => {
    const index = Math.floor(Math.random() * SCRAMBLE_CHARS.length);
    return SCRAMBLE_CHARS[index] ?? "?";
  }, []);

  const generateScrambledText = useCallback(
    (resolvedCount: number): string => {
      const chars: string[] = [];
      for (let i = 0; i < text.length; i++) {
        const originalChar = text[i] ?? "";
        // Preserve spaces and punctuation
        if (originalChar === " " || originalChar === "\n") {
          chars.push(originalChar);
          resolvedIndicesRef.current.add(i);
        } else if (resolvedIndicesRef.current.has(i)) {
          chars.push(originalChar);
        } else if (i < resolvedCount) {
          // This index should now be resolved
          resolvedIndicesRef.current.add(i);
          chars.push(originalChar);
        } else {
          // Still scrambled
          chars.push(getRandomChar());
        }
      }
      return chars.join("");
    },
    [text, getRandomChar]
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Reset state (deferred to avoid direct setState in effect)
    resolvedIndicesRef.current = new Set();
    const resetTimer = setTimeout(() => {
      setIsComplete(false);
    }, 0);

    const startAnimation = (): void => {
      startTimeRef.current = performance.now();

      const animate = (currentTime: number): void => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Calculate how many characters should be resolved
        // Use easeOutQuad for smoother reveal
        const easedProgress = 1 - (1 - progress) * (1 - progress);
        const resolvedCount = Math.floor(easedProgress * text.length);

        const newText = generateScrambledText(resolvedCount);
        setDisplayText(newText);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure final text is correct
          setDisplayText(text);
          setIsComplete(true);
          onComplete?.();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start after delay
    const delayTimer = setTimeout(startAnimation, delay);

    return (): void => {
      clearTimeout(resetTimer);
      clearTimeout(delayTimer);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, text, duration, delay, generateScrambledText, onComplete]);

  // Initialize with scrambled text (deferred)
  useEffect(() => {
    if (!isActive && !isComplete) {
      // Show fully scrambled text initially
      const initTimer = setTimeout(() => {
        const scrambled = text
          .split("")
          .map((char) =>
            char === " " || char === "\n" ? char : getRandomChar()
          )
          .join("");
        setDisplayText(scrambled);
      }, 0);
      return (): void => clearTimeout(initTimer);
    }
    return undefined;
  }, [isActive, isComplete, text, getRandomChar]);

  return (
    <span className={`whitespace-pre-wrap ${className}`}>
      {displayText || text.replace(/[^\s]/g, () => getRandomChar())}
    </span>
  );
}
