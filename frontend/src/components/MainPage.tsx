import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletStore } from '../store/walletStore';
import { addTokenToMetaMask, getWalletState } from '../utils/wallet';
import TokenSwap from '../artifacts/contracts/TokenSwap.sol/TokenSwap.json';

export const MainPage = () => {
  const { account, balance, contract, disconnect, tokenAdded, setError, setWalletState } = useWalletStore();
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [ethAmount, setEthAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapRate, setSwapRate] = useState<number>(0);
  const [ethBalance, setEthBalance] = useState<string>('0');

  const swapContractAddress = import.meta.env.VITE_HARDHAT_SWAP_ADDRESS;
  if (!swapContractAddress) {
    throw new Error("Swap contract address not found in environment variables");
  }

  useEffect(() => {
    const fetchSwapRate = async () => {
      try {
        if (!contract) return;
        const swapContract = new ethers.Contract(swapContractAddress, TokenSwap.abi, contract.signer);
        const rate = await swapContract.getCurrentRate();
        console.log(rate.toNumber() / 10000);
        setSwapRate(rate.toNumber() / 10000); // Convert from PRECISION to actual rate
      } catch (error) {
        console.error('Error fetching swap rate:', error);
      }
    };

    fetchSwapRate();
  }, [contract, swapContractAddress]);

  useEffect(() => {
    const fetchEthBalance = async () => {
      try {
        if (!contract) return;
        const balance = await contract.signer.getBalance();
        setEthBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
      }
    };

    fetchEthBalance();
  }, [contract]);

  const handleAddToken = async () => {
    try {
      await addTokenToMetaMask();
      // Update wallet state to refresh tokenAdded status
      const state = await getWalletState();
      setWalletState(state);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleTransfer = async () => {
    try {
      if (contract && recipient && amount) {
        const tx = await contract.transfer(
          recipient,
          ethers.utils.parseEther(amount)
        );
        await tx.wait();
        const newBalance = await contract.balanceOf(account);
        setWalletState({ balance: ethers.utils.formatEther(newBalance) });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleSwapTokensForEth = async () => {
    try {
      if (!contract || !swapAmount) return;

      setIsSwapping(true);
      const swapContract = new ethers.Contract(swapContractAddress, TokenSwap.abi, contract.signer);
      
      // Approve tokens for swap contract
      const approveTx = await contract.approve(
        swapContractAddress,
        ethers.utils.parseEther(swapAmount)
      );
      await approveTx.wait();

      // Execute swap
      const swapTx = await swapContract.swapTokensForEth(
        ethers.utils.parseEther(swapAmount)
      );
      await swapTx.wait();

      // Update balances
      const newBalance = await contract.balanceOf(account);
      const newEthBalance = await contract.signer.getBalance();
      setWalletState({ balance: ethers.utils.formatEther(newBalance) });
      setEthBalance(ethers.utils.formatEther(newEthBalance));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapEthForTokens = async () => {
    try {
      if (!contract || !ethAmount) return;

      setIsSwapping(true);
      const swapContract = new ethers.Contract(swapContractAddress, TokenSwap.abi, contract.signer);
      
      // Check if contract has enough tokens
      const tokenAmount = ethers.utils.parseEther(calculateTokenAmount(ethAmount));
      const contractTokenBalance = await contract.balanceOf(swapContractAddress);
      
      if (contractTokenBalance.lt(tokenAmount)) {
        throw new Error("Contract doesn't have enough tokens for swap");
      }
      
      // Execute swap
      const swapTx = await swapContract.swapEthForTokens({
        value: ethers.utils.parseEther(ethAmount)
      });
      await swapTx.wait();

      // Update balances
      const newBalance = await contract.balanceOf(account);
      const newEthBalance = await contract.signer.getBalance();
      setWalletState({ balance: ethers.utils.formatEther(newBalance) });
      setEthBalance(ethers.utils.formatEther(newEthBalance));
    } catch (error) {
      console.error('Swap error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSwapping(false);
    }
  };

  // Calculate ETH amount for token swap
  const calculateEthAmount = (tokenAmount: string) => {
    if (!tokenAmount || !swapRate) return '0';
    const ethAmount = Number(tokenAmount) / (1 / swapRate);
    return ethAmount.toFixed(4);
  };

  // Calculate token amount for ETH swap
  const calculateTokenAmount = (ethAmount: string) => {
    if (!ethAmount || !swapRate) return '0';
    const tokenAmount = Number(ethAmount) * (1 / swapRate);
    return tokenAmount.toFixed(4);
  };

  // Validation functions
  const hasEnoughTokens = (amount: string) => {
    return Number(amount) <= Number(balance);
  };

  const hasEnoughEth = (amount: string) => {
    return Number(amount) <= Number(ethBalance);
  };

  const isValidAmount = (amount: string) => {
    return amount && Number(amount) > 0;
  };

  return (
    <div>
      <p>Connected Account: {account}</p>
      <p>Balance: {Number(balance).toFixed(4)} SMPL</p>
      <p>ETH Balance: {Number(ethBalance).toFixed(4)} ETH</p>
      <p>Current rate: 1 SMPL = {(1 / swapRate).toFixed(4)} ETH</p>
    
      {!tokenAdded && (
        <button 
          onClick={handleAddToken}
          style={{ 
            backgroundColor: '#4CAF50',
            marginBottom: '20px'
          }}
        >
          Add SMPL Token to MetaMask
        </button>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Transfer Tokens</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button 
          onClick={handleTransfer}
          disabled={!isValidAmount(amount) || !hasEnoughTokens(amount)}
        >
          Transfer
        </button>
        {amount && !hasEnoughTokens(amount) && (
          <p style={{ color: 'red' }}>Insufficient token balance</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Swap Tokens for ETH</h3>
        <input
          type="number"
          placeholder="Token Amount"
          value={swapAmount}
          onChange={(e) => setSwapAmount(e.target.value)}
        />
        <button 
          onClick={handleSwapTokensForEth}
          disabled={isSwapping || !isValidAmount(swapAmount) || !hasEnoughTokens(swapAmount)}
        >
          {isSwapping ? 'Swapping...' : `Swap ${swapAmount || '0'} SMPL for ${calculateEthAmount(swapAmount)} ETH`}
        </button>
        {swapAmount && !hasEnoughTokens(swapAmount) && (
          <p style={{ color: 'red' }}>Insufficient token balance</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Swap ETH for Tokens</h3>
        <input
          type="number"
          placeholder="ETH Amount"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
        />
        <button 
          onClick={handleSwapEthForTokens}
          disabled={isSwapping || !isValidAmount(ethAmount) || !hasEnoughEth(ethAmount)}
        >
          {isSwapping ? 'Swapping...' : `Swap ${ethAmount || '0'} ETH for ${calculateTokenAmount(ethAmount)} SMPL`}
        </button>
        {ethAmount && !hasEnoughEth(ethAmount) && (
          <p style={{ color: 'red' }}>Insufficient ETH balance</p>
        )}
      </div>

      <button 
        onClick={disconnect} 
        style={{ backgroundColor: '#ff4444' }}
      >
        Disconnect
      </button>
    </div>
  );
}; 