import { create } from "zustand";

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

interface AuthState {
  isAuthenticated: boolean;
  authStage: "fingerprint" | "keypad" | "complete";
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setAuthStage: (stage: "fingerprint" | "keypad" | "complete") => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  authStage: "fingerprint",
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAuthStage: (authStage) => set({ authStage }),
}));
