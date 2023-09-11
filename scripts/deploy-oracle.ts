import {ethers} from "hardhat";

async function main() {
    console.log("Starting Deployment");
    const Oracle = await ethers.getContractFactory("UniswapV2SyncEventOracle");

    const oracleInstance = await Oracle.deploy();
    await oracleInstance.waitForDeployment();

    console.log("UniswapV2SyncEventOracle deployed to:", await oracleInstance.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
