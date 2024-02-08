// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Main.sol";

contract CounterTest is Test {
    Main main;
    address player1 = makeAddr("player1");
    address player2 = makeAddr("player2");
    address player3 = makeAddr("player3");

    function setUp() public {
        main = new Main();
    }

    function testCreatePlayer() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        (
            uint id,
            string memory name,
            uint256 level,
            uint256 exp,
            uint256 health
        ) = main.players(player1);
        assertEq(main.quantity_players(), 1);
        assertEq(id, 1);
        assertEq(name, "player1");
        assertEq(level, 1);
        assertEq(exp, 0);
        assertEq(health, 100);
    }

    function testCreatePlayerTwice() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        vm.startPrank(player1);
        vm.expectRevert();
        main.createPlayer("player1");
    }
}
