// Auth constants
export const AUTH_PASSCODE = "1701";
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
} as const;
