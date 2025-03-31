import { Stake } from '../../utils/staking';

interface UnstakeFormProps {
  stakes: Stake[];
  onUnstake: (index: number) => Promise<void>;
  onClaimRewards: (index: number) => Promise<void>;
}

export const UnstakeForm = ({ stakes, onUnstake, onClaimRewards }: UnstakeFormProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const canClaimRewards = (stake: Stake) => {
    const now = Math.floor(Date.now() / 1000);
    return stake.isActive && 
           parseInt(stake.endTime) <= now && 
           !stake.rewardsClaimed;
  };

  return (
    <div>
      <h3>Your Stakes</h3>
      {stakes.map((stake, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <p>Amount: {stake.amount} SMPL</p>
          <p>APY: {stake.apy}%</p>
          <p>Start Time: {formatDate(parseInt(stake.startTime))}</p>
          <p>End Time: {formatDate(parseInt(stake.endTime))}</p>
          <p>Status: {stake.isActive ? 'Active' : 'Completed'}</p>
          
          {stake.isActive && (
            <>
              <button onClick={() => onUnstake(index)}>
                Unstake
              </button>
              {canClaimRewards(stake) && (
                <button 
                  onClick={() => onClaimRewards(index)}
                  style={{ marginLeft: '10px', backgroundColor: '#4CAF50' }}
                >
                  Claim Rewards
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}; 