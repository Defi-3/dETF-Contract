// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract UniswapV3SwapEventOracle {
    // Define the Swap event
    event Swap(
        address indexed sender,
        address indexed recipient,
        int256 amount0,
        int256 amount1,
        uint160 sqrtPriceX96,
        uint128 liquidity,
        int24 tick
    );

    address public sender;

    constructor() {
        sender = msg.sender;
    }


    // Function to emit the Swap event
    function emitSwapEvent(
        address _sender,
        address _recipient,
        int256 _amount0,
        int256 _amount1,
        uint160 _sqrtPriceX96,
        uint128 _liquidity,
        int24 _tick
    ) public {
        require(msg.sender == sender, "Only the sender can call this function");

        emit Swap(_sender, _recipient, _amount0, _amount1, _sqrtPriceX96, _liquidity, _tick);
    }
}