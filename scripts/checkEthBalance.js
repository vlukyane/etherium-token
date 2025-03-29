require('dotenv').config();
const hre = require("hardhat");

async function main() {
  // Check for required environment variables
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("\nChecking balance for address:", signer.address);

  // Get balance
  const balance = await signer.getBalance();
  console.log("\nETH Balance:", ethers.utils.formatEther(balance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 