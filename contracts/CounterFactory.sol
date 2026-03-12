// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./CounterV2.sol";

contract CounterFactory {
    address public owner;
    address[] public counters;

    event CounterCreated(address indexed creator, address counter, uint256 index);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCounter() external returns (address) {
        CounterV2 newCounter = new CounterV2();
        address counterAddress = address(newCounter);

        counters.push(counterAddress);

        emit CounterCreated(msg.sender, counterAddress, counters.length - 1);

        return counterAddress;
    }

    function getCounters() external view returns (address[] memory) {
        return counters;
    }

    function countersCount() external view returns (uint256) {
        return counters.length;
    }
}