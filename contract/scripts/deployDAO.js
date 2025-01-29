require("@nomicfoundation/hardhat-ethers");
const {ethers} = require("hardhat");

async function main() {
  // Obține semnatarii (owner, account1, account2)
  const [owner, account1, account2] = await ethers.getSigners();

  // 1. Deploy Treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasuryContract = await Treasury.deploy(owner.address);
  await treasuryContract.waitForDeployment(); // așteaptă confirmarea deploy-ului
  console.log("Treasury deployed at:", treasuryContract.target);

  // 2. Deploy DAO
  const DAO = await ethers.getContractFactory("DAO");
  const daoContract = await DAO.deploy(treasuryContract.target);
  await daoContract.waitForDeployment();
  console.log("DAO deployed at:", daoContract.target);

  // 3. Deploy Proposal
  const Proposal = await ethers.getContractFactory("Proposal");
  const proposalContract = await Proposal.deploy(
    daoContract.target,
    "Test Proposal",
    account1.address,
    100
  );
  await proposalContract.waitForDeployment();
  console.log("Proposal deployed at:", proposalContract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
