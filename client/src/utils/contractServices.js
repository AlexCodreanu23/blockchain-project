import Lock_ABI from "./Lock_ABI.json";
import DAO_ABI from "./DAO_ABI.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import {DAO_ADDRESS} from "./daoAddress"; 
import { ethers } from "ethers";

// Module-level variables to store provider, signer, and contract
let provider;
let signer;
let contract;
let daoContract;

console.log("AAAAAAAAAAAAAAAA", DAO_ADDRESS);
console.log("BBBBBBBBBBBBBBBBB", DAO_ABI);
// Function to initialize the provider, signer, and contract
const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, Lock_ABI, signer);
    daoContract = new Contract(DAO_ADDRESS, DAO_ABI, signer);
    console.log(daoContract);
  } else {
    console.error("Please install MetaMask!");
  }
  if(typeof daoContract == "undefined"){
    console.log("fnjsfdklaslas");
  }
};

// Initialize once when the module is loaded
await initialize();
if(typeof daoContract == "undefined"){
  console.log("bsakdfasd");
}
console.log("DDDDDDDDDDDDDDDDDDD",contract);
console.log("EEEEEEEEEEEEEEEEEEEEE", daoContract);

// Function to request single account
export const requestAccount = async () => {
  try {
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0]; // Return the first account
  } catch (error) {
    console.error("Error requesting account:", error.message);
    return null;
  }
};
// Function to get contract balance in ETH
export const getContractBalanceInETH = async () => {
  const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
  const balanceEth = formatEther(balanceWei); // Convert Wei to ETH string
  return balanceEth; // Convert ETH string to number
};

// Function to deposit funds to the contract
export const depositFund = async (depositValue) => {
  const ethValue = parseEther(depositValue);
  const deposit = await contract.deposit({ value: ethValue });
  await deposit.wait();
};

// Function to withdraw funds from the contract
export const withdrawFund = async () => {
  const withdrawTx = await contract.withdraw();
  await withdrawTx.wait();
  console.log("Withdrawal successful!");
};

export const createProposal = async (description, recipient, amount) => {
  try{
    if(typeof daoContract == "undefined"){
      console.log("ZZZZZZZZZZZZZ");
    }
    
    const estimatedGas = await daoContract.createProposal.estimateGas(
      description,
      recipient,
      amount
    );
    console.log(`Estimated Gas: ${estimatedGas.toString()}`);

    // Calculam costul gasului
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice; 
    if (!gasPrice) {
      console.error("Could not retrieve a gas price from the provider.");
      return;
    }
    console.log(`Gas Price: ${ethers.formatEther(gasPrice)} ETH`);

    // Calculam costul total
    const totalCost = estimatedGas * gasPrice; 
    const totalCostEth = ethers.formatEther(totalCost);
    console.log(`Total Estimated Cost: ${totalCostEth} ETH`);

    const maxAllowedCost = ethers.parseEther("0.05"); 
    if(totalCost > maxAllowedCost){
      console.error(
        `Costul estimat (${totalCostEth} ETH) depaseste limita setata (${ethers.formatEther(maxAllowedCost)} ETH).`
      );
      return;
    }

    // Efectuam tranzactia
    const tx = await daoContract.createProposal(description, recipient, amount, {
      gasLimit: estimatedGas
    });
    await tx.wait();
    console.log("Proposal created successfully:", tx);
  }catch(error){
    console.log("An error has occured:", error.message);
  }
};

export const getProposals = async () => {
  try {
    const proposalAddresses = await daoContract.getProposals();
    return proposalAddresses.map((address) => ( { address } ));
  } catch (error) {
    console.error("Error fetching proposals:", error.message);
    return [];
  }
};

export const finishVote = async (proposalIndex) => {
  try{
    const tx = await daoContract.finishVote(proposalIndex);
    await tx.wait();
    console.log("finishVote a fost apelat");
  }catch(error){
    console.log("A aparut o eroare: ", error);
  }
}

export const executeProposal = async (proposalIndex) => {
  try{
    const tx = await daoContract.executeProposal(proposalIndex);
    await tx.wait();
    console.log("Executia a functionat");
  }catch(error){
    console.log("A aparut o eroare: ", error);
  }
}
