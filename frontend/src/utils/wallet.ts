import { ethers } from 'ethers';
import SimpleToken from '../artifacts/contracts/SimpleToken.sol/SimpleToken.json';

export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error("Contract address not found in environment variables");
}

export interface WalletState {
  account: string | null;
  balance: string;
  contract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
  tokenAdded: boolean;
}

export const checkTokenAdded = async (): Promise<boolean> => {
  if (!window.ethereum) {
    return false;
  }

  try {
    const tokens = await window.ethereum.request({
      method: 'wallet_getTokens'
    });

    return tokens.some((token: any) => 
      token.address.toLowerCase() === contractAddress.toLowerCase()
    );
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

export const addTokenToMetaMask = async (): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('MetaMask не установлен');
  }

  try {
    const isTokenAdded = await checkTokenAdded();
    if (isTokenAdded) {
      return true;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(contractAddress, SimpleToken.abi, provider);
    
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: contractAddress,
          symbol: symbol,
          decimals: decimals,
          image: 'https://your-token-image-url.com/token.png'
        }
      }
    });
    return true;
  } catch (error) {
    console.error('Error adding token to MetaMask:', error);
    throw new Error('Ошибка при добавлении токена в MetaMask');
  }
};

export const getWalletState = async (): Promise<WalletState> => {
  if (!window.ethereum) {
    throw new Error('MetaMask не установлен');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  
  const tokenContract = new ethers.Contract(contractAddress, SimpleToken.abi, signer);
  const balance = await tokenContract.balanceOf(address);
  const tokenAdded = await checkTokenAdded();

  return {
    account: address,
    balance: ethers.utils.formatEther(balance),
    contract: tokenContract,
    provider,
    tokenAdded
  };
};

export const disconnectWallet = async (): Promise<void> => {
  if (window.ethereum) {
    await window.ethereum.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }],
    });
  }
}; 