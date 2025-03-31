import { Stake } from '@/utils/staking.ts';

interface StakeInfoProps {
  stake: Stake;
  onUnstake: () => Promise<void>;
  onClaimRewards: () => Promise<void>;
}

export const StakeInfo = ({ stake, onUnstake, onClaimRewards }: StakeInfoProps) => {
  const startTime = new Date(parseInt(stake.startTime) * 1000).toLocaleString();
  const endTime = new Date(parseInt(stake.endTime) * 1000).toLocaleString();
  const now = Date.now() / 1000;
  const isActive = stake.active && parseInt(stake.endTime) > now;

  return (
    <div className="stake-info">
      <h3>Stake Details</h3>
      <p>Amount: {stake.amount} SMPL</p>
      <p>APY: {stake.apy}%</p>
      <p>Start Time: {startTime}</p>
      <p>End Time: {endTime}</p>
      <p>Status: {isActive ? 'Active' : 'Completed'}</p>
      
      {isActive && (
        <div className="stake-actions">
          <button onClick={onUnstake}>Unstake</button>
          <button onClick={onClaimRewards} disabled={stake.rewardsClaimed}>
            {stake.rewardsClaimed ? 'Rewards Claimed' : 'Claim Rewards'}
          </button>
        </div>
      )}
    </div>
  );
}; 