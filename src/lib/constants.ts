// Auth constants
export const AUTH_PASSCODE = "1704";
export const SCAN_DURATION_MS = 2000;
export const HAPTIC_DURATION_MS = 200;
export const SUCCESS_AUDIO_DELAY_MS = 1500; // Let success audio play before transitioning

// Boot sequence messages
export const BOOT_SEQUENCE_MESSAGES = [
  "> ESTABLISHING SECURE CONNECTION...",
  "> LOCATING SUBJECT: CAROLINA...",
  "> TARGET ACQUIRED.",
] as const;

export const TYPEWRITER_CHAR_DELAY_MS = 50;
export const BOOT_MESSAGE_DELAY_MS = 800;
export const BOOT_COMPLETE_DELAY_MS = 1500; // Delay after all messages typed before transition
export const BOOT_FADE_DURATION_MS = 1000; // Duration of boot sequence fade out

// Audio paths
export const AUDIO_PATHS = {
  SCAN_HOLOGRAM: "/assets/audio/scan_hologram.mp3",
  SUCCESS_UNLOCK: "/assets/audio/success_unlock.mp3",
  ERROR_HIT: "/assets/audio/error_hit.mp3",
  JUMP: "/assets/audio/jump.mp3",
  COLLECT: "/assets/audio/collect.mp3",
  LOFI_CHRISTMAS: "/assets/audio/lofi_christmas.mp3",
  COUNTDOWN: "/assets/audio/countdown.mp3",
} as const;

// Game physics constants
export const GRAVITY = 0.8;
export const JUMP_FORCE = -15;

// Dynamic speed constants
export const BASE_GAME_SPEED = 5;
export const SPEED_INCREMENT = 0.15; // Speed increases by 0.15 per collected heart

// Player constants
export const PLAYER_WIDTH = 100;
export const PLAYER_HEIGHT = 100;
// X position as percentage from left (player on left side, facing right)
export const PLAYER_X_PERCENT = 0.12;
// Breakpoint for mobile detection (matches Tailwind's sm)
export const MOBILE_BREAKPOINT = 640;

// Floor position (percentage from top) - aligns with snow/ice edge in ground layer
export const FLOOR_Y_PERCENT = 0.68;

// Parallax layer speeds (0-1, where 1 = game speed)
export const PARALLAX_SPEEDS = {
  SKY: 0.1,
  MID: 0.5,
  GROUND: 1,
} as const;

// Entity spawner constants
export const ENTITY_WIDTH = 64;
export const ENTITY_HEIGHT = 64;
export const HITBOX_PADDING = 0.2; // 20% smaller hitbox for "fair" collisions

// Progressive spawner constants
export const SPAWN_INTERVAL_BASE = 2000; // Base spawn interval (ms)
export const SPAWN_INTERVAL_MIN = 800; // Minimum spawn interval cap (ms)
export const SPAWN_INTERVAL_REDUCTION = 50; // Reduce interval by 50ms per score

// Progressive glitch ratio thresholds
export const GLITCH_RATIO_LEVEL_1 = 0.3; // 0-9 hearts: 30% glitches
export const GLITCH_RATIO_LEVEL_2 = 0.5; // 10-19 hearts: 50% glitches
export const GLITCH_RATIO_LEVEL_3 = 0.7; // 20+ hearts: 70% glitches (panic mode)
export const GLITCH_TIER_1_THRESHOLD = 10;
export const GLITCH_TIER_2_THRESHOLD = 20;

// Win condition
export const WIN_SCORE = 25;

// Countdown constants
export const COUNTDOWN_STEPS = ["3", "2", "1", "LINK!"] as const;
export const COUNTDOWN_INTERVAL_MS = 750; // Duration for each countdown step (4 steps = 3s to match audio)

// Run animation constants
export const RUN_FRAME_DURATION_MS = 100;
export const RUN_FRAME_COUNT = 4;

// Asset paths
// Room scene script - narrative text synchronized with animation steps
export const ROOM_SCRIPT = [
  { id: 0, text: "The signal led me straight to you." },
  { id: 1, text: "There you are..." },
  { id: 2, text: "" }, // Silent during walk
  { id: 3, text: "One day, we will be together just like this for Christmas." },
  { id: 4, text: "Touch Dinn for a surprise..." },
] as const;

// Room scene timing constants (seconds)
export const ROOM_TIMING = {
  FADE_IN_DURATION: 1.5,
  MUSIC_VOLUME: 0.4,
  STEP_0_DURATION: 2, // Initial text display
  STEP_1_DURATION: 1.5, // Carolina appears
  STEP_2_DURATION: 2.5, // Walking (silent)
  STEP_3_DELAY: 0.5, // Delay before final text
  SNOW_FADE_DURATION: 2,
  LETTER_HINT_DELAY: 5, // Show hint after this many seconds
} as const;

export const GAME_ASSETS = {
  SKY_BG: "/assets/game/sky_bg.png",
  SKY_MID: "/assets/game/sky_mid_layer.png",
  GROUND: "/assets/game/ground_tile.png",
  CAROLINA_RUN: "/assets/characters/carolina_run.png",
  CAROLINA_RUN_FRAMES: [
    "/assets/characters/carolina_run_1.png",
    "/assets/characters/carolina_run_2.png",
    "/assets/characters/carolina_run_3.png",
    "/assets/characters/carolina_run_4.png",
  ] as const,
  CAROLINA_JUMP: "/assets/characters/carolina_jump.png",
  CAROLINA_HIT: "/assets/characters/carolina_hit.png",
  TOKEN_HEART: "/assets/game/token_heart.png",
  OBSTACLE_GLITCH: "/assets/game/obstacle_glitch.png",
} as const;
