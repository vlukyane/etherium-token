# Ethereum Token Swap DApp

A decentralized application for swapping ERC20 tokens with ETH on the Ethereum network. The project includes smart contracts for token creation and swapping, along with a React frontend for user interaction.

## Features

### Smart Contracts
- ERC20 Token with standard functionality
- Token Swap contract for exchanging tokens with ETH
- Fixed exchange rate (1 ETH = 100 tokens)
- Manual liquidity provision through contract funding
- Secure transaction handling

### Frontend Application
- MetaMask wallet integration
- Real-time balance checking
- Token to ETH swapping
- ETH to Token swapping
- Transaction history
- Responsive design

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