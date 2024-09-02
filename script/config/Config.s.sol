// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";

contract ConfigScript is Script {
    ConfigStruct public currentConfig;

    struct ConfigStruct {
        uint256 chainId;
        address linkToken;
    }

    constructor() {
        if (block.chainid == 1) {
            currentConfig = ethereumMainnetConfig();
        } else {
            currentConfig = anvilConfig();
        }
    }

    function ethereumMainnetConfig()
        private
        pure
        returns (ConfigStruct memory)
    {
        ConfigStruct memory config;
        config = ConfigStruct({chainId: 1, linkToken: address(0)});

        return config;
    }

    function anvilConfig() private pure returns (ConfigStruct memory) {
        ConfigStruct memory config;
        config = ConfigStruct({chainId: 31337, linkToken: address(0)}); //  a mock link should be created for this chain

        return config;
    }

    // VIEW ///////////////////////
    // VIEW ///////////////////////
    function getCurrentConfig() public view returns (ConfigStruct memory) {
        return currentConfig;
    }
}
