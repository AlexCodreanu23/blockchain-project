// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDAO {
    event MemberAdded(address indexed member);
    event ProposalCreated(address indexed proposalAddress, string description);

    function owner() external view returns (address);
    function treasury() external view returns (address);
    function isValidAmount(uint amount) external pure returns (bool);
    function addMember(address member) external;
    function createProposal(string memory description, address recipient, uint amount) external;
    function finishVote(uint proposalIndex) external;
    function executeProposal(uint proposalIndex) external;
    function getProposals() external view returns (address[] memory);
}
