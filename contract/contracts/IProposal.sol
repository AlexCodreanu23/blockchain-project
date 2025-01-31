// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProposal {
    enum ProposalStatus {Pending, Approved, Rejected, Executed}

    event ProposalCreated(address indexed proposer, string description);
    event Voted(address indexed voter, bool support);
    event ProposalExecuted(address indexed executor);

    function proposal() external view returns (
        string memory description,
        address proposer,
        uint votesFor,
        uint votesAgainst,
        ProposalStatus status,
        uint executionTime,
        address recipient,
        uint amount
    );

    function vote(bool support) external;
    function finishVote() external;
    function executeProposal(address treasuryAddress) external;
    function getProposalStatus() external view returns (ProposalStatus);
}
