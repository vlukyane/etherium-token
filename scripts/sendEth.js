const { ethers } = require("ethers");

async function main() {
  // Connect to local Hardhat network
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get list of accounts
  const accounts = await provider.listAccounts();
  
  // Send 0.1 ETH (amount can be modified)
  const amount = ethers.utils.parseEther("0.1");
  
  // Send transaction
  const tx = await provider.getSigner(accounts[0]).sendTransaction({
    to: accounts[1],
    value: amount
  });
  
  // Wait for transaction to be mined
  await tx.wait();
  
  console.log("Transaction sent successfully!");
  console.log("Transaction hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 