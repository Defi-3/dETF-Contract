import { ethers } from "hardhat";

async function main() {
    console.log("Starting Process");
    const graphContract = await ethers.getContractFactory("Graph");

    // after successful deployment
    const graphInstance = graphContract.attach("0xD0D0A6D9e21a23d6102Cc5F266e542bEa2126FD1"); // change the address
    const graphAddress = await graphInstance.getAddress();

    console.log(`graph deployed to: ${graphAddress}`);

    await graphInstance.deposit(ethers.parseEther("0.1"), { value: ethers.parseEther("0.1") });

    console.log("Deposited 0.1 ETH into graph");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
