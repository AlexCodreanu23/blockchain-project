// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Treasury.sol";
import "./Proposal.sol";

contract DAO{
    address public owner;
    Treasury public treasury;
    Proposal[] public proposals;
    mapping(address => bool) members;

    event MemberAdded(address indexed member);
    event ProposalCreated(address indexed proposalAddress, string description);

    modifier onlyOwner(){
        require(msg.sender == owner, "Only the owner can access this");
        _;
    }

    modifier onlyMember(){
        require(members[msg.sender] == true, "Only a member can access this function");
        _;
    }

    constructor(address treasuryAddress){
        owner = msg.sender;
        treasury = Treasury(treasuryAddress);
    }

    function addMember(address member)external onlyOwner{
        require(!members[member], "Member already exists");
        members[member] = true;
        emit MemberAdded(member);
    }

    function createProposal(string memory description, address recipient, uint amount) external onlyMember{
        Proposal proposal = new Proposal(address(this), description, recipient, amount);
        proposals.push(proposal);
        emit ProposalCreated(address(proposal), description);
    }

    function finishVote(uint proposalIndex) external onlyOwner{
        Proposal proposal = proposals[proposalIndex];
        proposal.finishVote();
    }

    function executeProposal(uint proposalIndex) external onlyOwner{
        Proposal proposal = proposals[proposalIndex];
        proposal.executeProposal(address(treasury));
    }

    function getProposals() external view returns(Proposal[] memory){
        return proposals;
    }
}