// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITreasury {
    event FundsDeposited(address indexed sender, uint amount);
    event FundsReleased(address indexed recipient, uint amount);

    function dao() external view returns (address);
    function totalFunds() external view returns (uint);

    function depositFunds() external payable;
    function releaseFunds(address recipient, uint amount) external;
    function getBalance() external view returns (uint);
}
