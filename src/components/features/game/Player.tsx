"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { useAudio } from "@/hooks/use-audio";
import {
  AUDIO_PATHS,
  FLOOR_Y_PERCENT,
  GAME_ASSETS,
  GRAVITY,
  JUMP_FORCE,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_X_POSITION,
} from "@/lib/constants";

export interface PlayerProps {
  containerHeight: number;
  onJump?: () => void;
}

export interface PlayerRef {
  update: (deltaTime: number) => void;
  jump: () => void;
  reset: () => void;
  getPosition: () => { x: number; y: number };
  isGrounded: () => boolean;
}

type PlayerState = "running" | "jumping";

export const Player = forwardRef<PlayerRef, PlayerProps>(function Player(
  { containerHeight, onJump },
  ref
) {
  const playerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Physics state stored in refs to avoid re-renders
  const positionRef = useRef({ x: PLAYER_X_POSITION, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const isGroundedRef = useRef(true);
  const stateRef = useRef<PlayerState>("running");

  // Calculate floor Y position based on container height
  const floorYRef = useRef(0);

  // Audio
  const { play: playJump, preload: preloadJump } = useAudio(AUDIO_PATHS.JUMP);

  // Preload jump sound on mount
  useEffect(() => {
    preloadJump();
  }, [preloadJump]);

  // Update floor position when container height changes
  useEffect(() => {
    floorYRef.current = containerHeight * FLOOR_Y_PERCENT - PLAYER_HEIGHT;
    // Initialize player at floor level
    if (
      positionRef.current.y === 0 ||
      positionRef.current.y > floorYRef.current
    ) {
      positionRef.current.y = floorYRef.current;
    }
  }, [containerHeight]);

  const updateSprite = useCallback((state: PlayerState): void => {
    if (!imageRef.current) {
      return;
    }

    const newSrc =
      state === "jumping"
        ? GAME_ASSETS.CAROLINA_JUMP
        : GAME_ASSETS.CAROLINA_RUN;

    if (imageRef.current.src !== newSrc) {
      imageRef.current.src = newSrc;
    }
  }, []);

  const jump = useCallback((): void => {
    if (isGroundedRef.current) {
      velocityRef.current.y = JUMP_FORCE;
      isGroundedRef.current = false;
      stateRef.current = "jumping";
      updateSprite("jumping");
      playJump();
      onJump?.();
    }
  }, [playJump, updateSprite, onJump]);

  const update = useCallback(
    (deltaTime: number): void => {
      if (!playerRef.current) {
        return;
      }

      // Apply gravity (scale by delta time, 60fps baseline)
      const gravityScale = deltaTime * 60;
      velocityRef.current.y += GRAVITY * gravityScale;

      // Update position
      positionRef.current.y += velocityRef.current.y * gravityScale;

      // Floor collision
      if (positionRef.current.y >= floorYRef.current) {
        positionRef.current.y = floorYRef.current;
        velocityRef.current.y = 0;

        if (!isGroundedRef.current) {
          isGroundedRef.current = true;
          stateRef.current = "running";
          updateSprite("running");
        }
      }

      // Apply transform directly to DOM
      playerRef.current.style.transform = `translateY(${positionRef.current.y}px)`;
    },
    [updateSprite]
  );

  const reset = useCallback((): void => {
    positionRef.current = { x: PLAYER_X_POSITION, y: floorYRef.current };
    velocityRef.current = { x: 0, y: 0 };
    isGroundedRef.current = true;
    stateRef.current = "running";
    updateSprite("running");

    if (playerRef.current) {
      playerRef.current.style.transform = `translateY(${floorYRef.current}px)`;
    }
  }, [updateSprite]);

  useImperativeHandle(ref, () => ({
    update,
    jump,
    reset,
    getPosition: () => ({ ...positionRef.current }),
    isGrounded: () => isGroundedRef.current,
  }));

  // Set initial position
  useEffect(() => {
    if (playerRef.current && floorYRef.current > 0) {
      positionRef.current.y = floorYRef.current;
      playerRef.current.style.transform = `translateY(${floorYRef.current}px)`;
    }
  }, []);

  return (
    <div
      ref={playerRef}
      className="absolute will-change-transform"
      style={{
        left: PLAYER_X_POSITION,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance */}
      <img
        ref={imageRef}
        src={GAME_ASSETS.CAROLINA_RUN}
        alt="Carolina"
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
});
