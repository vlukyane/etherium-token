import { create } from 'zustand';
import { WalletState, getWalletState, disconnectWallet } from '../utils/wallet';

interface WalletStore extends WalletState {
  setWalletState: (state: Partial<WalletState>) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

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
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  setError: (error) => set({ error })
})); 