import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore.ts';
import { getStakingContract, getStakes, getTotalStaked, stake, unstake, claimRewards, Stake } from '@/utils/staking.ts';
import { StakeForm } from './StakeForm';
import { UnstakeForm } from './UnstakeForm';

export const StakingPage = () => {
  const { account, contract, updateBalance } = useWalletStore();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [totalStaked, setTotalStaked] = useState('0');

  const loadStakes = async () => {
    if (!account || !contract) return;

    const stakingContract = getStakingContract(import.meta.env.VITE_HARDHAT_STAKING_ADDRESS!, contract.signer);
    const stakes = await getStakes(stakingContract, account);
    const total = await getTotalStaked(stakingContract, account);
    setStakes(stakes);
    setTotalStaked(total);
  };

  useEffect(() => {
    loadStakes();
    
    // Update stakes every 10 seconds to show correct status
    const interval = setInterval(loadStakes, 10000);
    
    return () => clearInterval(interval);
  }, [account, contract]);

  const handleStake = async (amount: string, period: number) => {
    if (!account || !contract) return;

    const stakingContract = getStakingContract(import.meta.env.VITE_HARDHAT_STAKING_ADDRESS!, contract.signer);
    await stake(stakingContract, amount, period);

    // Update data
    await loadStakes();
    await updateBalance();
  };

  const handleUnstake = async (stakeIndex: number) => {
    if (!account || !contract) return;

    const stakingContract = getStakingContract(import.meta.env.VITE_HARDHAT_STAKING_ADDRESS!, contract.signer);
    await unstake(stakingContract, stakeIndex);

    // Update data
    await loadStakes();
    await updateBalance();
  };

  const handleClaimRewards = async (stakeIndex: number) => {
    if (!account || !contract) return;

    const stakingContract = getStakingContract(import.meta.env.VITE_HARDHAT_STAKING_ADDRESS!, contract.signer);
    await claimRewards(stakingContract, stakeIndex);

    // Update data
    await loadStakes();
    await updateBalance();
  };

  return (
    <div>
      <h2>Staking</h2>
      <p>Total staked: {totalStaked} SMPL</p>
      
      <StakeForm onStake={handleStake} />
      <UnstakeForm 
        stakes={stakes} 
        onUnstake={handleUnstake}
        onClaimRewards={handleClaimRewards}
      />
    </div>
  );
};
