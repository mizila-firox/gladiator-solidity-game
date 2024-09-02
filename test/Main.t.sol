// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Main} from "../src/Main.sol";
import {MainScript} from "../script/Main.s.sol";
import {Proxy} from "../src/proxy/Proxy.sol";

contract MainTest is Test {
    Main main;
    Proxy proxy;
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
        // main = new Main();
        MainScript script = new MainScript();
        (main, proxy) = script.run();
    }

    function testUsingProxy() external {
        // proxy.createPlayer("player1");
        vm.startPrank(player1);
        (bool success, ) = address(proxy).call(
            abi.encodeWithSignature("createPlayer(string)", "hello")
        );

        require(success, "failed to create player");

        uint256 qty = main.quantity_players();
        assertEq(qty, 1);

        address addr = main.name_to_address("hello");
        console.log("addr:", addr);
    }

    // cast from-utf8 "take this 0.1 BnM token with you :}"
    // cast to-ascii 0x74616b65207468697320302e3120426e4d20746f6b656e207769746820796f75203a7d

    function testCreatePlayer() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        (
            uint id,
            string memory name,
            uint256 level,
            uint256 exp,
            uint256 gold,
            uint timeToWait,
            ,
            ,

        ) = main.players(player1);
        assertEq(main.quantity_players(), 1);
        assertEq(id, 1);
        assertEq(name, "player1");
        assertEq(level, 1);
        assertEq(exp, 0);
        // assertEq(alive, true);
    }

    function testCreatePlayerTwice() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        vm.startPrank(player1);
        vm.expectRevert();
        main.createPlayer("player1");
    }

    function testAttackOneMonster() public {
        vm.startPrank(player1);
        skip(1000 seconds);
        main.createPlayer("player1");

        skip(4000 seconds);
        main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
    }

    // function testHello(uint16 _n) public {
    //     vm.startPrank(player1);
    //     main.createPlayer("player1");
    //     skip(_n);
    //     main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
    // }

    modifier createPlayer() {
        vm.startPrank(player1);
        main.createPlayer("player1");
        _;
    }

    function _getStatus() private view {
        // (uint256 id, , , , , , , main.Player, , , ) = main.get_players(player1);
        Main.Player memory player = main.get_players(player1);
        uint256 wins = player.battleStats.wins;
        uint256 losses = player.battleStats.losses;
        uint256 draws = player.battleStats.draws;
        uint256 gold = player.gold;

        console.log("wins:", wins);
        console.log("losses:", losses);
        console.log("draws:", draws);
        console.log("GOLD:", gold);
        console.log("-------------");

        console.log("strength:", player.attributes.strength);
        console.log("agility:", player.attributes.agility);
        console.log("intelligence:", player.attributes.intelligence);
        console.log("====================================");
    }

    function testAttackOneMonsterWithPlayer() public createPlayer {
        _getStatus();

        for (uint256 i = 0; i < 40; i++) {
            main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
            skip(10 minutes);
        }

        main.improveAttribute(1);
        main.improveAttribute(2);
        main.improveAttribute(3);
        main.improveAttribute(2);
        main.improveAttribute(2);
        main.improveAttribute(1);
        main.improveAttribute(2);
        main.improveAttribute(1);
        main.improveAttribute(3);
        main.improveAttribute(3);
        main.improveAttribute(3);
        _getStatus();

        // attack a stronger monster
        skip(11 minutes);
        main.determineWinnerWithCreature(4); // 3 == Dragon
        _getStatus();
    }

    function testP1TooStrongToDieToP2() external {
        vm.startPrank(player1);
        main.createPlayer("player1");

        for (uint256 i = 0; i < 40; i++) {
            main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
            skip(10 minutes);
        }

        for (uint256 i = 0; i < 8; i++) {
            if (i % 2 == 0) {
                main.improveAttribute(1);
            } else if (i % 3 == 0) {
                main.improveAttribute(2);
            } else {
                main.improveAttribute(3);
            }
        }
    }

    function testAttacks() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        vm.startPrank(player2);
        main.createPlayer("player2");

        vm.startPrank(player1);
        main.attackPlayer("player2");

        // print status
        _getStatus2("player1");
        _getStatus2("player2");

        vm.warp(2 hours);

        console.log("================");
        vm.startPrank(player2);
        main.attackPlayer("player1");

        _getStatus2("player1");
        _getStatus2("player2");
    }

    function testAttackAnotherPlayerMoreThanOnce() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        vm.startPrank(player2);
        main.createPlayer("player2");

        vm.startPrank(player1);
        main.attackPlayer("player2");

        // print status
        _getStatus2("player1");
        _getStatus2("player2");

        vm.warp(2 hours);

        console.log("================");
        main.attackPlayer("player2");

        _getStatus2("player1");
        _getStatus2("player2");
    }

    function testAttackAnotherPlayer() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        vm.startPrank(player2);
        main.createPlayer("player2");

        vm.startPrank(player1);
        main.attackPlayer("player2");

        // print status
        _getStatus2("player1");
        _getStatus2("player2");
    }

    function testAttackMonsterImproveThenAnotherPlayer() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature

        skip(10 minutes); // do i need to skip time if i want to attack a player after attacking a monster?
        // improve attribute
        main.improveAttribute(1);

        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        _getStatus2("player1");
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

        vm.startPrank(player2);
        main.createPlayer("player2");

        vm.startPrank(player1);
        main.attackPlayer("player2");

        skip(24 hours);
        main.attackPlayer("player2");

        // print status
        _getStatus2("player1");
        _getStatus2("player2");
    }

    function testAttackMonsterImproveThenAnotherPlayer2() public {
        vm.startPrank(player1);
        main.createPlayer("player1");

        main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature

        skip(10 minutes); // do i need to skip time if i want to attack a player after attacking a monster?
        // improve attribute
        main.improveAttribute(1);

        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        _getStatus2("player1");
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

        vm.startPrank(player2);
        main.createPlayer("player2");

        main.determineWinnerWithCreature(1);

        main.improveAttribute(2); // improve agility
        console.log("#######################");
        _getStatus2("player2");
        console.log("#######################");
        //

        // vm.startPrank(player1);
        // main.attackPlayer("player2");

        vm.startPrank(player1);
        skip(24 hours);
        main.attackPlayer("player2");

        // print status
        console.log("P1:");
        _getStatus2("player1");
        console.log("P2:");
        _getStatus2("player2");
    }

    function _getStatus2(string memory __player) private view {
        Main.Player memory player = main.get_players(
            main.name_to_address(__player)
        );

        uint256 exp = player.exp;
        uint256 wins = player.battleStats.wins;
        uint256 losses = player.battleStats.losses;
        uint256 draws = player.battleStats.draws;
        uint256 gold = player.gold;

        console.log("exp:", exp);
        console.log("wins:", wins);
        console.log("losses:", losses);
        console.log("draws:", draws);
        console.log("GOLD:", gold);
        console.log("-------------");
    }

    //
    function testTuningLuckParam() public createPlayer {
        main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
        skip(14 minutes);
        // main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
        // skip(14 minutes);
        // main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
        // skip(15 minutes);
        // main.determineWinnerWithCreature(1); // 1 == Goblin,  the weakest creature
    }

    function testAttackStrongMonster() public createPlayer {
        string memory result = main.determineWinnerWithCreature(1); // 1 == Globin the weakest creature
        console.log("winner:", result);

        skip(10 minutes);

        string memory result2 = main.determineWinnerWithCreature(5); // 5 == Hydra,  the strongest creature

        console.log("winner:", result2);
    }

    function testAttackMonsterTest() external createPlayer {
        string memory result = main.determineWinnerWithCreature(1); // 1 == Globin the weakest creature
        skip(1 minutes); // 30 seconds is enough
        string memory result2 = main.determineWinnerWithCreature(1); // 2 == Orc,  the second weakest creature
        skip(1 minutes); // 30 seconds
        string memory result3 = main.determineWinnerWithCreature(1); // 2 == Orc,  the second weakest creature
        console.log("winner:", result3);

        _getStatus2("player1");
    }

    function testAttackSamePlayer() public {
        vm.startPrank(player3);
        main.createPlayer("player3");

        vm.startPrank(player2);
        main.createPlayer("player2");

        vm.startPrank(player1);
        main.createPlayer("player1");

        // p1 attacks p2
        main.attackPlayer("player2");

        vm.warp(31 seconds);
        // p1 attacks p3
        main.attackPlayer("player3");
    }

    // make one player have gold and be attacked by another player so the other player can take the gold
    function testAttackMonsterToGetGold() public {
        vm.startPrank(player2);
        main.createPlayer("player2");

        main.determineWinnerWithCreature(1); // 1 == Globin the weakest creature
        skip(11 minutes);
        main.determineWinnerWithCreature(1); // 1 == Globin the weakest creature

        _getStatus2("player1");
        _getStatus2("player2");

        console.log("======================");
        console.log("AFTER BEING ATTACKED");
        console.log("======================");

        vm.startPrank(player1);
        main.createPlayer("player1");

        skip(10 minutes);
        main.attackPlayer("player2");

        _getStatus2("player1");
        _getStatus2("player2");
    }
}
