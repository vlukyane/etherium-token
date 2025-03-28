const { ethers } = require("ethers");

async function main() {
  // Connect to local Hardhat network
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get list of accounts
  const accounts = await provider.listAccounts();
  
  console.log("\n=== Private Keys ===");
  console.log("Note: In Hardhat, private keys are generated following a specific pattern");
  
  // Display private keys for each account
  for (const account of accounts) {
    console.log(`\nAccount (${account}):`);
    // Get private key from account
    const privateKey = await provider.getSigner(account).getPrivateKey();
    console.log(`Private Key: ${privateKey}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 