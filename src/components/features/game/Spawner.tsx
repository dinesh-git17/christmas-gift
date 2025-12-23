"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { useAudio } from "@/hooks/use-audio";
import {
  AUDIO_PATHS,
  ENTITY_HEIGHT,
  ENTITY_WIDTH,
  FLOOR_Y_PERCENT,
  GAME_ASSETS,
  GLITCH_RATIO_LEVEL_1,
  GLITCH_RATIO_LEVEL_2,
  GLITCH_RATIO_LEVEL_3,
  GLITCH_TIER_1_THRESHOLD,
  GLITCH_TIER_2_THRESHOLD,
  GRAVITY,
  HITBOX_PADDING,
  JUMP_FORCE,
  PLAYER_HEIGHT,
  SPAWN_INTERVAL_BASE,
  SPAWN_INTERVAL_MIN,
  SPAWN_INTERVAL_REDUCTION,
  WIN_SCORE,
} from "@/lib/constants";
import { useGameStore } from "@/lib/store";

import type { Hitbox } from "./Player";

export type EntityType = "heart" | "glitch";

interface Entity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  collected: boolean;
}

export interface SpawnerProps {
  containerWidth: number;
  containerHeight: number;
  getPlayerHitbox: () => Hitbox;
  onCrash?: () => void;
}

export interface SpawnerRef {
  update: (deltaTime: number, currentSpeed: number) => void;
  reset: () => void;
}

// AABB collision detection
function isColliding(rect1: Hitbox, rect2: Hitbox): boolean {
  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}

// Get entity hitbox with padding for fair collisions
function getEntityHitbox(entity: Entity): Hitbox {
  const paddingX = ENTITY_WIDTH * HITBOX_PADDING;
  const paddingY = ENTITY_HEIGHT * HITBOX_PADDING;

  return {
    left: entity.x + paddingX,
    right: entity.x + ENTITY_WIDTH - paddingX,
    top: entity.y + paddingY,
    bottom: entity.y + ENTITY_HEIGHT - paddingY,
  };
}

// Calculate spawn interval based on score (gets faster as score increases)
function getSpawnInterval(score: number): number {
  const interval = SPAWN_INTERVAL_BASE - score * SPAWN_INTERVAL_REDUCTION;
  return Math.max(SPAWN_INTERVAL_MIN, interval);
}

// Get glitch spawn probability based on score tier
function getGlitchProbability(score: number): number {
  if (score >= GLITCH_TIER_2_THRESHOLD) {
    return GLITCH_RATIO_LEVEL_3; // 70% glitches (panic mode!)
  }
  if (score >= GLITCH_TIER_1_THRESHOLD) {
    return GLITCH_RATIO_LEVEL_2; // 50% glitches
  }
  return GLITCH_RATIO_LEVEL_1; // 30% glitches
}

// Delay before showing game over to let crash animation play
const CRASH_ANIMATION_DELAY_MS = 500;

