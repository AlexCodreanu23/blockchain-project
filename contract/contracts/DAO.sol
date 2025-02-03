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

    function isValidAmount(uint amount)public pure returns (bool){
        return amount > 0;
    }

    function addMember(address member)external onlyOwner{
        require(!members[member], "Member already exists");
        members[member] = true;
        emit MemberAdded(member);
    }

    function createProposal(string memory description, address recipient, uint amount) external{
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

    function getProposals() public view returns (address[] memory) {
        address[] memory proposalAddresses = new address[](proposals.length);

        for (uint i = 0; i < proposals.length; i++) {
            proposalAddresses[i] = address(proposals[i]);
        }
        return proposalAddresses;
    }
}