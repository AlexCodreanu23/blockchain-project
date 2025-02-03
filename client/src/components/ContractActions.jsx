import React, { useEffect, useState } from "react";
import { depositFund, withdrawFund, createProposal, getProposals, finishVote, executeProposal } from "../utils/contractServices";
import { toast } from "react-toastify";
import eventEmitter from "../utils/EventEmitter";

function ContractActions() {
  const [depositValue, setDepositValue] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalRecipient, setProposalRecipient] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposals, setProposals] = useState([]);

  const [txStatusDeposit, setTxStatusDeposit] = useState("idle"); // idle, pending, success, error
  const [txStatusWithdraw, setTxStatusWithdraw] = useState("idle");
  const [txStatusCreate, setTxStatusCreate] = useState("idle");

  useEffect(() => {
    const fetchProposals = async () => {
      const proposalsData = await getProposals();
      setProposals(proposalsData);
    };
    fetchProposals();
  }, []);

  useEffect(() => {
    const handleProposalCreated = (data) => {
      toast.success("New proposal has been created");
      getProposals().then(setProposals);
    };

    eventEmitter.on("ProposalCreated", handleProposalCreated);
    return () => {
      eventEmitter.off("ProposalCreated", handleProposalCreated);
    };
  }, []);
  
  const handleDeposit = async () => {
    if (!depositValue) {
      toast.error("Please fill in with a value for funding!");
      return;
    }
    setTxStatusDeposit("pending");
    try {
      await depositFund(depositValue);
      setTxStatusDeposit("success");
      toast.success(`Funding succeded with ${depositValue} ETH!`);
    } catch (error) {
      setTxStatusDeposit("error");
      toast.error(error?.reason || error.message || "Funding error!");
    } finally {
      setDepositValue("");
    }
  };

  const handleWithdraw = async () => {
    setTxStatusWithdraw("pending");
    try {
      await withdrawFund();
      setTxStatusWithdraw("success");
      toast.success("Withdrawal succeded!");
    } catch (error) {
      setTxStatusWithdraw("error");
      toast.error(error?.reason || error.message || "Withdrawal error!");
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalDescription || !proposalRecipient || !proposalAmount) {
      toast.error("Please fill all the fields for the proposal");
      return;
    }
    setTxStatusCreate("pending");
    try {
      const floatAmount = parseFloat(proposalAmount);
      await createProposal(proposalDescription, proposalRecipient, floatAmount);
      setTxStatusCreate("success");
      toast.success("The proposal has been created!");
      setProposalDescription("");
      setProposalRecipient("");
      setProposalAmount("");

      const newProposals = await getProposals();
      setProposals(newProposals);
    } catch (error) {
      setTxStatusCreate("error");
      toast.error(
        error?.reason || error.message || "An error occurred while creating the proposal."
      );
    }
  };

  const handleFinishVote = async (proposalIndex) => {
    try {
      await finishVote(proposalIndex);
      toast.success(`FinishVote succeded for index = ${proposalIndex}`);
    } catch (error) {
      toast.error(error?.reason || "FinishVote error!");
    }
  };

  const handleExecuteProposal = async (proposalIndex) => {
    try {
      await executeProposal(proposalIndex);
      toast.success(`Executia a reușit pentru proposalIndex = ${proposalIndex}`);
    } catch (error) {
      toast.error(error?.reason || "Execution error!");
    }
  };

  return (
    <div>
      <h2>Contract Actions</h2>

      {/* Deposit */}
      <div>
        <input
          type="text"
          value={depositValue}
          onChange={(e) => setDepositValue(e.target.value)}
          placeholder="Amount in ETH"
        />
        <button onClick={handleDeposit} disabled={txStatusDeposit === "pending"}>
          {txStatusDeposit === "pending" ? "Processing..." : "Deposit Funds"}
        </button>
      </div>
      {txStatusDeposit === "error" && <p style={{ color: "red" }}>Eroare la depozitare!</p>}
      {txStatusDeposit === "success" && <p style={{ color: "green" }}>Depozit reușit!</p>}

      <br />

      {/* Withdraw */}
      <div>
        <button onClick={handleWithdraw} disabled={txStatusWithdraw === "pending"}>
          {txStatusWithdraw === "pending" ? "Processing..." : "Withdraw Funds"}
        </button>
      </div>
      {txStatusWithdraw === "error" && <p style={{ color: "red" }}>Eroare la withdraw!</p>}
      {txStatusWithdraw === "success" && <p style={{ color: "green" }}>Withdraw reușit!</p>}

      {/* Create Proposal */}
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
        <button onClick={handleCreateProposal} disabled={txStatusCreate === "pending"}>
          {txStatusCreate === "pending" ? "Processing..." : "Create a proposal"}
        </button>
      </div>
      {txStatusCreate === "error" && <p style={{ color: "red" }}>Eroare la creare propunere!</p>}
      {txStatusCreate === "success" && (
        <p style={{ color: "green" }}>Propunere creată cu succes!</p>
      )}

      {/* Proposals list */}
      <div>
        <h1>Proposals</h1>
        <ul>
          {proposals.map((proposal, index) => (
            <li key={index}>
              <div>Proposal Address: {proposal.address}</div>
              <button onClick={() => handleFinishVote(index)}>Finish Vote</button>
              <button onClick={() => handleExecuteProposal(index)}>Execute Proposal</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ContractActions;
