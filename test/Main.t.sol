// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Main.sol";

contract CounterTest is Test {
    Main main;
    address player1 = makeAddr("player1");
    address player2 = makeAddr("player2");
    address player3 = makeAddr("player3");

    struct Player {
        uint id;
        string name;
        uint256 level;
        uint256 exp;
        bool alive;
        Attributes attributes;
    }

    struct Attributes {
        uint256 strength;
        uint256 agility;
        uint256 intelligence;
    }

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
            bool alive,

        ) = main.players(player1);
        assertEq(main.quantity_players(), 1);
        assertEq(id, 1);
        assertEq(name, "player1");
        assertEq(level, 1);
        assertEq(exp, 0);
        assertEq(alive, true);
    }

    function testCreatePlayerTwice() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        vm.startPrank(player1);
        vm.expectRevert();
        main.createPlayer("player1");
    }

    function testBattle() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        vm.startPrank(player2);
        main.createPlayer("player2");

        vm.stopPrank();

        Main.Player memory p1;
        p1 = main.get_players(player1);

        Main.Player memory p2;
        p2 = main.get_players(player2);

        string memory winner = main.determineWinner(p1, p2);
        console.log(winner);
    }

    function testBattleWithCreature() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        Main.Player memory p1;
        p1 = main.get_players(player1);

        Main.Creature memory creature;
        creature = main.get_creatures(2);

        string memory winner = main.determineWinnerWithCreature(p1, creature);
        console.log(winner);
    }
}
