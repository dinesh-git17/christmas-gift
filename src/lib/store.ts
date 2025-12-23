import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  score: number;
  isPlaying: boolean;
  isMuted: boolean;
  setScore: (score: number) => void;
  incrementScore: (amount: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  toggleMute: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  isPlaying: false,
  isMuted: false,
  setScore: (score) => set({ score }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  reset: () => set({ score: 0, isPlaying: false }),
}));

export type AuthStage = "LOCKED" | "SCANNED" | "BOOTING" | "AUTHENTICATED";

interface AuthState {
  authStage: AuthStage;
  setAuthStage: (stage: AuthStage) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authStage: "LOCKED",
      setAuthStage: (authStage) => set({ authStage }),
      resetAuth: () => set({ authStage: "LOCKED" }),
    }),
    {
      name: "north-pole-auth",
    }
  )
);
