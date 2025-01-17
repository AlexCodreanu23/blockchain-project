
async function main() {
  const [owner, account1, account2] = await ethers.getSigners();

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasuryContract = await Treasury.deploy(owner.address);
  await treasuryContract.waitForDeployment(); 
  console.log("Treasury deployed at:", treasuryContract.address);

  const DAO = await ethers.getContractFactory("DAO");
  const daoContract = await DAO.deploy(await treasuryContract.getAddress());
  await daoContract.waitForDeployment();
  console.log("DAO deployed at:",  daoContract.address);

  const Proposal = await ethers.getContractFactory("Proposal");
  const proposalContract = await Proposal.deploy(
    await daoContract.getAddress(),
    "Test Proposal",
    account1.address,
    100
  );
  await proposalContract.waitForDeployment();
  console.log("Proposal deployed at:", proposalContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
