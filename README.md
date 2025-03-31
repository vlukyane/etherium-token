# Ethereum Token Project

## Overview
This project implements a simple ERC20 token with a swap contract that allows users to exchange ETH for tokens and vice versa. The swap contract features dynamic pricing and administrative controls.

## Features
- ERC20 Token (SimpleToken)
- Token Swap Contract with:
  - Dynamic pricing based on token/ETH ratio
  - Initial price: 0.01 ETH per token
  - Price bounds: 0.005-0.02 ETH per token
  - Initial liquidity: 1,000,000 tokens
  - Administrative controls for managing liquidity

## Contract Details

### SimpleToken
- Standard ERC20 token implementation
- Initial supply: 1,000,000 tokens
- Decimals: 18

### TokenSwap
The swap contract provides the following features:

#### Dynamic Pricing
- Initial rate: 1 ETH = 100 tokens (0.01 ETH per token)
- Price adjusts based on the token/ETH ratio in the contract
- Price bounds:
  - Minimum: 0.02 ETH per token
  - Maximum: 0.005 ETH per token
- Price calculation: `rate = (tokenBalance * PRECISION) / ethBalance`

#### Administrative Functions
1. **Managing Liquidity**
   - `depositTokens(uint256 _amount)`: Add tokens to the contract
   - `withdrawTokens(uint256 _amount)`: Remove tokens from the contract
   - `depositEth()`: Add ETH to the contract
   - `withdrawEth(uint256 _amount)`: Remove ETH from the contract

2. **Price Controls**
   - `setRateBounds(uint256 _minRate, uint256 _maxRate)`: Set new price bounds
   - `getCurrentRate()`: View current swap rate

#### User Functions
1. **Swapping ETH for Tokens**
   - Send ETH to `swapEthForTokens()`
   - Receive tokens based on current rate

2. **Swapping Tokens for ETH**
   - Approve tokens for swap contract
   - Call `swapTokensForEth(uint256 _tokenAmount)`
   - Receive ETH based on current rate

## Setup and Deployment

1. Install dependencies:
```bash
npm install
```

2. Create environment files:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

3. Deploy contracts:
```bash
npm run deploy
```
This will:
- Deploy SimpleToken
- Deploy TokenSwap
- Fund TokenSwap with 1,000,000 tokens
- Fund TokenSwap with 10 ETH
- Update environment files with contract addresses

4. Initialize accounts:
```bash
npm run init
```

5. Start frontend:
```bash
npm run start:frontend
```

## Admin Guide

### Managing Liquidity

1. **Adding Tokens**
   ```javascript
   // Approve tokens first
   await token.approve(swapAddress, amount);
   // Then deposit
   await swap.depositTokens(amount);
   ```

2. **Adding ETH**
   ```javascript
   await swap.depositEth({ value: ethers.utils.parseEther("10") });
   ```

3. **Withdrawing Tokens**
   ```javascript
   await swap.withdrawTokens(amount);
   ```

4. **Withdrawing ETH**
   ```javascript
   await swap.withdrawEth(amount);
   ```

### Managing Price Bounds

1. **View Current Rate**
   ```javascript
   const rate = await swap.getCurrentRate();
   console.log("Current rate:", rate);
   ```

2. **Set New Price Bounds**
   ```javascript
   // Example: Set bounds to 0.01-0.03 ETH per token
   await swap.setRateBounds(50, 300);
   ```

## User Guide

### Swapping ETH for Tokens

1. Enter the amount of ETH you want to swap
2. Click "Swap ETH for Tokens"
3. Confirm the transaction in MetaMask
4. Receive tokens at the current rate

### Swapping Tokens for ETH

1. Enter the amount of tokens you want to swap
2. Approve the swap contract to spend your tokens
3. Click "Swap Tokens for ETH"
4. Confirm the transaction in MetaMask
5. Receive ETH at the current rate

## Notes
- All prices are calculated with 4 decimal precision (PRECISION = 10000)
- The contract maintains a minimum ETH balance to ensure proper rate calculation
- Price bounds can be adjusted by the contract owner
- The contract owner can add or remove liquidity at any time

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ethereum-token.git
cd ethereum-token
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. Create environment files:
```bash
# Create root .env file
cp .env.example .env

# Create frontend .env file
cp frontend/.env.example frontend/.env
```

4. Configure environment variables in `.env`:
```env
# Root .env
SEPOLIA_RPC_URL=your_alchemy_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Frontend .env (will be auto-updated after deployment)
VITE_CONTRACT_ADDRESS=
VITE_SWAP_CONTRACT_ADDRESS=
```

## Development

### Local Network

1. Start local Hardhat network:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Start frontend development server:
```bash
cd frontend
npm run dev
```

4. Configure MetaMask:
   - Network: Localhost 8545
   - Chain ID: 31337
   - Import test accounts using private keys from `npx hardhat node` output

### Testnet (Sepolia)

1. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

2. Deploy contracts:
```bash
npx hardhat run scripts/deploySepolia.js --network sepolia
```

3. Verify contracts:
```bash
npx hardhat verify --network sepolia DEPLOYED_TOKEN_ADDRESS
npx hardhat verify --network sepolia DEPLOYED_SWAP_ADDRESS "DEPLOYED_TOKEN_ADDRESS"
```

4. Deploy frontend to Vercel:
```bash
cd frontend
vercel
```

## Project Structure

```
ethereum-token/
├── contracts/          # Smart contracts
│   ├── SimpleToken.sol
│   └── TokenSwap.sol
├── scripts/           # Deployment and utility scripts
│   ├── deploy.js
│   ├── deploySepolia.js
│   ├── checkBalances.js
│   └── ...
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── App.tsx
│   └── public/
├── test/             # Contract tests
└── hardhat.config.js # Hardhat configuration
```

## Available Scripts

### Contract Management
- `npx hardhat compile` - Compile contracts
- `npx hardhat test` - Run tests
- `npx hardhat node` - Start local network
- `npx hardhat run scripts/deploy.js` - Deploy to local network
- `npx hardhat run scripts/deploySepolia.js` - Deploy to Sepolia testnet

### Balance Checking
- `npx hardhat run scripts/checkBalances.js` - Check token balances
- `npx hardhat run scripts/checkBalancesDirect.js` - Direct balance check

### Account Management
- `npx hardhat run scripts/showAccounts.js` - List available accounts
- `npx hardhat run scripts/showPrivateKeys.js` - Show account private keys
- `npx hardhat run scripts/sendEth.js` - Send ETH between accounts

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.