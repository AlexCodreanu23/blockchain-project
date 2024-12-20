// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Treasury{
    address public dao;
	uint public totalFunds;


    event FundsDeposited(address indexed sender, uint amount);
    event FundsReleased(address indexed recipient, uint amount);

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

    function releaseFunds(address recipient, uint amount) external{
        require(amount > 0, "The sum of money released has to be higher than 0");
        require(amount <= totalFunds, "Insufficient funds");
        totalFunds -= amount;
        payable(recipient).transfer(amount);
        emit FundsReleased(recipient, amount);
    }


    function getBalance() external view returns (uint){
        return totalFunds;
    }
}
