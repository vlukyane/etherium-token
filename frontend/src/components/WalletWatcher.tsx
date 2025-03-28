import { useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { getWalletState } from '../utils/wallet';

export const WalletWatcher = () => {
  const { setWalletState, disconnect, setError } = useWalletStore();

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        await disconnect();
      } else {
        try {
          const state = await getWalletState();
          setWalletState(state);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [setWalletState, disconnect, setError]);

  return null;
}; 