import { create } from 'zustand';
import { WalletState, getWalletState, disconnectWallet } from '../utils/wallet';

interface WalletStore extends WalletState {
  setWalletState: (state: Partial<WalletState>) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
  updateBalance: () => Promise<void>;
}

const STORAGE_KEY = 'wallet_connected';

export const useWalletStore = create<WalletStore>((set: any) => ({
  account: null,
  balance: '0',
  contract: null,
  provider: null,
  tokenAdded: false,
  error: null,
  setWalletState: (state) => set((prev: WalletStore) => ({ ...prev, ...state })),
  connect: async () => {
    try {
      const state = await getWalletState();
      set(state);
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  disconnect: async () => {
    try {
      await disconnectWallet();
      set({
        account: null,
        balance: '0',
        contract: null,
        provider: null,
        tokenAdded: false,
        error: null
      });
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  setError: (error) => set({ error }),
  updateBalance: async () => {
    try {
      const state = await getWalletState();
      set({ balance: state.balance });
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }
})); 