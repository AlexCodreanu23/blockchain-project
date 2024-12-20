import { expect } from "chai";
const { ethers } = require("hardhat");
import hre from "hardhat";


describe("Treasury", function(){
    it("should deposit money and release money", async function() {
        const [owner, account2, account3] = await hre.ethers.getSigners();
        const Treasury = await ethers.getContractFactory("Treasury");
        const treasury = await Treasury.deploy(owner);

        await treasury.depositFunds({value: ethers.parseEther("1")});


        const balance = await treasury.getBalance();
        console.log(ethers.formatEther(balance));
        await treasury.releaseFunds(account2,ethers.parseEther("0.5"));
        const balanceF = await treasury.getBalance();
        console.log(ethers.formatEther(balanceF));
        expect(balanceF).to.equal(ethers.parseEther("0.5"));

    });
});