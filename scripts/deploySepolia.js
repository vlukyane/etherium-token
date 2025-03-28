require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting Sepolia deployment...");

  // Check for required environment variables
  if (!process.env.SEPOLIA_RPC_URL) {
    throw new Error("SEPOLIA_RPC_URL not set in .env file");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error("ETHERSCAN_API_KEY not set in .env file");
  }

  // Deploy SimpleToken
  console.log("\nDeploying SimpleToken...");
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const token = await SimpleToken.deploy();
  await token.deployed();
  console.log("SimpleToken deployed to:", token.address);

  // Deploy TokenSwap
  console.log("\nDeploying TokenSwap...");
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const swap = await TokenSwap.deploy(token.address);
  await swap.deployed();
  console.log("TokenSwap deployed to:", swap.address);

  // Fund swap contract with tokens
  console.log("\nFunding swap contract with tokens...");
  const fundAmount = ethers.utils.parseEther("1000");
  const tokenTx = await token.transfer(swap.address, fundAmount);
  await tokenTx.wait();
  console.log("Transferred 1000 tokens to swap contract");

  // Fund swap contract with ETH
  console.log("\nFunding swap contract with ETH...");
  const ethAmount = ethers.utils.parseEther("0.1"); // Less ETH for testnet
  const swapContract = await hre.ethers.getContractFactory("TokenSwap");
  const swapInstance = await swapContract.attach(swap.address);
  const depositTx = await swapInstance.depositEth({ value: ethAmount });
  await depositTx.wait();
  console.log("Deposited 0.1 ETH to swap contract");

  // Update environment files
  console.log("\nUpdating environment files...");
  
  // Update root .env
  const rootEnvPath = path.join(__dirname, '../.env');
  let rootEnvContent = fs.readFileSync(rootEnvPath, 'utf8');
  rootEnvContent = rootEnvContent.replace(/TOKEN_ADDRESS=.*/, `TOKEN_ADDRESS=${token.address}`);
  rootEnvContent = rootEnvContent.replace(/SWAP_CONTRACT_ADDRESS=.*/, `SWAP_CONTRACT_ADDRESS=${swap.address}`);
  fs.writeFileSync(rootEnvPath, rootEnvContent);
  console.log("Updated root .env");

  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');
  let frontendEnvContent = `VITE_CONTRACT_ADDRESS=${token.address}\nVITE_SWAP_CONTRACT_ADDRESS=${swap.address}`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log("Updated frontend .env");

  // Build frontend
  console.log("\nBuilding frontend...");
  try {
    require('child_process').execSync('cd frontend && npm run build', { stdio: 'inherit' });
    console.log("Frontend built successfully");
  } catch (error) {
    console.error("Error building frontend:", error);
    process.exit(1);
  }

  console.log("\nDeployment completed successfully!");
  console.log("\nContract addresses:");
  console.log("Token:", token.address);
  console.log("Swap:", swap.address);
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${token.address}`);
  console.log(`   npx hardhat verify --network sepolia ${swap.address} "${token.address}"`);
  console.log("2. Deploy frontend to Vercel");
  console.log("3. Test the deployed application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 