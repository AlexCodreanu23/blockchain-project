// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


// Am realizat Withdrawal Pattern. Acum fondurile sunt alocate fiecarui utilizator in parte, iar acesta poate retrage fondurile manual. 

contract Treasury{
    address public dao;
	uint public totalFunds;
    mapping(address => uint) public balances;


    event FundsDeposited(address indexed sender, uint amount);
    event FundsAllocated(address indexed recipient, uint amount);
    event FundsWithdrawn(address indexed recipient, uint amount);

    modifier onlyDAO(){
        require(msg.sender == dao, "Only DAO can access this");
        _;
    }

    constructor(address _dao){
        dao = _dao;
    }

    function depositFunds() external payable{
        require(msg.value > 0, "The sum has to be higher than 0");
        totalFunds += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function allocateFunds(address recipient, uint amount) external onlyDAO{
        require(amount > 0, "The sum of money released has to be higher than 0");
        require(amount <= totalFunds, "Insufficient funds");
        totalFunds -= amount;
        balances[recipient] += amount;
        emit FundsAllocated(recipient, amount);
    }

    function withdrawFunds() external{
        uint amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit FundsWithdrawn(msg.sender, amount);
    }


    function getBalance() external view returns (uint){
        return totalFunds;
    }

    function getUserBalance(address user) external view returns (uint) {
        return balances[user];
    }
}
