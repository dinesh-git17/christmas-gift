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
  LOVE_STORY: "/assets/audio/love_story.mp3",
  DECRYPT: "/assets/audio/decrypt.mp3",
  CARD_WIN: "/assets/audio/card_win.mp3",
  SUCCESS: "/assets/audio/sucess.mp3",
  ERROR: "/assets/audio/error.mp3",
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

// Letter content - the final message to Carolina
export const FINAL_LETTER_CONTENT = [
  "Hey you.",
  "I know the distance adds a few extra hops between us and the miles between us feel like a high-latency server.",
  "But no amount of packet loss could ever interrupt how much I miss you.",
  "You're still my favorite co-op partner, my Player One, every save file, every run.",
  "Merry Christmas, my beautiful baby.",
] as const;

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

// Room scene assets (preloaded from game page for smooth transition)
export const ROOM_ASSETS = {
  FURNISHED_ROOM: "/assets/room/room_furnished.png",
  DINN: "/assets/room/iso_dinn.png",
  CAROLINA: "/assets/room/iso_carolina.png",
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

// Memory Match game types and constants
export type MemoryCardType = "santa" | "reindeer" | "lights" | "elf" | "gold";

export interface MemoryCard {
  id: string;
  type: MemoryCardType;
  isFlipped: boolean;
  isMatched: boolean;
  isCenter: boolean;
}

export const MEMORY_GAME_ASSETS = {
  CARD_BACK: "/assets/game/card_back.png",
  CARD_SANTA: "/assets/game/card_santa.png",
  CARD_REINDEER: "/assets/game/card_reindeer.png",
  CARD_LIGHTS: "/assets/game/card_lights.png",
  CARD_ELF: "/assets/game/card_elf.png",
  CARD_GOLD: "/assets/game/card_gold.png",
} as const;

export const MEMORY_CARD_IMAGES: Record<MemoryCardType, string> = {
  santa: MEMORY_GAME_ASSETS.CARD_SANTA,
  reindeer: MEMORY_GAME_ASSETS.CARD_REINDEER,
  lights: MEMORY_GAME_ASSETS.CARD_LIGHTS,
  elf: MEMORY_GAME_ASSETS.CARD_ELF,
  gold: MEMORY_GAME_ASSETS.CARD_GOLD,
} as const;

export const MEMORY_GAME_TIMING = {
  FLIP_DURATION: 500, // Card flip animation duration (ms)
  MISMATCH_DELAY: 1000, // Time before flipping back mismatched cards (ms)
  MATCH_DELAY: 300, // Delay after match before allowing next flip (ms)
  UNLOCK_DELAY: 1000, // Delay before center card unlocks after final match (ms)
  WIN_CONFETTI_DELAY: 500, // Delay before confetti after gold reveal (ms)
  SCALE_UP_DURATION: 800, // Duration for gold card scale up animation (ms)
  COUNTDOWN_START_DELAY: 2000, // Delay after scale up before countdown starts (ms)
} as const;

export const MEMORY_GAME_PAIRS: MemoryCardType[] = [
  "santa",
  "reindeer",
  "lights",
  "elf",
] as const;

export const MEMORY_WIN_MESSAGE = "Happy Holidays!" as const;

// Intel page constants - Phase 7 Final Reveal
export const INTEL_BRIEFING = {
  HEADER: "CRITICAL INTELLIGENCE GATHERED",
  BODY: `INTERCEPT REPORT: A high-density encrypted signal has been detected from a remote timeline.

Our cryptography agents have worked tirelessly to decrypt this payload. It contains vital data regarding Subject: Dinn.

WARNING: Content exhibits extreme emotional resonance. Proceed with urgency. The integrity of the connection depends on you.`,
  CTA: "INITIATE DECRYPTION PROTOCOL",
} as const;

export const INTEL_BOOT_SEQUENCE = [
  "booting connection...",
  "syncing hearts...",
  "latency: irrelevant",
  "status: locked on you",
] as const;

export const INTEL_BOOT_TIMING = {
  DECRYPT_DURATION_MS: 2500, // Time to decrypt each line
  FINAL_HOLD_MS: 1500, // Hold final line before transitioning
  DECRYPT_INTERVAL_MS: 50, // How often to update scrambled characters
} as const;

export const INTEL_LETTER = `hey carolina,

if you're reading this, it means you found the hidden level.
not bad, my favorite player.

i wish i could say this is just code,
but the truth is...
every line here runs straight from my heart.

distance tried to introduce lag,
different time zones tried to desync us,
but somehow we keep reconnecting stronger every time.
no crashes. no rage quits.
just us, loading again and again.

you're my favorite constant
in a world full of variables.
the one thing i never want to refactor.

loving you feels like finding the perfect build
after a thousand test runs.
calm. exciting. safe.
like i finally unlocked the right ending.

when things get quiet,
when the screen goes dark,
you're still there in my mind,
glowing like a cursor waiting for the next command.

i don't know what levels come next,
but i know this:
i want to play them all with you.
side by side. co-op mode. forever enabled.

no save file needed.
no resets.
just me, choosing you
again
and again
and again.

connection secured.
game not over.

i love you endlessly` as const;

export const INTEL_LETTER_TIMING = {
  CHAR_DELAY_MS: 70, // Typewriter speed for letter (slowed to 0.5x)
  GLOW_DURATION_MS: 600, // Duration for the glow effect
  FADE_OUT_DURATION_MS: 800, // Duration for decryption lines to fade out
  DARK_PAUSE_MS: 1500, // Empty screen pause before music starts
  MUSIC_LEAD_IN_MS: 1500, // Wait after music starts before letter begins
} as const;
