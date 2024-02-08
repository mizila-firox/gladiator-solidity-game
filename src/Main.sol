// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Main {
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
        uint256 timeToWait;
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

    address public admin;

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
            0, // timeToWait
            _attributes
        );
    }

    function attackPlayer(string memory _player) public {}

    function calculateScore(
        Attributes memory attributes
    ) private pure returns (uint256) {
        // Define weights for each attribute
        uint256 weightStrength = 2;
        uint256 weightAgility = 1;
        uint256 weightIntelligence = 3;

        // Calculate total score
        uint256 score = (attributes.strength * weightStrength) +
            (attributes.agility * weightAgility) +
            (attributes.intelligence * weightIntelligence);
        return score;
    }

    function determineWinner(
        Player memory _player2
    ) public returns (string memory) {
        Player storage player1 = players[msg.sender];
        Player storage player2 = players[name_to_address[_player2.name]];

        // is player1 alive and player2 alive?
        if (!player1.alive && !player2.alive) {
            revert("All players must be alive");
        }

        uint256 player1Score = calculateScore(player1.attributes);
        uint256 player2Score = calculateScore(player2.attributes);

        if (player1Score > player2Score) {
            player1.exp += EXP;
            player1.timeToWait = block.timestamp + MIN_TIME_WAITING;

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
        Player memory player,
        Creature memory creature
    ) public returns (string memory) {
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

        // i want a time to cool down so the player can attack again
        require(
            players[msg.sender].timeToWait <= block.timestamp,
            "Player is waiting"
        );

        players[msg.sender].timeToWait = block.timestamp; // update time to wait

        if (playerScore > creatureScore) {
            // kill creature and give exp to player and everything else
            players[msg.sender].exp += creature.expGiven; // call a fn for this, calculate the exp to also update the level

            return player.name;
        } else if (creatureScore > playerScore) {
            players[msg.sender].alive = false;

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

    function improveAttribute() public {
        Player storage player = players[msg.sender];
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
