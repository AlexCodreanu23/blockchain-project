import { expect } from "chai";
const { ethers } = require("hardhat");
import hre from "hardhat";

describe("DAO Contract", function () {
    it("should add a member", async function () {
        const [owner, account1, account2] = await hre.ethers.getSigners();
        const DAO = await ethers.getContractFactory("DAO");
        const daoContract = await DAO.deploy(owner.address);

        await daoContract.connect(owner).addMember(account1.address);
        expect(true);
    });

    it("should create a proposal", async function () {
        const [owner, account1, account2] = await hre.ethers.getSigners();
        const DAO = await ethers.getContractFactory("DAO");
        const daoContract = await DAO.deploy(owner.address);
    
        await daoContract.connect(owner).addMember(account1.address);
        await daoContract.connect(account1).createProposal("Test proposal", account2.address, 5);
        await daoContract.connect(account1).createProposal("Test proposal", account2.address, 10);

        const proposals = await daoContract.getProposals();
        console.log(proposals);
        
        // Connect to the first Proposal contract
        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = Proposal.attach(proposals[0]); // Attach to the deployed Proposal contract
        
        expect(proposals.length).to.equal(2);
    });

    it("should return all proposals", async function () {
        const [owner, account1, account2] = await hre.ethers.getSigners();
        const DAO = await ethers.getContractFactory("DAO");
        const daoContract = await DAO.deploy(owner.address);


        await daoContract.connect(owner).addMember(account1.address);
        await daoContract.connect(account1).createProposal("Proposal 1", account2.address, 5);
        await daoContract.connect(account1).createProposal("Proposal 2", account2.address, 10);

        const proposals = await daoContract.getProposals();
        expect(proposals.length).to.equal(2);
    });

    it("should finish a vote", async function () {
        const [owner, account1, account2] = await hre.ethers.getSigners();
        const DAO = await ethers.getContractFactory("DAO");
        const daoContract = await DAO.deploy(owner.address);


        await daoContract.connect(owner).addMember(account1.address);
        await daoContract.connect(account1).createProposal("Test proposal", account2.address, 5);

        await daoContract.connect(owner).finishVote(0);

        const proposals = await daoContract.getProposals();

        const Proposal = await ethers.getContractFactory("Proposal");
        const proposalContract = Proposal.attach(proposals[0]);
        const proposalData = await proposalContract.proposal();

        const status = await proposalData.status;
        expect(status).to.equal(2);
    });

    it("should execute a proposal", async function () {
        const [owner, account1, account2] = await hre.ethers.getSigners();
        const DAO = await ethers.getContractFactory("DAO");
        const Treasury = await ethers.getContractFactory("Treasury");
        const treasuryContract = await Treasury.deploy(owner.address);
        const daoContract = await DAO.connect(owner).deploy(treasuryContract.target);


        await daoContract.connect(owner).addMember(account1.address);
        await daoContract.connect(account1).createProposal("Test proposal", account2.address, 5);
        
        const proposals = await daoContract.getProposals();
        const Proposal = await ethers.getContractFactory("Proposal");
        let proposalContract = Proposal.attach(proposals[0]);

        await proposalContract.connect(account1).vote(true);
        
        await daoContract.connect(owner).finishVote(0);

        await treasuryContract.connect(owner).depositFunds({value: ethers.parseEther("11")});
        //await proposalContract.connect(owner).executeProposal(treasuryContract.target);
        await daoContract.connect(owner).executeProposal(0);
        
        
        proposalContract = Proposal.attach(proposals[0]);
        const proposalData = await proposalContract.proposal();
        const status = proposalData.status;
        expect(status).to.equal(3);
    });

    it("its a valid sum", async function() {
        const [owner, account1, account2] = await hre.ethers.getSigners();
        const DAO = await ethers.getContractFactory("DAO");
        const Treasury = await ethers.getContractFactory("Treasury");
        const treasuryContract = await Treasury.deploy(owner.address);
        const daoContract = await DAO.connect(owner).deploy(treasuryContract.target);

        const stat = await daoContract.connect(owner).isValidAmount(15);
        expect(stat).to.equal(true);
    });
});
