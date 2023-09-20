import { ethers } from "hardhat";

async function main() {
  console.log("Starting Deployment");
  const lotteryManager = await ethers.getContractFactory("LotteryManager");
  const lmContract = await lotteryManager.deploy();
 await lmContract.waitForDeployment();
  console.log("lmContract deployed to:", await lmContract.getAddress());
  // Other logic, if needed
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
