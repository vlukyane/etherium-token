require('dotenv').config();
const hre = require("hardhat");

async function main() {
  // Get the deployed token address from .env
  const tokenAddress = process.env.TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("Token address not found in environment variables");
  }

  // Deploy TokenSwap contract
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(tokenAddress);
  await tokenSwap.deployed();

  console.log("TokenSwap deployed to:", tokenSwap.address);
  
  // Save the contract address to frontend .env
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../frontend/.env');
  
  // Read existing .env content
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Add or update SWAP_CONTRACT_ADDRESS
  if (envContent.includes('VITE_SWAP_CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(
      /VITE_SWAP_CONTRACT_ADDRESS=.*/,
      `VITE_SWAP_CONTRACT_ADDRESS=${tokenSwap.address}`
    );
  } else {
    envContent += `\nVITE_SWAP_CONTRACT_ADDRESS=${tokenSwap.address}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("Swap contract address saved to frontend/.env");

  // Save swap address to root .env
  const rootEnvPath = path.join(__dirname, '../.env');
  let rootEnvContent = '';
  if (fs.existsSync(rootEnvPath)) {
    rootEnvContent = fs.readFileSync(rootEnvPath, 'utf8');
  }
  
  if (rootEnvContent.includes('SWAP_CONTRACT_ADDRESS=')) {
    rootEnvContent = rootEnvContent.replace(
      /SWAP_CONTRACT_ADDRESS=.*/,
      `SWAP_CONTRACT_ADDRESS=${tokenSwap.address}`
    );
  } else {
    rootEnvContent += `\nSWAP_CONTRACT_ADDRESS=${tokenSwap.address}`;
  }
  
  fs.writeFileSync(rootEnvPath, rootEnvContent);
  console.log("Swap contract address saved to root .env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 