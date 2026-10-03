import create from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,
  loading: true,

  login: async (email, password) => {
    try {
      const response = await fetch('https://api.ongame.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      await SecureStore.setItemAsync('token', data.token);
      set({
        isLoggedIn: true,
        user: data.user,
        token: data.token,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (email, password, name) => {
    try {
      const response = await fetch('https://api.ongame.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      await SecureStore.setItemAsync('token', data.token);
      set({
        isLoggedIn: true,
        user: data.user,
        token: data.token,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      set({
        isLoggedIn: false,
        user: null,
        token: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const response = await fetch('https://api.ongame.com/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        set({
          isLoggedIn: true,
          user: data.user,
          token,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Restore token error:', error);
      set({ loading: false });
    }
  },
}));

export default useAuthStore;
