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

  console.log("\nUsing addresses:");
  console.log("Token:", tokenAddress);
  console.log("Swap:", swapAddress);
  console.log("Owner:", owner.address);

  // Get contract instances
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  
  const token = await SimpleToken.attach(tokenAddress);
  const swapContract = await TokenSwap.attach(swapAddress);

  // Check initial balances
  console.log("\nInitial balances:");
  const initialTokenBalance = await token.balanceOf(owner.address);
  const initialEthBalance = await ethers.provider.getBalance(owner.address);
  const initialSwapTokenBalance = await token.balanceOf(swapAddress);
  const initialSwapEthBalance = await ethers.provider.getBalance(swapAddress);

  console.log("Owner SMPL balance:", ethers.utils.formatEther(initialTokenBalance));
  console.log("Owner ETH balance:", ethers.utils.formatEther(initialEthBalance));
  console.log("Swap SMPL balance:", ethers.utils.formatEther(initialSwapTokenBalance));
  console.log("Swap ETH balance:", ethers.utils.formatEther(initialSwapEthBalance));

  // Test swapping tokens for ETH
  console.log("\nTesting swap tokens for ETH...");
  const tokenAmount = ethers.utils.parseEther("100"); // Swap 100 tokens for 1 ETH

  // First approve tokens
  console.log("Approving tokens...");
  const approveTx = await token.approve(swapAddress, tokenAmount);
  await approveTx.wait();
  console.log("Tokens approved");

  // Execute swap
  console.log("Executing swap...");
  const swapTx = await swapContract.swapTokensForEth(tokenAmount);
  await swapTx.wait();
  console.log("Swap completed");

  // Check balances after first swap
  console.log("\nBalances after swapping tokens for ETH:");
  const midTokenBalance = await token.balanceOf(owner.address);
  const midEthBalance = await ethers.provider.getBalance(owner.address);
  const midSwapTokenBalance = await token.balanceOf(swapAddress);
  const midSwapEthBalance = await ethers.provider.getBalance(swapAddress);

  console.log("Owner SMPL balance:", ethers.utils.formatEther(midTokenBalance));
  console.log("Owner ETH balance:", ethers.utils.formatEther(midEthBalance));
  console.log("Swap SMPL balance:", ethers.utils.formatEther(midSwapTokenBalance));
  console.log("Swap ETH balance:", ethers.utils.formatEther(midSwapEthBalance));

  // Test swapping ETH for tokens
  console.log("\nTesting swap ETH for tokens...");
  const ethAmount = ethers.utils.parseEther("1"); // Swap 1 ETH for 100 tokens

  // Execute swap
  console.log("Executing swap...");
  const swapTx2 = await swapContract.swapEthForTokens({ value: ethAmount });
  await swapTx2.wait();
  console.log("Swap completed");

  // Check final balances
  console.log("\nFinal balances:");
  const finalTokenBalance = await token.balanceOf(owner.address);
  const finalEthBalance = await ethers.provider.getBalance(owner.address);
  const finalSwapTokenBalance = await token.balanceOf(swapAddress);
  const finalSwapEthBalance = await ethers.provider.getBalance(swapAddress);

  console.log("Owner SMPL balance:", ethers.utils.formatEther(finalTokenBalance));
  console.log("Owner ETH balance:", ethers.utils.formatEther(finalEthBalance));
  console.log("Swap SMPL balance:", ethers.utils.formatEther(finalSwapTokenBalance));
  console.log("Swap ETH balance:", ethers.utils.formatEther(finalSwapEthBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 