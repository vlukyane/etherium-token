require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting deployment...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("\nDeployer address:", deployer.address);

  // Check deployer balance
  const deployerBalance = await deployer.getBalance();
  console.log("Deployer balance:", hre.ethers.utils.formatEther(deployerBalance), "ETH");

  // If balance is low, try to fund it
  if (deployerBalance.lt(hre.ethers.utils.parseEther("1"))) {
    console.log("Deployer balance is low, attempting to fund it...");
    try {
      // Try to get ETH from the network
      const network = await hre.ethers.provider.getNetwork();
      if (network.name === "localhost") {
        // On localhost, we can use the first account to fund the deployer
        const accounts = await hre.ethers.getSigners();
        const funder = accounts[0];
        const funderBalance = await funder.getBalance();
        if (funderBalance.gt(hre.ethers.utils.parseEther("1"))) {
          const fundTx = await funder.sendTransaction({
            to: deployer.address,
            value: hre.ethers.utils.parseEther("1")
          });
          await fundTx.wait();
          console.log("Funded deployer with 1 ETH");
        }
      }
    } catch (error) {
      console.log("Could not fund deployer:", error.message);
    }
  }

  // Deploy SimpleToken
  console.log("\nDeploying SimpleToken...");
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const token = await SimpleToken.deploy("Simple Token", "SMPL");
  await token.deployed();
  console.log("SimpleToken deployed to:", token.address);

  // Fund swap contract with tokens
  console.log("\nFunding swap contract with tokens...");
  const fundAmount = hre.ethers.utils.parseEther("1000000"); // 1 million tokens
  const rewardsPoolAmount = hre.ethers.utils.parseEther("100000"); // 100,000 tokens for rewards pool
  
  // First mint all tokens to deployer
  console.log("Minting tokens to deployer...");
  const mintTx = await token.mint(deployer.address, fundAmount.add(rewardsPoolAmount));
  await mintTx.wait();
  console.log("Minted 1,100,000 tokens to deployer");

  // Fund staking contract with rewards pool
  console.log("\nFunding staking contract with rewards pool...");
  
  // Approve tokens for staking contract
  console.log("Approving tokens for staking contract...");
  const approveTx = await token.approve(deployer.address, rewardsPoolAmount);
  await approveTx.wait();
  console.log("Approved 100,000 tokens for deployer");

  // Deploy Staking
  console.log("\nDeploying Staking...");
  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(token.address);
  await staking.deployed();
  console.log("Staking deployed to:", staking.address);

  // Deploy TokenSwap
  console.log("\nDeploying TokenSwap...");
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const swap = await TokenSwap.deploy(token.address);
  await swap.deployed();
  console.log("TokenSwap deployed to:", swap.address);

  // Then transfer tokens to swap contract
  console.log("Transferring tokens to swap contract...");
  const tokenTx = await token.transfer(swap.address, fundAmount);
  await tokenTx.wait();
  console.log("Transferred 1,000,000 tokens to swap contract");

  // Fund swap contract with ETH
  console.log("\nFunding swap contract with ETH...");
  const ethAmount = hre.ethers.utils.parseEther("10");
  const swapContract = await hre.ethers.getContractFactory("TokenSwap");
  const swapInstance = await swapContract.attach(swap.address);
  const depositTx = await swapInstance.depositEth({ value: ethAmount });
  await depositTx.wait();
  console.log("Deposited 10 ETH to swap contract");

  // Update environment files
  console.log("\nUpdating environment files...");
  
  // Update root .env
  const rootEnvPath = path.join(__dirname, '../.env');
  let rootEnvContent = fs.existsSync(rootEnvPath) ? fs.readFileSync(rootEnvPath, 'utf8') : '';
  
  // Add RPC URL if not exists
  if (!rootEnvContent.includes("HARDHAT_RPC_URL")) {
    rootEnvContent += "\nHARDHAT_RPC_URL=http://127.0.0.1:8545\n";
  }
  
  // Update or add contract addresses
  if (rootEnvContent.includes("HARDHAT_TOKEN_ADDRESS=")) {
    rootEnvContent = rootEnvContent.replace(/HARDHAT_TOKEN_ADDRESS=.*/, `HARDHAT_TOKEN_ADDRESS=${token.address}`);
  } else {
    rootEnvContent += `\nHARDHAT_TOKEN_ADDRESS=${token.address}`;
  }
  
  if (rootEnvContent.includes("HARDHAT_SWAP_ADDRESS=")) {
    rootEnvContent = rootEnvContent.replace(/HARDHAT_SWAP_ADDRESS=.*/, `HARDHAT_SWAP_ADDRESS=${swap.address}`);
  } else {
    rootEnvContent += `\nHARDHAT_SWAP_ADDRESS=${swap.address}`;
  }

  if (rootEnvContent.includes("HARDHAT_STAKING_ADDRESS=")) {
    rootEnvContent = rootEnvContent.replace(/HARDHAT_STAKING_ADDRESS=.*/, `HARDHAT_STAKING_ADDRESS=${staking.address}`);
  } else {
    rootEnvContent += `\nHARDHAT_STAKING_ADDRESS=${staking.address}`;
  }
  
  fs.writeFileSync(rootEnvPath, rootEnvContent);
  console.log("Updated root .env");

  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');
  let frontendEnvContent = fs.existsSync(frontendEnvPath) ? fs.readFileSync(frontendEnvPath, 'utf8') : '';
  
  // Update or add contract addresses
  if (frontendEnvContent.includes("VITE_HARDHAT_TOKEN_ADDRESS=")) {
    frontendEnvContent = frontendEnvContent.replace(/VITE_HARDHAT_TOKEN_ADDRESS=.*/, `VITE_HARDHAT_TOKEN_ADDRESS=${token.address}`);
  } else {
    frontendEnvContent += `\nVITE_HARDHAT_TOKEN_ADDRESS=${token.address}`;
  }
  
  if (frontendEnvContent.includes("VITE_HARDHAT_SWAP_ADDRESS=")) {
    frontendEnvContent = frontendEnvContent.replace(/VITE_HARDHAT_SWAP_ADDRESS=.*/, `VITE_HARDHAT_SWAP_ADDRESS=${swap.address}`);
  } else {
    frontendEnvContent += `\nVITE_HARDHAT_SWAP_ADDRESS=${swap.address}`;
  }

  if (frontendEnvContent.includes("VITE_HARDHAT_STAKING_ADDRESS=")) {
    frontendEnvContent = frontendEnvContent.replace(/VITE_HARDHAT_STAKING_ADDRESS=.*/, `VITE_HARDHAT_STAKING_ADDRESS=${staking.address}`);
  } else {
    frontendEnvContent += `\nVITE_HARDHAT_STAKING_ADDRESS=${staking.address}`;
  }

  // Add VITE_CONTRACT_ADDRESS for compatibility
  if (frontendEnvContent.includes("VITE_CONTRACT_ADDRESS=")) {
    frontendEnvContent = frontendEnvContent.replace(/VITE_CONTRACT_ADDRESS=.*/, `VITE_CONTRACT_ADDRESS=${token.address}`);
  } else {
    frontendEnvContent += `\nVITE_CONTRACT_ADDRESS=${token.address}`;
  }
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log("Updated frontend .env");

  console.log("\nDeployment completed successfully!");
  console.log("\nContract addresses:");
  console.log("Token:", token.address);
  console.log("Swap:", swap.address);
  console.log("Staking:", staking.address);
  console.log("\nNext steps:");
  console.log("1. Run 'npm run init' to initialize accounts");
  console.log("2. Run 'npm run start:frontend' to start the frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
