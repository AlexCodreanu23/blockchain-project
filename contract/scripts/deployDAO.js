async function main() {
    const [owner, account1, account2] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAO");
    const daoContract = await DAO.deploy(owner.address);
    await daoContract.waitForDeployment();

    console.log("DAO Contract deployed at:", daoContract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });