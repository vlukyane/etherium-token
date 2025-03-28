require('dotenv').config();
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const swapAddress = process.env.SWAP_CONTRACT_ADDRESS;

  if (!swapAddress) {
    throw new Error("Swap contract address not found in environment variables");
  }

  console.log("Using swap address:", swapAddress);

  // Get contract instance
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const swapContract = TokenSwap.attach(swapAddress);

  // Send 10 ETH to swap contract using depositEth
  const amount = ethers.utils.parseEther("10");
  console.log("Sending 10 ETH to swap contract...");
  
  const tx = await swapContract.depositEth({ value: amount });
  await tx.wait();

  console.log("Successfully sent 10 ETH to swap contract");

  // Check balance
  const balance = await ethers.provider.getBalance(swapAddress);
  console.log("Swap contract ETH balance:", ethers.utils.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 