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
  RUN_FRAME_COUNT,
  RUN_FRAME_DURATION_MS,
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
  crash: () => void;
  getPosition: () => { x: number; y: number };
  getHitbox: () => Hitbox;
  isGrounded: () => boolean;
}

type PlayerState = "running" | "jumping" | "crashed";

export const Player = forwardRef<PlayerRef, PlayerProps>(function Player(
  { containerHeight, containerWidth, onJump },
  ref
) {
  const playerRef = useRef<HTMLDivElement>(null);
  const runFramesRefs = useRef<(HTMLImageElement | null)[]>([]);
  const jumpSpriteRef = useRef<HTMLImageElement>(null);
  const hitSpriteRef = useRef<HTMLImageElement>(null);

  // Frame animation state (refs to avoid re-renders)
  const currentFrameRef = useRef(0);
  const frameTimerRef = useRef(0);

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
  const updateSprite = useCallback(
    (state: PlayerState, frameIndex?: number): void => {
      if (!jumpSpriteRef.current || !hitSpriteRef.current) {
        return;
      }

      // Hide jump and hit sprites first
      jumpSpriteRef.current.style.visibility = "hidden";
      hitSpriteRef.current.style.visibility = "hidden";

      // Hide all run frames
      runFramesRefs.current.forEach((frame) => {
        if (frame) {
          frame.style.visibility = "hidden";
        }
      });

      // Show the appropriate sprite
      if (state === "crashed") {
        hitSpriteRef.current.style.visibility = "visible";
      } else if (state === "jumping") {
        jumpSpriteRef.current.style.visibility = "visible";
      } else {
        // Show the current run frame
        const index = frameIndex ?? currentFrameRef.current;
        const currentFrame = runFramesRefs.current[index];
        if (currentFrame) {
          currentFrame.style.visibility = "visible";
        }
      }
    },
    []
  );

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
          currentFrameRef.current = 0;
          frameTimerRef.current = 0;
          updateSprite("running", 0);
        }
      }

      // Frame animation logic (only when running)
      if (stateRef.current === "running") {
        // deltaTime is in seconds, accumulate in milliseconds
        frameTimerRef.current += deltaTime * 1000;

        if (frameTimerRef.current >= RUN_FRAME_DURATION_MS) {
          frameTimerRef.current = 0;
          currentFrameRef.current =
            (currentFrameRef.current + 1) % RUN_FRAME_COUNT;
          updateSprite("running", currentFrameRef.current);
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
    currentFrameRef.current = 0;
    frameTimerRef.current = 0;
    updateSprite("running", 0);

    if (playerRef.current) {
      playerRef.current.style.transform = `translate3d(0, ${floorYRef.current}px, 0)`;
    }
  }, [updateSprite, playerX]);

  // Crash animation when hitting a glitch
  const crash = useCallback((): void => {
    stateRef.current = "crashed";
    updateSprite("crashed");

    // Apply a small shake animation
    if (playerRef.current) {
      playerRef.current.animate(
        [
          { transform: `translate3d(-4px, ${positionRef.current.y}px, 0)` },
          { transform: `translate3d(4px, ${positionRef.current.y}px, 0)` },
          { transform: `translate3d(-4px, ${positionRef.current.y}px, 0)` },
          { transform: `translate3d(4px, ${positionRef.current.y}px, 0)` },
          { transform: `translate3d(0, ${positionRef.current.y}px, 0)` },
        ],
        {
          duration: 300,
          easing: "ease-out",
        }
      );
    }
  }, [updateSprite]);

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
    crash,
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
      {/* All 4 run frames preloaded, stacked on top of each other */}
      {/* Switch via CSS visibility for zero-lag animation */}
      {GAME_ASSETS.CAROLINA_RUN_FRAMES.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance
        <img
          key={src}
          ref={(el) => {
            runFramesRefs.current[index] = el;
          }}
          src={src}
          alt={`Carolina running frame ${index + 1}`}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ visibility: index === 0 ? "visible" : "hidden" }}
          draggable={false}
        />
      ))}
      {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance */}
      <img
        ref={jumpSpriteRef}
        src={GAME_ASSETS.CAROLINA_JUMP}
        alt="Carolina jumping"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ visibility: "hidden", transform: "scaleX(-1)" }}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance */}
      <img
        ref={hitSpriteRef}
        src={GAME_ASSETS.CAROLINA_HIT}
        alt="Carolina hit"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ visibility: "hidden" }}
        draggable={false}
      />
    </div>
  );
});
