// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CounterV2 {
    uint256 public x;

    event Incremented(uint256 newValue);
    event Reset(uint256 newValue);
    event Received(address indexed from, uint256 amount);

    function inc() public {
        x += 1;
        emit Incremented(x);
    }

    function incBy(uint256 _value) public {
        x += _value;
        emit Incremented(x);
    }

    function reset() public {
        x = 0;
        emit Reset(x);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
