import Lock_ABI from "./Lock_ABI.json";
import DAO_ABI from "./DAO_ABI.json";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import {DAO_ADDRESS} from "./daoAddress"; 


let provider;
let signer;
let contract;
let daoContract;



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
};


// Initialize once when the module is loaded
await initialize();
console.log(contract);
console.log(daoContract);

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
  try{
    const tx = await daoContract.createProposal(description, recipient, amount);
    await tx.wait();
    console.log("Proposal created succesfully");
  }catch(error){
    console.log("An error has occured:", error.message);
  }
};

export const getProposals = async () => {
  try {
    const proposalAddresses = await daoContract.getProposals();
    return proposalAddresses.map((address) => ({
      address: address.toString(),
    }));
  } catch (error) {
    console.error("Error fetching proposals:", error.message);
    return [];
  }
};
