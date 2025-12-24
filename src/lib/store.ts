import { create } from "zustand";

export type GameStatus = "idle" | "countdown" | "playing" | "won" | "lost";

interface GameState {
  score: number;
  status: GameStatus;
  isPlaying: boolean;
  isMuted: boolean;
  setScore: (score: number) => void;
  incrementScore: (amount: number) => void;
  setStatus: (status: GameStatus) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  startCountdown: () => void;
  triggerGameOver: () => void;
  triggerWin: () => void;
  toggleMute: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  status: "idle",
  isPlaying: false,
  isMuted: false,
  setScore: (score) => set({ score }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  setStatus: (status) => set({ status }),
  setIsPlaying: (isPlaying) =>
    set({ isPlaying, status: isPlaying ? "playing" : "idle" }),
  startCountdown: () => set({ status: "countdown", isPlaying: false }),
  triggerGameOver: () => set({ isPlaying: false, status: "lost" }),
  triggerWin: () => set({ isPlaying: false, status: "won" }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  reset: () => set({ score: 0, isPlaying: false, status: "idle" }),
}));

export type AuthStage = "LOCKED" | "SCANNED" | "BOOTING" | "AUTHENTICATED";

interface AuthState {
  authStage: AuthStage;
  setAuthStage: (stage: AuthStage) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  authStage: "LOCKED",
  setAuthStage: (authStage) => set({ authStage }),
  resetAuth: () => set({ authStage: "LOCKED" }),
}));
