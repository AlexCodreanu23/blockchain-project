async function main() {
    const [owner, account1, account2] = await ethers.getSigners();
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasuryContract = await Treasury.deploy(owner.address);
    await treasuryContract.waitForDeployment();

    console.log("Treasury Contract deployed at:", treasuryContract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
