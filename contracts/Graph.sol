pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// https://github.com/DelphinusLab/halo2aggregator-s/blob/main/sol/contracts/AggregatorVerifier.sol
interface IZKVerify {
    function verify(
        uint256[] calldata proof,
        uint256[] calldata verify_instance,
        uint256[] calldata aux,
        uint256[][] calldata target_instance
    ) external view;
}

interface IFactory {
    function isNode(address _account) external view returns (bool);
}

contract Graph is Ownable {
    using SafeERC20 for IERC20;

    event UpdateReward(uint256 oldReward, uint256 newReward);
    event Trigger(address sender, bytes zkgState);

    address public factory;

    address public bountyToken;
    uint256 public bountyReward;
    address public verifier;
    address public destAddr;
    string public graphURI;

    constructor(
        address _bountyToken,
        uint256 _bountyReward,
        address _verifier,
        address _destAddr,
        string memory _graphURI
    ) {
        factory = msg.sender;
        bountyToken = _bountyToken;
        bountyReward = _bountyReward;
        verifier = _verifier;
        destAddr = _destAddr;
        graphURI = _graphURI;
        transferOwnership(tx.origin);
    }

    function depsoit(uint256 amount) external payable {
        require(amount != 0, "Empty deposit amount");
        if (bountyToken != address(0)) {
            IERC20(bountyToken).safeTransferFrom(msg.sender, address(this), amount);
        } else {
            require(amount == msg.value, "Invalid msg value");
        }
    }

    function updateReward(uint256 amount) external onlyOwner {
        require(amount > bountyReward, "Must greater than the previous amount");
        uint256 oldReward = bountyReward;
        bountyReward = amount;
        emit UpdateReward(oldReward, bountyReward);
    }

    function trigger(
        uint256 blockNumber,
        bytes32 blockHash,
        bytes memory zkgState,
        uint256[] calldata proof,
        uint256[] calldata verify_instance,
        uint256[] calldata aux
    ) external {
        require(IFactory(factory).isNode(msg.sender), "Caller not node");
        require(verify(blockNumber, blockHash, zkgState, proof, verify_instance, aux), "verify proof failed");
        destAddr.call(zkgState);

        if (bountyToken != address(0)) {
            IERC20(bountyToken).safeTransfer(msg.sender, bountyReward);
        } else {
            (bool _success,) = msg.sender.call{value: bountyReward}("");
            require(_success, "Failed to reward");
        }

        emit Trigger(msg.sender, zkgState);
    }

    function verify(
        uint256 blockNumber,
        bytes32 blockHash,
        bytes memory zkgState,
        uint256[] calldata proof,
        uint256[] calldata verify_instance,
        uint256[] calldata aux
    ) public view returns (bool) {
        // require(blockhash(blockNumber) == blockHash, "Invalid public input blockhash");
        uint256[] memory encodedPub = encodePublicInput(blockNumber, blockHash, zkgState);
        uint256[][] memory target_instance = new uint256[][](1);
        target_instance[0] = encodedPub;

        IZKVerify(verifier).verify(proof, verify_instance, aux, target_instance); // revert if failed
        return true;
    }

    function encodePublicInput(uint256 blockNumber, bytes32 blockHash, bytes memory zkgState)
        public
        view
        returns (uint256[] memory)
    {
        // 0 -> blockNumber
        // 1-4 -> blockHash
        // 5 -> zkgState.length
        // 6-6+zkgState.length -> zkgState
        uint256 zkgStateLen = zkgState.length;
        uint256 encodedPubLen = 2 + blockHash.length / 8 + zkgStateLen / 8;
        uint256 zkgStateRemain = zkgStateLen % 8;
        if (zkgStateRemain != 0) {
            encodedPubLen += 1;
        }
        uint256[] memory encodedPub = new uint256[](encodedPubLen);

        encodedPub[0] = blockNumber;

        for (uint256 i = 0; i < 4; i++) {
            uint256 shift = (3 - i) * 64;
            uint64 data = uint64(uint256(blockHash) >> shift & uint256(0xFFFFFFFFFFFFFFFF));
            encodedPub[i + 1] = uint256(reverseBytes(data));
        }

        encodedPub[5] = zkgStateLen;

        uint256 i = 0;
        for (; i < zkgStateLen / 8; i++) {
            bytes8 value;
            assembly {
                value := mload(add(zkgState, add(mul(i, 8), 0x20)))
            }
            encodedPub[i + 6] = uint256(reverseBytes(uint64(value)));
        }

        if (zkgStateRemain != 0) {
            bytes8 value;
            assembly {
                value := mload(add(zkgState, add(mul(i, 8), 0x20)))
            }
            uint64 shift = 64 - uint64(zkgStateRemain) * 8;
            encodedPub[i + 6] = uint64(value) >> shift;
        }

        return encodedPub;
    }

    function reverseBytes(uint64 input) internal pure returns (uint64) {
        uint64 result;
        assembly {
            result := shl(56, and(input, 0xff))
            result := or(result, shl(40, and(input, 0xff00)))
            result := or(result, shl(24, and(input, 0xff0000)))
            result := or(result, shl(8, and(input, 0xff000000)))
            result := or(result, shr(8, and(input, 0xff00000000)))
            result := or(result, shr(24, and(input, 0xff0000000000)))
            result := or(result, shr(40, and(input, 0xff000000000000)))
            result := or(result, shr(56, and(input, 0xff00000000000000)))
        }
        return result;
    }
}
