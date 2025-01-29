

async function main() {
    const [owner, account1, account2] = await ethers.getSigners();
    const Proposal = await ethers.getContractFactory("Proposal");
    const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100); // Deploys the contract`

    console.log("Proposal deployed to:", proposalContract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
