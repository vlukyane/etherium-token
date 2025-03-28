const { ethers } = require("ethers");

async function main() {
  // Connect to local Hardhat network
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get list of accounts
  const accounts = await provider.listAccounts();
  
  console.log("\n=== Accounts ===");
  accounts.forEach((account, index) => {
    console.log(`\nAccount ${index + 1}:`);
    console.log(`Address: ${account}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 