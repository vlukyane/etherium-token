import { useState } from 'react';
import { useWalletStore } from '../../store/walletStore';

export const StakeForm = ({ onStake }: { onStake: (amount: string, period: number) => Promise<void> }) => {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(1);
  const { balance } = useWalletStore();

  return (
    <div>
      <h3>Stake Tokens</h3>
      <p>Your balance: {balance} SMPL</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
        <option value={1}>1 minute (+1000% APY)</option>
        <option value={10}>10 minutes (+100% APY)</option>
      </select>
      <button onClick={() => onStake(amount, period)}>Stake</button>
    </div>
  );
}; 