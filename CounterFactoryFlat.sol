// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CounterV2 {
    uint256 public x;
    address public owner;
    bool public paused;

    event Incremented(uint256 newValue);
    event Decremented(uint256 newValue);
    event Reset(uint256 newValue);
    event Paused();
    event Unpaused();
    event Received(address indexed from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function inc() public whenNotPaused {
        x += 1;
        emit Incremented(x);
    }

    function incBy(uint256 value) public whenNotPaused {
        x += value;
        emit Incremented(x);
    }

    function decBy(uint256 value) public whenNotPaused {
        require(x >= value, "Underflow");
        x -= value;
        emit Decremented(x);
    }

    function reset() public whenNotPaused {
        x = 0;
        emit Reset(x);
    }

    function pause() public onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() public onlyOwner {
        paused = false;
        emit Unpaused();
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}

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