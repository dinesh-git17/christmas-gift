"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAudio, useGameLoop, useWindowSize } from "@/hooks";
import { AUDIO_PATHS, BASE_GAME_SPEED, SPEED_INCREMENT } from "@/lib/constants";
import { useGameStore } from "@/lib/store";

import { Countdown } from "./Countdown";
import { GameCanvas, type GameCanvasRef } from "./GameCanvas";
import { GameHUD } from "./GameHUD";
import { GameOverScreen } from "./GameOverScreen";
import { MissionBriefing } from "./MissionBriefing";
import { MissionSuccess } from "./MissionSuccess";
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

  // Countdown audio - must be played directly from user gesture
  const { play: playCountdown } = useAudio(AUDIO_PATHS.COUNTDOWN, {
    volume: 0.5,
  });

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

      // Calculate dynamic speed based on score
      const currentSpeed = BASE_GAME_SPEED + score * SPEED_INCREMENT;

      canvasRef.current?.update(deltaTime, currentSpeed);
      playerRef.current?.update(deltaTime);
      spawnerRef.current?.update(deltaTime, currentSpeed);
    },
    [isPlaying, score]
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
    playCountdown(); // Must be called directly from user gesture
    resetGame();
    canvasRef.current?.reset();
    playerRef.current?.reset();
    spawnerRef.current?.reset();
    startCountdown();
  }, [playCountdown, resetGame, startCountdown]);

  // Handle countdown complete - start the game
  const handleCountdownComplete = useCallback((): void => {
    setIsPlaying(true);
  }, [setIsPlaying]);

  // Handle retry after game over
  const handleRetry = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation();
      playCountdown(); // Must be called directly from user gesture
      resetGame();
      canvasRef.current?.reset();
      playerRef.current?.reset();
      spawnerRef.current?.reset();
      startCountdown();
    },
    [playCountdown, resetGame, startCountdown]
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

      {/* Game HUD */}
      {isPlaying && <GameHUD score={score} />}

      {/* Mission Briefing - shown when idle */}
      {status === "idle" && <MissionBriefing onInitiate={handleInitiate} />}

      {/* Countdown overlay */}
      {status === "countdown" && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {/* Mission Success Screen */}
      {status === "won" && <MissionSuccess score={score} />}

      {/* Game Over Screen */}
      {status === "lost" && (
        <GameOverScreen score={score} onReboot={handleRetry} />
      )}
    </div>
  );
}
