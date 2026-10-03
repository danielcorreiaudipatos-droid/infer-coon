import create from 'zustand';

interface Transaction {
  id: string;
  type: 'reward' | 'purchase' | 'withdrawal';
  amount: number;
  gameType?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  fetchBalance: () => Promise<void>;
  addReward: (amount: number, gameType: string) => Promise<void>;
  withdraw: (amount: number, bankAccount: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  loading: false,

  fetchBalance: async () => {
    set({ loading: true });
    try {
      const response = await fetch('https://api.ongame.com/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      set({ balance: data.balance, loading: false });
    } catch (error) {
      console.error('Fetch balance error:', error);
      set({ loading: false });
    }
  },

  addReward: async (amount, gameType) => {
    try {
      await fetch('https://api.ongame.com/api/wallet/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount, gameType }),
      });
      await useWalletStore.getState().fetchBalance();
    } catch (error) {
      console.error('Add reward error:', error);
    }
  },

  withdraw: async (amount, bankAccount) => {
    try {
      await fetch('https://api.ongame.com/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount, bankAccount }),
      });
      await useWalletStore.getState().fetchBalance();
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  },

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const response = await fetch('https://api.ongame.com/api/wallet/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      set({ transactions: data.transactions, loading: false });
    } catch (error) {
      console.error('Fetch transactions error:', error);
      set({ loading: false });
    }
  },
}));

export default useWalletStore;
