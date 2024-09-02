// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Proxy} from "../src/proxy/Proxy.sol";
import {Main} from "../src/Main.sol";
import {ConfigScript} from "./config/Config.s.sol";

contract MainScript is Script {
    ConfigScript private config;
    ConfigScript.ConfigStruct private currentConfig;
    address owner = makeAddr("owner");

    function setUp() public {
        config = new ConfigScript();
        currentConfig = config.getCurrentConfig();
    }

    function run() public returns (Main main, Proxy proxy) {
        vm.broadcast();
        main = new Main();
        proxy = new Proxy();
        main.initialize();
        proxy.initialize();
        proxy.upgradeTo(address(main));

        // console.log(proxy.owner());
        // console.log(address(this));
        // console.log(address(main));
        // console.log(proxy.currentImplementation());
    }

    // cast from-utf8 "take this 0.1 BnM token with you :}"
    // cast to-ascii 0x74616b65207468697320302e3120426e4d20746f6b656e207769746820796f75203a7d
}
