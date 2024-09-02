// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {UUPSUpgradeable} from "openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "openzeppelin-contracts/contracts/access/OwnableUpgradeable.sol";

contract Proxy is UUPSUpgradeable, Initializable, OwnableUpgradeable {
    address public currentImplementation;

    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {
        require(
            newImplementation != address(0),
            "Proxy: new implementation is the zero address"
        );
        require(
            newImplementation != currentImplementation,
            "Proxy: new implementation is the same as the current one"
        );
    }

    function upgradeTo(address newImplementation) public onlyOwner {
        _authorizeUpgrade(newImplementation);
        currentImplementation = newImplementation;
    }

    fallback() external payable {
        (bool success, ) = currentImplementation.call(msg.data);
        require(
            success,
            "Proxy: delegatecall to the implementation faileddddd"
        );
    }

    receive() external payable {}
}
