import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  walletBalance: number;
  totalPoints: number;
}

interface AuthStore {
  user: User | null;
  userToken: string | null;
  setUser: (user: User | null) => void;
  setUserToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
  updateWalletBalance: (amount: number) => void;
  updateTotalPoints: (points: number) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userToken: null,

  setUser: (user) => set({ user }),

  setUserToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync('userToken', token);
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    set({ userToken: token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, userToken: null });
  },

  updateWalletBalance: (amount) =>
    set((state) => ({
      user: state.user ? { ...state.user, walletBalance: amount } : null
    })),

  updateTotalPoints: (points) =>
    set((state) => ({
      user: state.user ? { ...state.user, totalPoints: points } : null
    }))
}));

interface GameStore {
  currentGameSession: {
    gameType: 'onzap' | 'onlove' | 'onmail';
    sessionId: string;
    score: number;
    reward: number;
  } | null;
  setGameSession: (session: any) => void;
  clearGameSession: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentGameSession: null,

  setGameSession: (session) => set({ currentGameSession: session }),

  clearGameSession: () => set({ currentGameSession: null })
}));
