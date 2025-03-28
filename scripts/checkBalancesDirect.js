require('dotenv').config();
const hre = require("hardhat");
const { ethers } = require("ethers");
const SimpleToken = require("../frontend/src/artifacts/contracts/SimpleToken.sol/SimpleToken.json");

async function main() {
  // Check for contract address in .env
  if (!process.env.TOKEN_ADDRESS) {
    throw new Error("TOKEN_ADDRESS not set in .env file");
  }

  // Getting token contract
  const contractAddress = process.env.TOKEN_ADDRESS;
  console.log("Using token contract address:", contractAddress);

  // Getting contract factory
  const SimpleTokenFactory = await hre.ethers.getContractFactory("SimpleToken");
  const token = await SimpleTokenFactory.attach(contractAddress);

  // Getting total supply
  const totalSupply = await token.totalSupply();
  console.log("\nTotal Supply:", ethers.utils.formatEther(totalSupply));

  // Getting owner balance
  const owner = await token.owner();
  const ownerBalance = await token.balanceOf(owner);
  console.log("\nOwner Balance:", ethers.utils.formatEther(ownerBalance));

  // Getting swap contract balance
  if (process.env.SWAP_CONTRACT_ADDRESS) {
    const swapBalance = await token.balanceOf(process.env.SWAP_CONTRACT_ADDRESS);
    console.log("\nSwap Contract Balance:", ethers.utils.formatEther(swapBalance));
  }

  // Getting signer address
  const [signer] = await hre.ethers.getSigners();
  console.log("\nSigner Address:", signer.address);

  // Getting signer balance
  const signerBalance = await token.balanceOf(signer.address);
  console.log("Signer Balance:", ethers.utils.formatEther(signerBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 