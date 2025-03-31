import { ethers } from 'ethers';
import Staking from '../artifacts/contracts/Staking.sol/Staking.json';
import SimpleToken from '../artifacts/contracts/SimpleToken.sol/SimpleToken.json';

export interface Stake {
  amount: string;
  startTime: string;
  endTime: string;
  apy: string;
  isActive: boolean;
  rewardsClaimed: boolean;
}

export const getStakingContract = (address: string, signer: ethers.Signer) => {
  return new ethers.Contract(address, Staking.abi, signer);
};

export const getTokenContract = (address: string, signer: ethers.Signer) => {
  return new ethers.Contract(address, SimpleToken.abi, signer);
};

export const approveTokenSpending = async (tokenContract: ReturnType<typeof getTokenContract>, stakingAddress: string, amount: string) => {
  const amountWei = ethers.utils.parseEther(amount);
  const tx = await tokenContract.approve(stakingAddress, amountWei);
  await tx.wait();
};

export const getStakes = async (contract: ethers.Contract, address: string): Promise<Stake[]> => {
  try {
    const stakes = await contract.getStakes(address);
    return stakes.map(stake => ({
      amount: ethers.utils.formatEther(stake.amount),
      startTime: stake.startTime.toString(),
      endTime: stake.endTime.toString(),
      apy: stake.apy.toString(),
      isActive: stake.isActive,
      rewardsClaimed: stake.rewardsClaimed
    }));
  } catch (error) {
    console.error('Error getting stakes:', error);
    return [];
  }
};

export const getTotalStaked = async (contract: ethers.Contract, address: string): Promise<string> => {
  const total = await contract.totalStaked(address);
  return ethers.utils.formatEther(total);
};

export const stake = async (stakingContract: ReturnType<typeof getStakingContract>, amount: string, period: number) => {
  // Сначала получаем контракт токена
  const tokenAddress = await stakingContract.token();
  const tokenContract = getTokenContract(tokenAddress, stakingContract.signer);

  // Проверяем баланс
  const balance = await tokenContract.balanceOf(stakingContract.signer.getAddress());
  const amountWei = ethers.utils.parseEther(amount);
  
  if (balance.lt(amountWei)) {
    throw new Error(`Insufficient balance. You have ${ethers.utils.formatEther(balance)} tokens, but trying to stake ${amount}`);
  }

  // Устанавливаем allowance
  await approveTokenSpending(tokenContract, stakingContract.address, amount);
  
  console.log('Staking with parameters:', {
    amount: amountWei.toString(),
    period: period,
    balance: balance.toString()
  });
  
  const tx = await stakingContract.stake(amountWei, period);
  await tx.wait();
};

export const unstake = async (
  contract: ethers.Contract,
  stakeIndex: number
): Promise<void> => {
  await contract.unstake(stakeIndex);
};

export const claimRewards = async (
  contract: ethers.Contract,
  stakeIndex: number
): Promise<void> => {
  await contract.claimRewards(stakeIndex);
};

export const getStakeInfo = async (
  contract: ethers.Contract,
  userAddress: string,
  stakeIndex: number
): Promise<Stake> => {
  const info = await contract.getStakeInfo(userAddress, stakeIndex);
  return {
    amount: ethers.utils.formatEther(info.amount),
    startTime: info.startTime.toString(),
    endTime: info.endTime.toString(),
    apy: info.apy.toString(),
    isActive: info.isActive,
    rewardsClaimed: info.rewardsClaimed
  };
}; 