async function main() {
    const [owner, account1, account2] = await ethers.getSigners();
    const Proposal = await ethers.getContractFactory("Proposal");
    const proposalContract = await Proposal.deploy(owner.address, "Test Proposal", account1.address, 100);
    await proposalContract.waitForDeployment();

    console.log("Proposal Contract deployed at:", proposalContract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
