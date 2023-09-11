import { ethers } from "hardhat";

async function main() {
    // Step 1: Deploy WBTC and WETH MintableTokens
    console.log("Starting Deployment");
    const graphContract = await ethers.getContractFactory("Graph");

    // after successful deployment
    const graphInstance = graphContract.attach("0x262b08D7B5AAB3841122B56B40B2B773b7b86681");
    const graphAddress = await graphInstance.getAddress();

    console.log(`graph deployed to: ${graphAddress}`);

    // Other logic, if needed
    await graphInstance.depsoit(ethers.parseEther("0.1"), { value: ethers.parseEther("0.1") });

    console.log("Deposited 0.1 ETH into graph");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
