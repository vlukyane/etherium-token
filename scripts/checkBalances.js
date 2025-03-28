require('dotenv').config();
const hre = require("hardhat");

async function main() {
  // Check for contract address in .env
  if (!process.env.TOKEN_ADDRESS) {
    throw new Error("TOKEN_ADDRESS not set in .env file");
  }

  // Getting token contract
  const contractAddress = process.env.TOKEN_ADDRESS;
  console.log("Using token contract address:", contractAddress);

  // Getting contract factory
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const token = await SimpleToken.attach(contractAddress);

  // Getting total supply
  const totalSupply = await token.totalSupply();
  console.log("\nTotal Supply:", ethers.utils.formatEther(totalSupply));

  // Check owner balance
  const owner = await token.owner();
  const ownerBalance = await token.balanceOf(owner);
  console.log("\nOwner Balance:", ethers.utils.formatEther(ownerBalance));

  // Check other accounts balances
  const accounts = await hre.ethers.getSigners();
  console.log("\nOther Accounts Balances:");
  for (const account of accounts) {
    const balance = await token.balanceOf(account.address);
    if (balance.gt(0)) {
      console.log(`\nAccount (${account.address}):`);
      console.log(`Balance: ${ethers.utils.formatEther(balance)} tokens`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
