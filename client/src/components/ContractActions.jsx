import React, { useState, useEffect  } from "react";
import { depositFund } from "../utils/contractServices";
import { withdrawFund } from "../utils/contractServices";
import {createProposal} from "../utils/contractServices";
import { getProposals } from "../utils/contractServices";
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

        const updatedProposals = await getProposals();
        setProposals(updatedProposals);
      }
    }catch(error){
      toast.error(error?.reason || "An error occurred while creating the proposal.");
    }
  }

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
        <input text = "text"
              value = {proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="Proposal description"/>
        <input text = "text"
                value = {proposalRecipient}
                onChange={(e) => setProposalRecipient(e.target.value)}
                placeholder="Proposal recipient"/>
        <input text = "text"
                value = {proposalAmount}
                onChange={(e) => setProposalAmount(e.target.value)}
                placeholder="Amount in ETH"/>
        <button onClick = {handleCreateProposal}>Create a proposal</button>
      </div>
      <div>
        <h2>Proposals</h2>
        <ul>
          {proposals.map((proposal, index) => (
            <li key={index}>
              Proposal Address: {proposal.address}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ContractActions;
