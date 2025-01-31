import { expect } from "chai";
const { ethers } = require("hardhat");
import hre from "hardhat";



describe("Treasury", function(){
    it("should deposit money and release money", async function() {
        const [owner, account2, account3] = await hre.ethers.getSigners();
        const Treasury = await ethers.getContractFactory("Treasury");
        const treasury = await Treasury.deploy(owner);

        await treasury.depositFunds({value: ethers.parseEther("10")});


        const balance = await treasury.getBalance();
        console.log(ethers.formatEther(balance));
        await treasury.allocateFunds(account2,ethers.parseEther("2"));
        const balanceF = await treasury.getBalance();
        console.log(ethers.formatEther(balanceF));


        const balanceUserBefore = await ethers.provider.getBalance(account2.address);
        console.log("Account2 Balance Before Withdrawal:", ethers.formatEther(balanceUserBefore));
        await treasury.connect(account2).withdrawFunds();
        
        const balanceUserAfter = await ethers.provider.getBalance(account2.address);
        console.log("Account2 Balance After Withdrawal:", ethers.formatEther(balanceUserAfter));
        
        
        expect(balanceF).to.equal(ethers.parseEther("8"));

    });
});