// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

contract Main is Test {
    // ==============================================
    // ============== VARIABLES =====================

    uint256 constant MIN_TIME_WAITING = 2 minutes;
    uint256 constant EXP = 100; // just leave this magic number here for now, it does not even need to be a cosntant
    uint256 public quantity_players = 0;

    struct Player {
        uint256 id;
        string name;
        uint256 level;
        uint256 exp;
        bool alive; // when it dies it loses exp
        uint256 lastAttackTime;
        uint256 gold; // update this later to a struct containing more things, like items for example
        Attributes attributes;
        // address[] playersAttacked;??
        // address[] creaturesAttacked;??
        // address of owner to make it simpler instead of having to search every time
    }

    struct Attributes {
        uint256 strength;
        uint256 agility;
        uint256 intelligence;
    }

    struct Creature {
        uint256 id;
        string name;
        uint256 level;
        uint256 expGiven;
        Attributes attributes;
    }

    mapping(address player => Player) public players;
    mapping(string name => address) public name_to_address;
    mapping(address => string name) public address_to_name;

    mapping(uint256 => Creature) public creatures;
    mapping(uint256 idCreature => uint256) public creatureAmountOfGold; // each creature can give a different amount of gold

    mapping(address => mapping(address => uint))
        public timeToWaitToAttackAnotherPlayer; // time to wait to attack another player

    address public admin;

    function isAllowedToAttackAnotherPlayer(
        address _player1,
        address _player2
    ) private returns (bool) {
        // check if 24 hours since last attack to the player 2 was passed
        require(
            block.timestamp >=
                timeToWaitToAttackAnotherPlayer[_player1][_player2],
            "Youu needto wait 24 hours to attack this player again!"
        );

        timeToWaitToAttackAnotherPlayer[_player1][_player2] =
            block.timestamp +
            24 hours;

        return true;
    }

    // ==============================================
    // ============== ERRORS ========================

    error Main__NotAdmin(address sender, address admin);
    error Main__PlayerAlreadyExists(address player);
    error Main__NameAlreadyExists(string name);

    constructor() {
        admin = msg.sender;

        // creating initial creatures
        _creatingInitialCreatures();
    }

    // ==============================================
    // ============== MODIFIERS =====================

    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert Main__NotAdmin({sender: msg.sender, admin: admin});
        }
        _;
    }

    function createPlayer(string memory _name) public {
        if (players[msg.sender].id != 0) {
            revert Main__PlayerAlreadyExists({player: msg.sender});
        }
        if (name_to_address[_name] != address(0)) {
            revert Main__NameAlreadyExists({name: _name});
        }
        quantity_players += 1;
        name_to_address[_name] = msg.sender;
        address_to_name[msg.sender] = _name;

        // initial attributes
        Attributes memory _attributes = Attributes(1, 1, 1);

        players[msg.sender] = Player(
            quantity_players, // id
            _name,
            1, //level
            0, // exp
            true, // alive
            0, // gold
            0, // lastAttackTime
            _attributes
        );
    }

    function attackPlayer(string memory _player) public {}

    function calculateScore(
        Attributes memory attributes
    ) private pure returns (uint256) {
        // Define weights for each attribute
        uint256 weightStrength = 3;
        uint256 weightAgility = 2;
        uint256 weightIntelligence = 1;

        // Calculate total score
        uint256 score = (attributes.strength * weightStrength) +
            (attributes.agility * weightAgility) +
            (attributes.intelligence * weightIntelligence);
        return score;
    }

    function determineWinnerPlayers(
        Player memory _player2
    ) public returns (string memory) {
        Player storage player1 = players[msg.sender];
        Player storage player2 = players[name_to_address[_player2.name]];

        // checking 24 hours to attack another player
        isAllowedToAttackAnotherPlayer(
            msg.sender,
            name_to_address[_player2.name]
        );

        // is player1 alive and player2 alive?
        if (!player1.alive && !player2.alive) {
            revert("All players must be alive");
        }

        uint256 player1Score = calculateScore(player1.attributes);
        uint256 player2Score = calculateScore(player2.attributes);

        // i want a time to cool down so the player has to wait some time before attacking again
        require(
            block.timestamp >= player1.lastAttackTime + MIN_TIME_WAITING ||
                player1.lastAttackTime == 0,
            "Player is waiting"
        );

        player1.lastAttackTime = block.timestamp;

        if (player1Score > player2Score) {
            player1.exp += EXP;

            player2.alive = false;

            return player1.name;
        } else if (player2Score > player1Score) {
            player2.exp += EXP;
            // ** player2.timeofWait  here is not necessary since it's p1 who is attacking
            player1.alive = false;

            return player2.name;
        } else {
            return "Draw";
        }
    }

    function determineWinnerWithCreature(
        Creature memory creature
    ) public returns (string memory) {
        Player storage player = players[msg.sender];

        // check if creature exists
        if (creature.id == 0) {
            revert("Creature does not exist");
        }

        // is player alive?
        if (!player.alive) {
            revert("Player is dead");
        }

        uint256 playerScore = calculateScore(player.attributes);
        uint256 creatureScore = calculateScore(creature.attributes);

        // i want a time to cool down so the player has to wait some time before attacking again
        require(
            block.timestamp >= player.lastAttackTime + MIN_TIME_WAITING ||
                player.lastAttackTime == 0,
            "Player is waiting"
        );

        player.lastAttackTime = block.timestamp;

        if (playerScore > creatureScore) {
            // kill creature and give exp to player and everything else
            player.exp += creature.expGiven; // call a fn for this, calculate the exp to also update the level

            // give gold according to the creature
            player.gold += creatureAmountOfGold[creature.id];

            return player.name;
        } else if (creatureScore > playerScore) {
            player.alive = false;
            // TODO: should the user lose exp and gold when he dies? at least a little?

            return creature.name;
        } else {
            return "Draw";
        }
    }

    // 1. Goblin
    // 2. Orc
    // 3. Troll
    // 4. Dragon
    // 5. Hydra
    function _creatingInitialCreatures() private {
        Attributes memory _attributes1 = Attributes(0, 0, 0);
        Creature memory goblin = Creature(1, "Goblin", 1, 10, _attributes1);

        Attributes memory _attributes2 = Attributes(2, 2, 2);
        Creature memory orc = Creature(2, "Orc", 2, 50, _attributes2);

        Attributes memory _attributes3 = Attributes(3, 3, 3);
        Creature memory troll = Creature(3, "Troll", 3, 100, _attributes3);

        Attributes memory _attributes4 = Attributes(4, 4, 4);
        Creature memory dragon = Creature(4, "Dragon", 4, 500, _attributes4);

        Attributes memory _attributes5 = Attributes(5, 5, 5);
        Creature memory hydra = Creature(5, "Hydra", 5, 1000, _attributes5);

        creatures[1] = goblin;
        creatures[2] = orc;
        creatures[3] = troll;
        creatures[4] = dragon;
        creatures[5] = hydra;

        // for now lets make it simple and each creature gives the same amt every time but then change it to the max amount each creature can provide and add a random to it to, chainlink.
        creatureAmountOfGold[1] = 1;
        creatureAmountOfGold[2] = 2;
        creatureAmountOfGold[3] = 8;
        creatureAmountOfGold[4] = 16;
        creatureAmountOfGold[5] = 32;
    }

    function improveAttribute(uint16 _attribute) public {
        Player storage player = players[msg.sender];
        uint cost;

        // double the cost every time
        if (_attribute == 1) {
            cost = 1 << player.attributes.strength; // Calculate cost as 2^strength
            require(
                player.gold >= cost,
                "Not enough gold for strength improvement"
            );
            player.attributes.strength += 1;
        } else if (_attribute == 2) {
            cost = 1 << player.attributes.agility; // Calculate cost as 2^agility
            require(
                player.gold >= cost,
                "Not enough gold for agility improvement"
            );
            player.attributes.agility += 1;
        } else if (_attribute == 3) {
            cost = 1 << player.attributes.intelligence; // Calculate cost as 2^intelligence
            require(
                player.gold >= cost,
                "Not enough gold for intelligence improvement"
            );
            player.attributes.intelligence += 1;
        }

        player.gold -= cost; // Deduct cost from player's gold
    }

    function respawn() public {}

    // TODO:
    // ce quoi la meilleure façon de améliorer les attributs?, avec des coins/piéces?, ça devient plus cher à chaque fois?
    //[[[ upgrade attributes]]]

    // boost?
    // [so it will be reusable] create a function to update time to wait for both players and creaters
    // fn calculate level
    // all events
    // respawn after death

    // this function works better than the generated getter `player`
    function get_players(address _address) public view returns (Player memory) {
        return players[_address];
    }

    function get_creatures(
        uint256 _index
    ) public view returns (Creature memory) {
        return creatures[_index];
    }
}
