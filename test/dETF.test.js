const { expect } = require('chai');
const { ethers } = require("hardhat");

describe('dETF', () => {

    let dETFContract;
    let dETFInstance;

    beforeEach(async() => {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const MintableToken = await ethers.getContractFactory("MintableToken");

        const wbtc = await MintableToken.deploy("Wrapped Bitcoin", "WBTC");
        await wbtc.waitForDeployment();
        const weth = await MintableToken.deploy("Wrapped Ether", "WETH");
        await weth.waitForDeployment();
        const wbtcAddress = await wbtc.getAddress();
        const wethAddress = await weth.getAddress();

        await wbtc.mint(owner.address, 1000000000000000000000000n);
        await weth.mint(owner.address, 1000000000000000000000000n);
        const DemoVault = await ethers.getContractFactory("DemoVault");
        const demoVault = await DemoVault.deploy(wbtcAddress, wethAddress);
        await demoVault.waitForDeployment();

        const demoVaultAddress = await demoVault.getAddress();

        const depositAmount = 1000000000000000000000000n;

        await demoVault.deposit(wbtcAddress, depositAmount);
        await demoVault.deposit(wethAddress, depositAmount);

        dETFInstance = await ethers.getContractFactory("dETF");
        dETFContract = await dETFInstance.deploy(
            [wbtcAddress, wethAddress],
            [19000000000000n, 300000000000000n],
            "dETF Token",
            "dETF"
        );

        await dETFContract.waitForDeployment();

        await dETFContract.setDemoVaultContract(demoVaultAddress);
        await dETFContract.setGraphContract(owner.address);

        await wbtc.approve(await dETFContract.getAddress(), depositAmount);
        await weth.approve(await dETFContract.getAddress(), depositAmount);
    });

    it("should do the rebalance properly", async () => {


        const newPrice1 = 24000000000000n * 1000000000000000000n / 300000000000000n;

        //const result = await dETFContract.rebalance(newPrice);

        await expect(dETFContract.rebalance(newPrice1)).to.emit(dETFContract, "reBalanceSuc").withArgs(24000000000000n,300000000000000n,13);


        await dETFContract.invest(1000000000000000000n);

        const newPrice2 = 20000000000000n * 1000000000000000000n / 300000000000000n;
        await expect(dETFContract.rebalance(newPrice2)).to.emit(dETFContract, "reBalanceSuc").withArgs(22000000000000n,300133333333333n,15);

    });
});