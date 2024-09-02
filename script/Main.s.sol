// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Main} from "../src/Main.sol";
import {ConfigScript} from "./config/Config.s.sol";

contract MainScript is Script {
    ConfigScript private config;
    ConfigScript.ConfigStruct private currentConfig;

    function setUp() public {
        config = new ConfigScript();
        currentConfig = config.getCurrentConfig();
    }

    function run() public {
        vm.broadcast();
        Main main = new Main();
    }
}