export const Spawner = forwardRef<SpawnerRef, SpawnerProps>(function Spawner(
  { containerWidth, containerHeight, getPlayerHitbox, onCrash },
  ref
) {
  // Entity list - use state for rendering, refs for positions
  const [entities, setEntities] = useState<Entity[]>([]);
  const entityPositionsRef = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );
  const entityRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const nextIdRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const spawnIntervalRef = useRef(getSpawnInterval(0));

  // Audio
  const { play: playCollect, preload: preloadCollect } = useAudio(
    AUDIO_PATHS.COLLECT
  );
  const { play: playError, preload: preloadError } = useAudio(
    AUDIO_PATHS.ERROR_HIT
  );

  // Game store
  const { score, incrementScore, triggerGameOver, triggerWin } = useGameStore();

  // Calculate floor Y for ground entities
  const floorY = containerHeight * FLOOR_Y_PERCENT - ENTITY_HEIGHT;

  // Preload audio on mount
  useEffect(() => {
    preloadCollect();
    preloadError();
  }, [preloadCollect, preloadError]);

  // Calculate max jump height based on physics
  // Peak height = v0² / (2 * gravity) where v0 = JUMP_FORCE (negative = upward)
  const maxJumpHeight = (JUMP_FORCE * JUMP_FORCE) / (2 * GRAVITY);

  // Player floor position (top of sprite when grounded)
  const playerFloorY = containerHeight * FLOOR_Y_PERCENT - PLAYER_HEIGHT;

  // Spawn a new entity with progressive difficulty
  const spawnEntity = useCallback((): void => {
    // Glitch probability increases with score
    const glitchProbability = getGlitchProbability(score);
    const isGlitch = Math.random() < glitchProbability;
    const type: EntityType = isGlitch ? "glitch" : "heart";

    // Hearts float at varied heights, glitches are on ground
    let y: number;
    if (!isGlitch) {
      // Hearts spawn within reachable jump range
      // Min Y = peak jump height (with 20px margin for collision)
      // Max Y = just above ground level (easy pickup)
      const peakY = playerFloorY - maxJumpHeight + 20;
      const groundY = floorY - ENTITY_HEIGHT / 2;
      y = peakY + Math.random() * (groundY - peakY);
    } else {
      // Glitches sit on the ground
      y = floorY;
    }

    const newEntity: Entity = {
      id: nextIdRef.current++,
      type,
      x: containerWidth + ENTITY_WIDTH, // Spawn just off-screen right
      y,
      collected: false,
    };

    // Store position in ref for frame-by-frame updates
    entityPositionsRef.current.set(newEntity.id, {
      x: newEntity.x,
      y: newEntity.y,
    });

    setEntities((prev) => [...prev, newEntity]);
  }, [containerWidth, floorY, maxJumpHeight, playerFloorY, score]);

  // Update method called by game loop
  const update = useCallback(
    (deltaTime: number, currentSpeed: number): void => {
      // Don't update if game is won
      if (score >= WIN_SCORE) {
        return;
      }

      const now = performance.now();

      // Check spawn timer with progressive interval
      if (now - lastSpawnTimeRef.current >= spawnIntervalRef.current) {
        spawnEntity();
        lastSpawnTimeRef.current = now;
        spawnIntervalRef.current = getSpawnInterval(score);
      }

      // Update entity positions and check collisions
      const playerHitbox = getPlayerHitbox();
      const entitiesToRemove: number[] = [];
      const collectedHearts: number[] = [];
      let hitGlitchId: number | null = null;

      entityPositionsRef.current.forEach((pos, id) => {
        // Move entity left at current dynamic speed
        const gravityScale = deltaTime * 60;
        pos.x -= currentSpeed * gravityScale;

        // Update DOM directly for smooth movement
        const entityEl = entityRefsMap.current.get(id);
        if (entityEl) {
          entityEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }

        // Check if off-screen (left side)
        if (pos.x < -ENTITY_WIDTH * 2) {
          entitiesToRemove.push(id);
          return;
        }

        // Check collision with player
        const entityHitbox = getEntityHitbox({
          id,
          type: "heart",
          x: pos.x,
          y: pos.y,
          collected: false,
        });

        if (isColliding(playerHitbox, entityHitbox)) {
          // Find entity type from state
          const entity = entities.find((e) => e.id === id);
          if (entity && !entity.collected) {
            if (entity.type === "heart") {
              collectedHearts.push(id);
            } else {
              hitGlitchId = id;
            }
          }
        }
      });

      // Handle collected hearts
      if (collectedHearts.length > 0) {
        playCollect();
        collectedHearts.forEach((id) => {
          const entityEl = entityRefsMap.current.get(id);
          if (entityEl) {
            entityEl.style.visibility = "hidden";
          }
        });

        setEntities((prev) =>
          prev.map((e) =>
            collectedHearts.includes(e.id) ? { ...e, collected: true } : e
          )
        );

        incrementScore(collectedHearts.length);

        // Check win condition
        if (score + collectedHearts.length >= WIN_SCORE) {
          triggerWin();
          return;
        }
      }

      // Handle glitch hit (game over with crash animation delay)
      if (hitGlitchId !== null) {
        // Hide the glitch that was hit
        const glitchEl = entityRefsMap.current.get(hitGlitchId);
        if (glitchEl) {
          glitchEl.style.visibility = "hidden";
        }

        playError();
        onCrash?.();
        // Delay game over to let crash animation play
        setTimeout(() => {
          triggerGameOver();
        }, CRASH_ANIMATION_DELAY_MS);
        return;
      }

      // Cleanup off-screen entities
      if (entitiesToRemove.length > 0) {
        entitiesToRemove.forEach((id) => {
          entityPositionsRef.current.delete(id);
          entityRefsMap.current.delete(id);
        });

        setEntities((prev) =>
          prev.filter((e) => !entitiesToRemove.includes(e.id))
        );
      }
    },
    [
      entities,
      getPlayerHitbox,
      incrementScore,
      onCrash,
      playCollect,
      playError,
      score,
      spawnEntity,
      triggerGameOver,
      triggerWin,
    ]
  );

  // Reset spawner state
  const reset = useCallback((): void => {
    setEntities([]);
    entityPositionsRef.current.clear();
    entityRefsMap.current.clear();
    nextIdRef.current = 0;
    lastSpawnTimeRef.current = performance.now();
    spawnIntervalRef.current = getSpawnInterval(0);
  }, []);

  useImperativeHandle(ref, () => ({
    update,
    reset,
  }));

  // Register entity refs for DOM manipulation
  const setEntityRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      if (el) {
        entityRefsMap.current.set(id, el);
      }
    },
    []
  );

  return (
    <>
      {entities.map((entity) => (
        <div
          key={entity.id}
          ref={setEntityRef(entity.id)}
          className="absolute z-20"
          style={{
            width: ENTITY_WIDTH,
            height: ENTITY_HEIGHT,
            left: 0,
            top: 0,
            transform: `translate3d(${entity.x}px, ${entity.y}px, 0)`,
            backfaceVisibility: "hidden",
            willChange: "transform",
            visibility: entity.collected ? "hidden" : "visible",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Game sprite requires direct img for performance */}
          <img
            src={
              entity.type === "heart"
                ? GAME_ASSETS.TOKEN_HEART
                : GAME_ASSETS.OBSTACLE_GLITCH
            }
            alt={entity.type === "heart" ? "Heart token" : "Glitch obstacle"}
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
      ))}
    </>
  );
});
