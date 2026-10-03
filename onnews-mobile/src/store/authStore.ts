import create from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,

  login: async (email, password) => {
    try {
      const response = await fetch('https://api.ongame.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      set({ isLoggedIn: true, user: data.user });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => set({ isLoggedIn: false, user: null }),
}));

export default useAuthStore;
