require('dotenv').config();
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const tokenAddress = process.env.TOKEN_ADDRESS;

  if (!tokenAddress) {
    throw new Error("Token address not found in environment variables");
  }

  console.log("Using addresses:");
  console.log("Token:", tokenAddress);
  console.log("Owner:", owner.address);

  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const token = await SimpleToken.attach(tokenAddress);

  // Mint 1000 tokens to owner
  const amount = ethers.utils.parseEther("1000");
  console.log("\nMinting 1000 tokens to owner...");
  
  const tx = await token.mint(owner.address, amount);
  await tx.wait();

  console.log("Successfully minted tokens");

  // Check balance
  const balance = await token.balanceOf(owner.address);
  console.log("Owner token balance:", ethers.utils.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 