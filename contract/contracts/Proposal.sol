// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Treasury.sol";

contract Proposal{

    enum ProposalStatus {Pending, Approved, Rejected, Executed}
    struct ProposalData {
        string description;
        address proposer;
        uint votesFor;
        uint votesAgainst;
        ProposalStatus status;
        uint executionTime;
        address recipient;
        uint amount;
    }

    ProposalData public proposal;
    address public dao;
    mapping(address => bool) public hasVoted;


    event ProposalCreated(address indexed proposer, string description);
    event Voted(address indexed voter, bool support);
    event ProposalExecuted(address indexed executor);

    modifier onlyDAO(){
        require(msg.sender == dao, "Only DAO can access this");
        _;
    }
    

    modifier onlyPending(){
        require(proposal.status == ProposalStatus.Pending, "Proposal is not in pending");
        _;
    }

    modifier onlyApproved(){
        require(proposal.status == ProposalStatus.Approved, "This proposal is not Approved");
        _;
    }

    constructor(address _dao, string memory _description, address _recipient, uint _amount){
        require(_amount > 0, "The amount has to be higher than 0");
        dao = _dao;
        proposal = ProposalData({
            description: _description,
            proposer: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            status: ProposalStatus.Pending,
            executionTime: 0,
            recipient: _recipient,
            amount: _amount
        });

        emit ProposalCreated(msg.sender, _description);
    }

    function vote(bool support) external onlyPending{
        require(hasVoted[msg.sender] == false, "You already have voted");
        hasVoted[msg.sender] = true;
        if(support){
            proposal.votesFor ++;
        }
        else{
            proposal.votesAgainst++;
        }
        emit Voted(msg.sender, support);
    }

    function finishVote() external onlyDAO onlyPending{
        if(proposal.votesFor > proposal.votesAgainst){
            proposal.status = ProposalStatus.Approved;
        }
        else{
            proposal.status = ProposalStatus.Rejected;
        }
    }

    function executeProposal(address treasuryAddress) external onlyApproved onlyDAO{
        require(proposal.amount > 0, "Invalid proposal amount");
        Treasury treasury = Treasury(treasuryAddress);
        treasury.releaseFunds(proposal.recipient, proposal.amount);

        proposal.status = ProposalStatus.Executed;
        proposal.executionTime = block.timestamp;

        emit ProposalExecuted(msg.sender);
    }

    function getProposalStatus() external view returns(ProposalStatus){
        return proposal.status;
    }

}
