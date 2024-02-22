// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

// import "forge-std/Test.sol";
import "openzeppelin-contracts/contracts/utils/math/Math.sol";

contract Main {
    // ==============================================
    // ============== VARIABLES =====================

    uint public num = 777;
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
        PlayerBattleStats battleStats;
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

    struct PlayerBattleStats {
        uint256 wins;
        uint256 losses;
        uint256 draws;
    }

    mapping(address player => Player) public players;
    mapping(string name => address) public name_to_address;
    mapping(address player => string name) public address_to_name;

    mapping(uint256 => Creature) public creatures;
    mapping(uint256 idCreature => uint256) public creatureAmountOfGold; // each creature can give a different amount of gold

    mapping(address => mapping(address => uint))
        public timeToWaitToAttackAnotherPlayer; // time to wait to attack another player

    address public admin;

    // ==============================================
    // ============== ERRORS ========================

    error Main__NotAdmin(address sender, address admin);
    error Main__PlayerAlreadyExists(address player);
    error Main__NameAlreadyExists(string name);

    // ==============================================
    // ============== EVENTS ========================
    event Main__PlayerCreated(address player, string name);
    event Main__PlayerAttackedPlayer(
        address player1,
        address player2,
        string winner
    );
    event Main__PlayerAttackedCreature(
        address player,
        uint256 creatureId,
        string winner
    );
    event Main__PlayerRespawned(address player);
    event Main__PlayerImprovedAttribute(address player, uint16 attribute);

    // event Main__PlayerDied(address player);

    constructor() {
        admin = msg.sender;

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

    // ==============================================
    // ============== FUNCTIONS =====================

    function createPlayer(string memory _name) public {
        // TODO:  checks if _name is == "", or the default

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
        PlayerBattleStats memory _battleStats = PlayerBattleStats(0, 0, 0);

        players[msg.sender] = Player(
            quantity_players, // id
            _name,
            1, //level
            0, // exp
            true, // alive
            0, // gold
            0, // lastAttackTime
            _battleStats,
            _attributes
        );

        emit Main__PlayerCreated(msg.sender, _name);
    }

    function attackPlayer(string memory _player) public {}

    uint256 private nonce = 0;

    // this is a pseudo random number, it's not secure, but it's good enough for now
    function getPseudoRandomNumber() public returns (uint256) {
        uint256 randomNumber = (uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))
        ) % 5) + 1; // from 1 to 5
        nonce++;
        return randomNumber;
    }

    function _calculateScore(
        Attributes memory attributes
    ) private returns (uint256) {
        // Define weights for each attribute
        uint256 weightLuck = 2; // this luck is random and will be assigned each time the player attack.
        uint256 weightStrength = 1; // idealy these would be random within a range
        uint256 weightAgility = 1;
        uint256 weightIntelligence = 1;

        uint256 luck = getPseudoRandomNumber();

        // WITHOUT LUCK = Calculate total score
        // uint256 score = (attributes.strength * weightStrength) +
        //     (attributes.agility * weightAgility) +
        //     (attributes.intelligence * weightIntelligence);

        // calculate with luck
        // uint256 score = (attributes.strength * weightStrength) +
        //     (attributes.agility * weightAgility) +
        //     (attributes.intelligence * weightIntelligence) +
        //     (attributes.luck * weightLuck);
        // return score;

        uint256 score = (attributes.strength * weightStrength) +
            (attributes.agility * weightAgility) +
            (attributes.intelligence * weightIntelligence) +
            (luck * weightLuck);
        return score;
    }

    function _isAllowedToAttackAnotherPlayer(
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

    function determineWinnerPlayers(
        Player memory _player2
    ) public returns (string memory) {
        Player storage player1 = players[msg.sender];
        Player storage player2 = players[name_to_address[_player2.name]];

        // checking 24 hours to attack another player
        _isAllowedToAttackAnotherPlayer(
            msg.sender,
            name_to_address[_player2.name]
        );

        // is player1 alive and player2 alive?
        if (!player1.alive && !player2.alive) {
            revert("All players must be alive");
        }

        uint256 player1Score = _calculateScore(player1.attributes);
        uint256 player2Score = _calculateScore(player2.attributes);

        // i want a time to cool down so the player has to wait some time before attacking again
        require(
            block.timestamp >= player1.lastAttackTime + MIN_TIME_WAITING ||
                player1.lastAttackTime == 0,
            "Player is waiting"
        );

        player1.lastAttackTime = block.timestamp;

        if (player1Score > player2Score) {
            player1.battleStats.wins += 1;
            player2.battleStats.losses += 1;

            // if player2 exp is less than EXP, then it will be 0, otherwise it will be the difference
            if (player2.exp >= EXP) {
                player2.exp -= EXP;
            } else {
                player2.exp = 0;
            }

            player1.exp += EXP;
            // player2.exp -= EXP;
            _calculateLevel(player1);
            _calculateLevel(player2);

            emit Main__PlayerAttackedPlayer(
                msg.sender,
                name_to_address[_player2.name],
                player1.name
            );

            player2.alive = false;

            return player1.name;
        } else if (player2Score > player1Score) {
            // change battle stats
            player1.battleStats.losses += 1;
            player2.battleStats.wins += 1;

            // if player1 exp is less than EXP, then it will be 0, otherwise it will be the difference
            if (player1.exp >= EXP) {
                player1.exp -= EXP;
            } else {
                player1.exp = 0;
            }

            player2.exp += EXP;
            // player1.exp -= EXP;
            _calculateLevel(player1);
            _calculateLevel(player2);

            // ** player2.timeofWait  here is not necessary since it's p1 who is attacking
            player1.alive = false;

            emit Main__PlayerAttackedPlayer(
                msg.sender,
                name_to_address[_player2.name],
                player2.name
            );

            return player2.name;
        } else {
            // change battle stats
            player1.battleStats.draws += 1;
            player2.battleStats.draws += 1;

            // this is horrible looking but works. refactor it later
            if (player1.exp >= EXP) {
                player1.exp -= EXP / 2;
            } else {
                player1.exp = 0;
            }

            if (player2.exp >= EXP) {
                player2.exp -= EXP / 2;
            } else {
                player2.exp = 0;
            }

            // player1.exp += EXP / 2;
            // player2.exp += EXP / 2;
            _calculateLevel(player1);
            _calculateLevel(player2);

            emit Main__PlayerAttackedPlayer(
                msg.sender,
                name_to_address[_player2.name],
                "Draw"
            );

            return "Draw";
        }
    }

    // TODO: this should be easy and very specific which monster, re do this with ifs/elses
    // since the front is defining every thing, it's better to do it here
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

        uint256 playerScore = _calculateScore(player.attributes);
        uint256 creatureScore = _calculateScore(creature.attributes);

        // i want a time to cool down so the player has to wait some time before attacking again
        require(
            block.timestamp >= player.lastAttackTime + MIN_TIME_WAITING ||
                player.lastAttackTime == 0,
            "Player is waiting"
        );

        player.lastAttackTime = block.timestamp;

        if (playerScore > creatureScore) {
            player.battleStats.wins += 1;

            // kill creature and give exp to player and everything else
            player.exp += creature.expGiven; // call a fn for this, calculate the exp to also update the level
            _calculateLevel(player);

            // give gold according to the creature
            player.gold += creatureAmountOfGold[creature.id];

            emit Main__PlayerAttackedCreature(
                msg.sender,
                creature.id,
                player.name
            );

            return player.name;
        } else if (creatureScore > playerScore) {
            player.battleStats.losses += 1;

            player.alive = false;
            // this is done so there is no underflow
            if (creature.expGiven >= player.exp) {
                player.exp = 0;
            } else {
                player.exp -= creature.expGiven;
            }
            // player.exp -= creature.expGiven;
            _calculateLevel(player);

            emit Main__PlayerAttackedCreature(
                msg.sender,
                creature.id,
                creature.name
            );

            return creature.name;
        } else {
            player.battleStats.draws += 1;
            emit Main__PlayerAttackedCreature(msg.sender, creature.id, "Draw");

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

    // add a check here if udnerlflow, but will revert anyways
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

            emit Main__PlayerImprovedAttribute(msg.sender, _attribute);
        } else if (_attribute == 2) {
            cost = 1 << player.attributes.agility; // Calculate cost as 2^agility
            require(
                player.gold >= cost,
                "Not enough gold for agility improvement"
            );
            player.attributes.agility += 1;
            emit Main__PlayerImprovedAttribute(msg.sender, _attribute);
        } else if (_attribute == 3) {
            cost = 1 << player.attributes.intelligence; // Calculate cost as 2^intelligence
            require(
                player.gold >= cost,
                "Not enough gold for intelligence improvement"
            );
            player.attributes.intelligence += 1;
            emit Main__PlayerImprovedAttribute(msg.sender, _attribute);
        }

        player.gold -= cost; // Deduct cost from player's gold
    }

    // dont know if this is working correctly
    function _calculateLevel(Player storage _player) private {
        uint256 newLevel = Math.sqrt(_player.exp / 1000) + 1;
        _player.level = newLevel;
    }

    //
    // [not sure if follow with this logic of alive and dead, maybe there is a better way] this function is useful because as long as you are dead you can't be attacked.
    function respawn() public {
        Player storage player = players[msg.sender];
        require(!player.alive, "Player is already alive");
        player.alive = true;
        emit Main__PlayerRespawned(msg.sender);
    }

    // TODO:
    // CRETE THE SCOREBOARD
    // EMIT EVENTS FOR EVERYTHING THAT HAPPENS
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
