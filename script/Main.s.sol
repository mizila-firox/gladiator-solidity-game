// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {Main} from "../src/Main.sol";

contract MainScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        Main main = new Main();
    }
}
