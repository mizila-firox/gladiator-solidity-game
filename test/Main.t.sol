// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

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
            uint256 gold,
            uint timeToWait,
            ,

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

    // function testBattle() public {
    //     vm.startPrank(player1);
    //     main.createPlayer("player1");

    //     vm.startPrank(player2);
    //     main.createPlayer("player2");
    //     vm.stopPrank();

    //     Main.Player memory p1;
    //     p1 = main.get_players(player1);

    //     Main.Player memory p2;
    //     p2 = main.get_players(player2);

    //     vm.startPrank(player1);
    //     string memory winner = main.determineWinner(p2); // player1 attacks player2
    //     console.log(winner);
    // }

    function testBattlePlayer() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        Main.Player memory p1;
        p1 = main.get_players(player1);

        Main.Player memory p2;
        p2 = main.get_players(player2);

        main.determineWinnerPlayers(p2);

        // skip(24 hours);
        // main.determineWinnerPlayers(p2);
    }

    function testBattleCreature() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        Main.Player memory p1;
        p1 = main.get_players(player1);

        Main.Creature memory creature;
        creature = main.get_creatures(1);
        console.log("exp before:", p1.exp);

        // vm.warp(2 minutes);
        main.determineWinnerWithCreature(creature);

        // skip(2 minutes);
        // main.determineWinnerWithCreature(creature);

        // skip(2 minutes);
        // main.determineWinnerWithCreature(creature);

        // skip(2 minutes);
        // main.determineWinnerWithCreature(creature);

        // skip(3 minutes);
        // main.determineWinnerWithCreature(creature);
    }

    function testBattleWithCreatureAndImprove() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        Main.Player memory p1;
        p1 = main.get_players(player1);

        Main.Creature memory creature;
        creature = main.get_creatures(1);
        console.log("exp before:", p1.exp);

        string memory winner = main.determineWinnerWithCreature(creature);
        console.log(winner);

        p1 = main.get_players(player1);
        console.log("exp after:", p1.exp);

        // vm.warp(3 minutes);

        // should revert
        // string memory winner2 = main.determineWinnerWithCreature(creature);
        // console.log(winner2);

        // console.log("strength before: ", p1.attributes.strength);
        // console.log("gold before: ", p1.gold);

        // main.improveAttribute(1); // improve strength
        // p1 = main.get_players(player1);
        // console.log("exp after improve:", p1.exp);

        // console.log("strength before: ", p1.attributes.strength);
        // console.log("gold before: ", p1.gold);

        // uint str = p1.attributes.strength;
        // assertEq(str, 2);
    }
}
