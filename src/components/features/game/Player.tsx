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
  HITBOX_PADDING,
  JUMP_FORCE,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_X_PERCENT,
} from "@/lib/constants";

export interface Hitbox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface PlayerProps {
  containerHeight: number;
  containerWidth: number;
  onJump?: () => void;
}

export interface PlayerRef {
  update: (deltaTime: number) => void;
  jump: () => void;
  reset: () => void;
  getPosition: () => { x: number; y: number };
  getHitbox: () => Hitbox;
  isGrounded: () => boolean;
}

type PlayerState = "running" | "jumping";

export const Player = forwardRef<PlayerRef, PlayerProps>(function Player(
  { containerHeight, containerWidth, onJump },
  ref
) {
  const playerRef = useRef<HTMLDivElement>(null);
  const runSpriteRef = useRef<HTMLImageElement>(null);
  const jumpSpriteRef = useRef<HTMLImageElement>(null);

  // Calculate X position as percentage of container width (positioned on right, facing left)
  const playerX = Math.floor(containerWidth * PLAYER_X_PERCENT);

  // Physics state stored in refs to avoid re-renders
  const positionRef = useRef({ x: playerX, y: 0 });
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

  // Switch sprites using CSS visibility (no image decode lag)
  const updateSprite = useCallback((state: PlayerState): void => {
    if (!runSpriteRef.current || !jumpSpriteRef.current) {
      return;
    }

    if (state === "jumping") {
      runSpriteRef.current.style.visibility = "hidden";
      jumpSpriteRef.current.style.visibility = "visible";
    } else {
      runSpriteRef.current.style.visibility = "visible";
      jumpSpriteRef.current.style.visibility = "hidden";
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

      // Apply transform directly to DOM (translate3d for GPU acceleration on Safari)
      playerRef.current.style.transform = `translate3d(0, ${positionRef.current.y}px, 0)`;
    },
    [updateSprite]
  );

  const reset = useCallback((): void => {
    positionRef.current = { x: playerX, y: floorYRef.current };
    velocityRef.current = { x: 0, y: 0 };
    isGroundedRef.current = true;
    stateRef.current = "running";
    updateSprite("running");

    if (playerRef.current) {
      playerRef.current.style.transform = `translate3d(0, ${floorYRef.current}px, 0)`;
    }
  }, [updateSprite, playerX]);

  // Calculate hitbox with padding for fair collisions
  const getHitbox = useCallback((): Hitbox => {
    const paddingX = PLAYER_WIDTH * HITBOX_PADDING;
    const paddingY = PLAYER_HEIGHT * HITBOX_PADDING;

    return {
      left: playerX + paddingX,
      right: playerX + PLAYER_WIDTH - paddingX,
      top: positionRef.current.y + paddingY,
      bottom: positionRef.current.y + PLAYER_HEIGHT - paddingY,
    };
  }, [playerX]);

  useImperativeHandle(ref, () => ({
    update,
    jump,
    reset,
    getPosition: () => ({ ...positionRef.current }),
    getHitbox,
    isGrounded: () => isGroundedRef.current,
  }));

  // Set initial position
  useEffect(() => {
    if (playerRef.current && floorYRef.current > 0) {
      positionRef.current.y = floorYRef.current;
      playerRef.current.style.transform = `translate3d(0, ${floorYRef.current}px, 0)`;
    }
  }, []);

  return (
    <div
      ref={playerRef}
      className="absolute z-10"
      style={{
        left: playerX,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        // GPU acceleration for smooth animations on Safari
        transform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      {/* Both sprites preloaded, switch via CSS visibility for zero-lag */}
      {/* Flipped with scaleX(-1) to face left */}
      {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance */}
      <img
        ref={runSpriteRef}
        src={GAME_ASSETS.CAROLINA_RUN}
        alt="Carolina running"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ transform: "scaleX(-1)" }}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance */}
      <img
        ref={jumpSpriteRef}
        src={GAME_ASSETS.CAROLINA_JUMP}
        alt="Carolina jumping"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ visibility: "hidden", transform: "scaleX(-1)" }}
        draggable={false}
      />
    </div>
  );
});
