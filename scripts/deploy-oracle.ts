import {ethers} from "hardhat";

console.log("Starting Deployment");
const Oracle = await ethers.getContractFactory("UniswapV3SwapEventOracle");

const oracleInstance = await Oracle.deploy();
await oracleInstance.waitForDeployment();

console.log("zkAutoDemo deployed to:", await oracleInstance.getAddress());
