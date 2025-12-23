"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameLoopCallback = (deltaTime: number) => void;

interface UseGameLoopReturn {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
}

export function useGameLoop(callback: GameLoopCallback): UseGameLoopReturn {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);
  const [isRunning, setIsRunning] = useState(false);

  // Keep callback ref up to date without triggering re-renders
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Animation loop effect
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const animate = (time: number): void => {
      if (previousTimeRef.current !== null) {
        // Calculate delta time in seconds, cap at 100ms to handle tab switching
        const deltaTime = Math.min(
          (time - previousTimeRef.current) / 1000,
          0.1
        );
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    previousTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);

    return (): void => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
    };
  }, [isRunning]);

  const start = useCallback((): void => {
    setIsRunning(true);
  }, []);

  const stop = useCallback((): void => {
    setIsRunning(false);
  }, []);

  return {
    start,
    stop,
    isRunning,
  };
}
