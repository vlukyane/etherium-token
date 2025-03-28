require('dotenv').config();
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const swapAddress = process.env.SWAP_CONTRACT_ADDRESS;

  if (!tokenAddress || !swapAddress) {
    throw new Error("Token or Swap contract address not found in environment variables");
  }

  console.log("Using addresses:");
  console.log("Token:", tokenAddress);
  console.log("Swap:", swapAddress);

  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const token = await SimpleToken.attach(tokenAddress);

  // Transfer 1000 tokens to swap contract
  const amount = ethers.utils.parseEther("1000");
  console.log("Transferring 1000 tokens to swap contract...");
  
  const tx = await token.transfer(swapAddress, amount);
  await tx.wait();

  console.log("Successfully transferred 1000 tokens to swap contract");

  // Check balance
  const balance = await token.balanceOf(swapAddress);
  console.log("Swap contract token balance:", ethers.utils.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 