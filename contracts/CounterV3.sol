// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CounterV3 {
    uint256 public x;
    address public owner;

    uint256 public minX;
    uint256 public maxX;
    uint256 public step;

    event Increment(uint256 value);
    event Reset();
    event RangeUpdated(uint256 minX, uint256 maxX);
    event StepUpdated(uint256 step);
    event OwnershipTransferred(address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(uint256 _minX, uint256 _maxX, uint256 _step) {
        owner = msg.sender;
        minX = _minX;
        maxX = _maxX;
        step = _step;
    }

    function incBy(uint256 value) public {
        x += value;
        emit Increment(value);
    }

    function reset() public {
        x = 0;
        emit Reset();
    }

    function setRange(uint256 _minX, uint256 _maxX) public onlyOwner {
        require(_minX < _maxX, "Invalid range");
        minX = _minX;
        maxX = _maxX;
        emit RangeUpdated(_minX, _maxX);
    }

    function setStep(uint256 _step) public onlyOwner {
        require(_step > 0, "Invalid step");
        step = _step;
        emit StepUpdated(_step);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
        emit OwnershipTransferred(newOwner);
    }

    receive() external payable {}
}
