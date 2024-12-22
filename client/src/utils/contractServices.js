import Lock_ABI from "./Lock_ABI.json";
import DAO_ABI from "./DAO_ABI.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import {DAO_ADDRESS} from "./daoAddress"; 

// Module-level variables to store provider, signer, and contract
let provider;
let signer;
let contract;
let daoContract;

console.log(DAO_ADDRESS);
console.log(DAO_ABI);
// Function to initialize the provider, signer, and contract
const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(CONTRACT_ADDRESS, Lock_ABI, signer);
    daoContract = new Contract(DAO_ADDRESS, DAO_ABI, signer);
  } else {
    console.error("Please install MetaMask!");
  }
};

// Initialize once when the module is loaded
initialize();

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
    const tx = await daoContract.createProposal(description, recipient, amount);
    await tx.wait();
    console.log("Proposal created succesfully");
  }catch(error){
    console.log("An error has occured:", error.message);
  }
};
