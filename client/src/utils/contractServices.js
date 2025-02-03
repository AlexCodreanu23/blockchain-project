import Lock_ABI from "./Lock_ABI.json";
import DAO_ABI from "./DAO_ABI.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import eventEmitter from "./EventEmitter";
import { DAO_ADDRESS } from "./daoAddress";
import { ethers } from "ethers";

// Module-level variables to store provider, signer, and contract
let provider;
let signer;
let contract;
let daoContract;


// Function to initialize the provider, signer, and contract
const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, Lock_ABI, signer);
    daoContract = new Contract(DAO_ADDRESS, DAO_ABI, signer);
    console.log(daoContract);

    // Ascultăm direct pe contract evenimentul "ProposalCreated"
    daoContract.on("ProposalCreated", (proposalAddress, description) => {
      console.log(
        "New proposal created (Event received from contract):",
        proposalAddress,
        description
      );
      eventEmitter.emit("ProposalCreated", { proposalAddress, description });
    });
  } else {
    console.error("Please install MetaMask!");
  }
};

// Initialize once when the module is loaded
await initialize();

if (typeof daoContract == "undefined") {
  console.log("DAO Contract is undefined!");
}


// Function to request single account
export const requestAccount = async () => {
  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0]; 
  } catch (error) {
    console.error("Error requesting account:", error.message);
    return null;
  }
};

export const getContractBalanceInETH = async () => {
  const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
  const balanceEth = formatEther(balanceWei); 
  return balanceEth; 
};


export const depositFund = async (depositValue) => {
  const ethValue = parseEther(depositValue);
  const deposit = await contract.deposit({ value: ethValue });
  await deposit.wait();
};

export const withdrawFund = async () => {
  const withdrawTx = await contract.withdraw();
  await withdrawTx.wait();
  console.log("Withdrawal successful!");
};

export const createProposal = async (description, recipient, amount) => {
  try {
    if (typeof daoContract == "undefined") {
      console.log("DAO contract is undefined, cannot create proposal!");
      return;
    }

    const estimatedGas = await daoContract.createProposal.estimateGas(
      description,
      recipient,
      amount
    );
    console.log(`Estimated Gas: ${estimatedGas.toString()}`);

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    if (!gasPrice) {
      console.error("Could not retrieve a gas price from the provider.");
      return;
    }
    console.log(`Gas Price: ${ethers.formatEther(gasPrice)} ETH`);

    const totalCost = estimatedGas * gasPrice;
    const totalCostEth = ethers.formatEther(totalCost);
    console.log(`Total Estimated Cost: ${totalCostEth} ETH`);

    const maxAllowedCost = ethers.parseEther("0.05");
    if (totalCost > maxAllowedCost) {
      console.error(
        `Costul estimat (${totalCostEth} ETH) depaseste limita setata (${ethers.formatEther(
          maxAllowedCost
        )} ETH).`
      );
      return;
    }

    const tx = await daoContract.createProposal(description, recipient, amount, {
      gasLimit: estimatedGas,
    });
    const receipt = await tx.wait();
    console.log("Proposal created successfully:", receipt);
    console.log(receipt.logs);
    
  } catch (error) {
    console.log("An error has occured:", error.message);
    throw error;
  }
};

export const getProposals = async () => {
  try {
    const proposalAddresses = await daoContract.getProposals();
    return proposalAddresses.map((address) => ({ address }));
  } catch (error) {
    console.error("Error fetching proposals:", error.message);
    return [];
  }
};

export const finishVote = async (proposalIndex) => {
  try {
    const tx = await daoContract.finishVote(proposalIndex);
    await tx.wait();
    console.log("finishVote a fost apelat");
  } catch (error) {
    console.log("A aparut o eroare: ", error);
    throw error;
  }
};

export const executeProposal = async (proposalIndex) => {
  try {
    const tx = await daoContract.executeProposal(proposalIndex);
    await tx.wait();
    console.log("Executia a functionat");
  } catch (error) {
    console.log("A aparut o eroare: ", error);
    throw error;
  }
};

export function getDaoContract() {
  return daoContract;
}


///Realizare Observer Pattern 
/*
Dacă UI-ul primește evenimentul prin daoContract.on("ProposalCreated", ...) și toast-ul apare, înseamnă că evenimentul este emis și capturat de abonare, chiar dacă receipt.logs rămâne gol.
Acesta este un comportament posibil dacă providerul primește evenimentul din rețea în mod asincron, dar nu-l atașează în receipt-ul tranzacției.
*/