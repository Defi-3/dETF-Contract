// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract UniswapV2SyncEventOracle {
    // Define the Swap event
    event Sync(
        uint112 amount0,
        uint112 amount1
    );

    address public sender;

    constructor() {
        sender = msg.sender;
    }


    // Function to emit the Swap event
    function emitSwapEvent(
        uint112 _amount0,
        uint112 _amount1
    ) public {
        require(msg.sender == sender, "Only the sender can call this function");

        emit Sync(_amount0, _amount1);
    }
}