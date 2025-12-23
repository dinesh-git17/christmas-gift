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
export const BOOT_COMPLETE_DELAY_MS = 1500; // Delay after all messages typed before redirect

// Audio paths
export const AUDIO_PATHS = {
  SCAN_HOLOGRAM: "/assets/audio/scan_hologram.mp3",
  SUCCESS_UNLOCK: "/assets/audio/success_unlock.mp3",
  ERROR_HIT: "/assets/audio/error_hit.mp3",
  JUMP: "/assets/audio/jump.mp3",
  COLLECT: "/assets/audio/collect.mp3",
  LOFI_CHRISTMAS: "/assets/audio/lofi_christmas.mp3",
} as const;

// Game physics constants
export const GRAVITY = 0.8;
export const JUMP_FORCE = -15;
export const GAME_SPEED = 5;

// Player constants
export const PLAYER_WIDTH = 100;
export const PLAYER_HEIGHT = 100;
export const PLAYER_X_POSITION = 80;

// Floor position (percentage from top)
export const FLOOR_Y_PERCENT = 0.75;

// Parallax layer speeds (0-1, where 1 = game speed)
export const PARALLAX_SPEEDS = {
  SKY: 0.1,
  MID: 0.5,
  GROUND: 1,
} as const;

// Asset paths
export const GAME_ASSETS = {
  SKY_BG: "/assets/game/sky_bg.png",
  SKY_MID: "/assets/game/sky_mid_layer.png",
  GROUND: "/assets/game/ground_tile.png",
  CAROLINA_RUN: "/assets/characters/carolina_run.png",
  CAROLINA_JUMP: "/assets/characters/carolina_jump.png",
  CAROLINA_HIT: "/assets/characters/carolina_hit.png",
} as const;
