// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CounterV4 {
    uint256 public x;
    address public owner;

    uint256 public minX;
    uint256 public maxX;
    uint256 public step;

    // Core events
    event Increment(uint256 value);
    event Reset();
    event Received(address indexed sender, uint256 amount);

    // Governance events
    event RangeUpdated(uint256 minX, uint256 maxX);
    event StepUpdated(uint256 step);
    event OwnershipTransferred(address indexed newOwner);

    // Builder-code attribution event (onchain-visible)
    event BuilderTagged(
        address indexed caller,
        string action,
        string builderCode
    );

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

    // --- Builder-tagged actions (recommended) ---

    function incBy(uint256 value, string calldata builderCode) external {
        x += value;
        emit Increment(value);
        emit BuilderTagged(msg.sender, "incBy", builderCode);
    }

    function reset(string calldata builderCode) external {
        x = 0;
        emit Reset();
        emit BuilderTagged(msg.sender, "reset", builderCode);
    }

    function setRange(uint256 _minX, uint256 _maxX, string calldata builderCode) external onlyOwner {
        require(_minX < _maxX, "Invalid range");
        minX = _minX;
        maxX = _maxX;
        emit RangeUpdated(_minX, _maxX);
        emit BuilderTagged(msg.sender, "setRange", builderCode);
    }

    function setStep(uint256 _step, string calldata builderCode) external onlyOwner {
        require(_step > 0, "Invalid step");
        step = _step;
        emit StepUpdated(_step);
        emit BuilderTagged(msg.sender, "setStep", builderCode);
    }

    function transferOwnership(address newOwner, string calldata builderCode) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
        emit OwnershipTransferred(newOwner);
        emit BuilderTagged(msg.sender, "transferOwnership", builderCode);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}