import React, { useEffect, useState } from "react";
import { depositFund } from "../utils/contractServices";
import { withdrawFund } from "../utils/contractServices";
import {createProposal, getProposals, finishVote, executeProposal} from "../utils/contractServices";
import { toast } from "react-toastify";

function ContractActions() {
  const [depositValue, setDepositValue] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalRecipient, setProposalRecipient] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const fetchProposals = async () => {
      const proposalsData = await getProposals();
      setProposals(proposalsData);
    };

    fetchProposals();
  }, []);

  const handleDeposit = async () => {
    try {
      await depositFund(depositValue);
    } catch (error) {
      toast.error(error?.reason);
    }
    setDepositValue("");
  };

  const handleWithdraw = async () => {
    try {
      await withdrawFund();
    } catch (error) {
      toast.error(error?.reason);
    }
  };

  const handleCreateProposal = async () =>{
    try{
      if(!proposalDescription || !proposalRecipient || !proposalAmount){
        toast.error("Please fill all the fields for the proposal");
        return;
      }
      else{
        const floatAmount = parseFloat(proposalAmount);
        await createProposal(proposalDescription, proposalRecipient, floatAmount);
        toast.success("The proposal has been created!");
        setProposalDescription("");
        setProposalRecipient("");
        setProposalAmount("");

        const newProposal = await getProposals();
        setProposals(newProposal);
      }
    }catch(error){
      toast.error(error?.reason || "An error occurred while creating the proposal.");
    }
  }

  const handleFinishVote = async (proposalIndex) => {
    try {
      await finishVote(proposalIndex);
      toast.success(`FinishVote reușit pentru proposalIndex = ${proposalIndex}`);
    } catch (error) {
      toast.error(error?.reason || "Eroare la finishVote");
    }
  };

  const handleExecuteProposal = async (proposalIndex) => {
    try{
      await executeProposal(proposalIndex);
      toast.success(`FinishVote reușit pentru proposalIndex = ${proposalIndex}`);
    } catch (error) {
      toast.error(error?.reason || "Eroare la finishVote");
    }
  };

  return (
    <div>
      <h2>Contract Actions</h2>

      <div>
        <input
          type="text"
          value={depositValue}
          onChange={(e) => setDepositValue(e.target.value)}
          placeholder="Amount in ETH"
        />
        <button onClick={handleDeposit}>Deposit Funds</button>
      </div>
      
      <br />
      
      <div>
        <button onClick={handleWithdraw}>Withdraw Funds</button>
      </div>

      <div>
        <h2>Create a proposal</h2>
        <input
          type="text"
          value={proposalDescription}
          onChange={(e) => setProposalDescription(e.target.value)}
          placeholder="Proposal description"
        />
        <input
          type="text"
          value={proposalRecipient}
          onChange={(e) => setProposalRecipient(e.target.value)}
          placeholder="Proposal recipient (address)"
        />
        <input
          type="text"
          value={proposalAmount}
          onChange={(e) => setProposalAmount(e.target.value)}
          placeholder="Amount in ETH"
        />
        <button onClick={handleCreateProposal}>Create a proposal</button>
      </div>

      <div>
        <h1>Proposals</h1>
        <ul>
          {proposals.map((proposal, index) => (
            <li key={index}>
              <div>Proposal Address: {proposal.address}</div>
              {/* Buton pentru a apela finishVote pe proposalIndex = index */}
              <button onClick={() => handleFinishVote(index)}>Finish Vote</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ContractActions;
