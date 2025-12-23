"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useGameLoop, useWindowSize } from "@/hooks";
import { useGameStore } from "@/lib/store";

import { GameCanvas, type GameCanvasRef } from "./GameCanvas";
import { Player, type PlayerRef } from "./Player";

import type { JSX } from "react";

export interface GameProps {
  onGameStart?: () => void;
  onGameEnd?: () => void;
}

export function Game({ onGameStart, onGameEnd }: GameProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GameCanvasRef>(null);
  const playerRef = useRef<PlayerRef>(null);

  const [containerHeight, setContainerHeight] = useState(0);
  const { isPlaying, setIsPlaying } = useGameStore();
  const { height: windowHeight } = useWindowSize();

  // Update container height on resize
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, [windowHeight]);

  // Game loop callback
  const gameLoopCallback = useCallback(
    (deltaTime: number): void => {
      if (!isPlaying) {
        return;
      }

      canvasRef.current?.update(deltaTime);
      playerRef.current?.update(deltaTime);
    },
    [isPlaying]
  );

  const { start, stop } = useGameLoop(gameLoopCallback);

  // Handle jump action
  const handleJump = useCallback((): void => {
    if (isPlaying) {
      playerRef.current?.jump();
    }
  }, [isPlaying]);

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        handleJump();
      }
    };

    const handleTouchStart = (event: TouchEvent): void => {
      event.preventDefault();
      handleJump();
    };

    const handleMouseDown = (): void => {
      handleJump();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      container.addEventListener("mousedown", handleMouseDown);
    }
    window.addEventListener("keydown", handleKeyDown);

    return (): void => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("mousedown", handleMouseDown);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleJump]);

  // Start/stop game loop based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      start();
      onGameStart?.();
    } else {
      stop();
    }
  }, [isPlaying, start, stop, onGameStart]);

  // Cleanup on unmount
  useEffect(() => {
    return (): void => {
      stop();
      onGameEnd?.();
    };
  }, [stop, onGameEnd]);

  // Start game handler
  const handleStartGame = useCallback((): void => {
    canvasRef.current?.reset();
    playerRef.current?.reset();
    setIsPlaying(true);
  }, [setIsPlaying]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none select-none"
      style={{ overscrollBehaviorY: "none" }}
    >
      <GameCanvas ref={canvasRef}>
        {containerHeight > 0 && (
          <Player ref={playerRef} containerHeight={containerHeight} />
        )}
      </GameCanvas>

      {/* Start overlay */}
      {!isPlaying && (
        <div className="bg-midnight/80 absolute inset-0 z-50 flex items-center justify-center">
          <button
            onClick={handleStartGame}
            className="bg-terminal-green text-midnight rounded-lg px-8 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95"
            type="button"
          >
            TAP TO START
          </button>
        </div>
      )}
    </div>
  );
}
