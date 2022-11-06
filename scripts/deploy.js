const hre = require("hardhat");

async function main() {

  const Dex = await hre.ethers.getContractFactory("Dex");
  const dex = await Dex.deploy();
  await dex.deployed();
  console.log("dex deployed to:", dex.address);

  const Token1 = await hre.ethers.getContractFactory("BirdToken");
  const token1 = await Token1.deploy();
  await token1.deployed();
  console.log("token bird deployed to:", token1.address);

  const Token2 = await hre.ethers.getContractFactory("CatToken");
  const token2 = await Token2.deploy();
  await token2.deployed();
  console.log("token cat deployed to:", token2.address);

  const Token3 = await hre.ethers.getContractFactory("DogToken");
  const token3 = await Token3.deploy();
  await token3.deployed();
  console.log("token dog deployed to:", token3.address);

  const Token4 = await hre.ethers.getContractFactory("WETH");
  const token4 = await Token4.deploy();
  await token4.deployed();
  console.log("token weth deployed to:", token4.address);

};


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
