"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useGameLoop, useWindowSize } from "@/hooks";
import { useGameStore } from "@/lib/store";

import { Countdown } from "./Countdown";
import { GameCanvas, type GameCanvasRef } from "./GameCanvas";
import { MissionBriefing } from "./MissionBriefing";
import { Player, type PlayerRef } from "./Player";
import { Spawner, type SpawnerRef } from "./Spawner";

import type { JSX } from "react";

const DEFAULT_HITBOX = { left: 0, right: 0, top: 0, bottom: 0 };

export interface GameProps {
  onGameStart?: () => void;
  onGameEnd?: () => void;
}

export function Game({ onGameStart, onGameEnd }: GameProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GameCanvasRef>(null);
  const playerRef = useRef<PlayerRef>(null);
  const spawnerRef = useRef<SpawnerRef>(null);

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const {
    isPlaying,
    status,
    score,
    setIsPlaying,
    startCountdown,
    reset: resetGame,
  } = useGameStore();
  const { height: windowHeight, width: windowWidth } = useWindowSize();

  // Update container dimensions on resize
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [windowHeight, windowWidth]);

  // Get player hitbox for collision detection
  const getPlayerHitbox = useCallback(() => {
    return playerRef.current?.getHitbox() ?? DEFAULT_HITBOX;
  }, []);

  // Handle crash animation when hitting a glitch
  const handleCrash = useCallback(() => {
    playerRef.current?.crash();
  }, []);

  // Game loop callback
  const gameLoopCallback = useCallback(
    (deltaTime: number): void => {
      if (!isPlaying) {
        return;
      }

      canvasRef.current?.update(deltaTime);
      playerRef.current?.update(deltaTime);
      spawnerRef.current?.update(deltaTime);
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
      // Support Space and ArrowUp for jump
      if (
        event.code === "Space" ||
        event.key === " " ||
        event.code === "ArrowUp" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        handleJump();
      }
    };

    const handleTouchStart = (event: TouchEvent): void => {
      // Only handle touch for jumping when game is playing
      // Don't preventDefault on buttons (let them handle their own events)
      const target = event.target as HTMLElement;
      if (target.tagName === "BUTTON") {
        return;
      }
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

  // Handle mission briefing initiate - start countdown
  const handleInitiate = useCallback((): void => {
    resetGame();
    canvasRef.current?.reset();
    playerRef.current?.reset();
    spawnerRef.current?.reset();
    startCountdown();
  }, [resetGame, startCountdown]);

  // Handle countdown complete - start the game
  const handleCountdownComplete = useCallback((): void => {
    setIsPlaying(true);
  }, [setIsPlaying]);

  // Handle retry after game over
  const handleRetry = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation();
      resetGame();
      canvasRef.current?.reset();
      playerRef.current?.reset();
      spawnerRef.current?.reset();
      startCountdown();
    },
    [resetGame, startCountdown]
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none select-none"
      style={{ overscrollBehaviorY: "none" }}
    >
      <GameCanvas ref={canvasRef}>
        {containerHeight > 0 && containerWidth > 0 && (
          <>
            <Player
              ref={playerRef}
              containerHeight={containerHeight}
              containerWidth={containerWidth}
            />
            <Spawner
              ref={spawnerRef}
              containerWidth={containerWidth}
              containerHeight={containerHeight}
              getPlayerHitbox={getPlayerHitbox}
              onCrash={handleCrash}
            />
          </>
        )}
      </GameCanvas>

      {/* Score display */}
      {isPlaying && (
        <div className="absolute top-4 left-4 z-40">
          <div className="bg-midnight/60 rounded-lg px-4 py-2 backdrop-blur-sm">
            <span className="text-terminal-green font-mono text-xl font-bold">
              ❤️ {score} / 10
            </span>
          </div>
        </div>
      )}

      {/* Mission Briefing - shown when idle */}
      {status === "idle" && <MissionBriefing onInitiate={handleInitiate} />}

      {/* Countdown overlay */}
      {status === "countdown" && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {/* Game Over/Win overlay */}
      {(status === "won" || status === "lost") && (
        <div className="bg-midnight/80 absolute inset-0 z-50 flex flex-col items-center justify-center gap-6">
          {/* Status message */}
          {status === "won" && (
            <div className="text-terminal-green animate-pulse text-center text-2xl font-bold">
              CONNECTION ESTABLISHED
            </div>
          )}
          {status === "lost" && (
            <div className="text-center">
              <div className="text-romance-gold mb-2 text-2xl font-bold">
                GLITCH DETECTED
              </div>
              <div className="text-lg text-white/60">
                Hearts Collected: {score}
              </div>
            </div>
          )}

          {/* Retry button */}
          <button
            onClick={handleRetry}
            onTouchEnd={handleRetry}
            className={`rounded-lg px-8 py-4 text-xl font-bold transition-transform hover:scale-105 active:scale-95 ${
              status === "won"
                ? "bg-romance-gold text-midnight"
                : "text-midnight bg-white"
            }`}
            type="button"
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
