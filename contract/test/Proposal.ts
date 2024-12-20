import { expect } from "chai";
const { ethers } = require("hardhat");
import hre from "hardhat";


/*
beforeEach(async function() {
    [owner, account1, account2, treasuryAddress] = await hre.ethers.getSigners();
    Proposal = await ethers.getContractFactory("Proposal");
    proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100);
    await proposalContract.deployed();
});
*/

describe("Proposal", function() {
    it("should create a new proposal", async function() {
        const [owner, account1, account2, treasuryAddress] = await hre.ethers.getSigners();
        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100);
        const proposalData = await proposalContract.proposal();


        expect(proposalData.description).to.equal("Test Proposal");
        expect(proposalData.proposer).to.equal(owner.address);
        expect(proposalData.votesFor).to.equal(0);
        expect(proposalData.votesAgainst).to.equal(0);
        expect(proposalData.status).to.equal(0); // Pending
        expect(proposalData.recipient).to.equal(account1.address);
        expect(proposalData.amount).to.equal(100);
    });

    it("should allow voting and update vote counts", async function() {
        const [owner, account1, account2, treasuryAddress] = await hre.ethers.getSigners();
        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100);
        await proposalContract.connect(account1).vote(true);
        let proposalData = await proposalContract.proposal();

        expect(proposalData.votesFor).to.equal(1);
        expect(proposalData.votesAgainst).to.equal(0);

        await proposalContract.connect(account2).vote(false);
        proposalData = await proposalContract.proposal();

        expect(proposalData.votesFor).to.equal(1);
        expect(proposalData.votesAgainst).to.equal(1);
    });

    
    it("should finalize voting and update status to Approved", async function() {
        const [owner, account1, account2, treasuryAddress] = await hre.ethers.getSigners();
        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100);
        await proposalContract.connect(account1).vote(true);
        await proposalContract.connect(account2).vote(true);

        await proposalContract.connect(owner).finishVote();

        const proposalData = await proposalContract.proposal();
        expect(proposalData.status).to.equal(1); // Approved
    });

    it("should finalize voting and update status to Rejected", async function() {
        const [owner, account1, account2, treasuryAddress] = await hre.ethers.getSigners();
        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100);
        await proposalContract.connect(account1).vote(false);
        await proposalContract.connect(account2).vote(false);

        await proposalContract.connect(owner).finishVote();

        const proposalData = await proposalContract.proposal();
        expect(proposalData.status).to.equal(2); // Rejected
    });

    it("should execute an approved proposal", async function() {
        const [owner, account1, account2] = await hre.ethers.getSigners();
        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 10);
    
        const Treasury = await ethers.getContractFactory("Treasury");
        const treasuryContract = await Treasury.deploy(proposalContract.target); // Set Proposal as DAO
        await treasuryContract.depositFunds({value: ethers.parseEther("11")});
    
        await proposalContract.connect(account1).vote(true);
        await proposalContract.connect(account2).vote(true);
        await proposalContract.connect(owner).finishVote();
    
        await proposalContract.connect(owner).executeProposal(treasuryContract.target);
    
        const proposalData = await proposalContract.proposal();
        expect(proposalData.status).to.equal(3); // Executed
    });
    

    it("should not execute a rejected proposal", async function() {
        const [owner, account1, account2, treasuryAddress] = await hre.ethers.getSigners();
        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100);
        await proposalContract.connect(account1).vote(false);
        await proposalContract.connect(account2).vote(false);
        await proposalContract.connect(owner).finishVote();

        await expect(
            proposalContract.connect(owner).executeProposal(treasuryAddress.address)
        ).to.be.revertedWith("This proposal is not Approved");
    });
});
