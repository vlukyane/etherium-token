const hre = require("hardhat");

async function main() {
  // Deploy the token contract
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const token = await SimpleToken.deploy("SimpleToken", "SMPL");
  await token.deployed();

  console.log("SimpleToken deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 