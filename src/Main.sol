// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "openzeppelin-contracts/contracts/utils/math/Math.sol";

// @audit contract wont work when importing the Test framework
// @audit contract wont work when importing the Test framework
contract Main is Test {
    // ==============================================
    // ============== VARIABLES =====================

    uint256 public num = 777;

    uint256 constant MIN_TIME_WAITING_FOR_ALL_PLAYERS = 30 seconds;
    uint256 constant HOURS_TO_ATTACK_SAME_PLAYER_AGAIN = 1 hours;
    uint256 public minGoldToTake = 10;
    uint256 constant EXP = 100; // just leave this magic number here for now, it does not even need to be a constant
    uint256 public quantity_players = 0;
    uint256 private nonce = 0;

    struct Player {
        uint256 id;
        string name;
        uint256 level;
        uint256 exp;
        // bool alive; // when it dies it loses exp
        uint256 lastAttackTime;
        uint256 gold; // update this later to a struct containing more things, like items for example
        PlayerBattleStats battleStats;
        Attributes attributes;
        // address[] playersAttacked;??
        // address[] creaturesAttacked;??
        // address of owner to make it simpler instead of having to search every time
        address playerAddress;
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

    address public admin; // for banning cheaters only? if so add a ban function

    // ==============================================
    // ============== ERRORS ========================

    error Main__NameCanNotBeEmpty();
    error Main__NotAdmin(address sender, address admin);
    error Main__PlayerAlreadyExists(address player);
    error Main__NameAlreadyExists(string name);
    error Main__CreatureDoesNotExist(uint256 id);

    // ==============================================
    // ============== EVENTS ========================
    event Main__PlayerCreated(address indexed player, string indexed name);
    event Main__PlayerAttackedPlayer(
        address indexed player1,
        address indexed player2,
        string indexed winner
    );
    event Main__PlayerAttackedCreature(
        address indexed player,
        uint256 indexed creatureId,
        string indexed winner
    );
    event Main__PlayerRespawned(address indexed player);
    event Main__PlayerImprovedAttribute(
        address indexed player,
        uint16 indexed attribute
    );

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
        if (bytes(_name).length == 0) {
            revert Main__NameCanNotBeEmpty();
        }
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
            0, // exp @audit-issue lets go with exp defines the level, first create the level function
            0, // lastAttackTime
            // true, // alive
            0, // gold
            _battleStats,
            _attributes,
            msg.sender
        );

        emit Main__PlayerCreated(msg.sender, _name);
    }

    function attackPlayer(string memory _player2) public {
        Player memory _player2Exist = players[name_to_address[_player2]];
        require(
            _player2Exist.playerAddress != address(0),
            "Player does not exist"
        );

        determineWinnerPlayers(_player2);
    }

    // this is a pseudo random number, it's not secure, but it's good enough for now
    function getPseudoRandomNumber() public returns (uint256) {
        uint256 randomNumber = (uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))
        ) % 5) + 1; // from 1 to 5
        nonce++;

        return randomNumber;
    }

    // calculates the chance of winning of each player and checks who has the highest score
    function _calculateScore(
        Attributes memory attributes
    ) private returns (uint256) {
        // Define weights for each attribute
        // uint256 weightLuck = 2; // this luck is random and will be assigned each time the player attack.
        uint256 weightLuck = 1; //@audit-info leave 0 for testing so the player can never loose for like this for the GOBLIN  // this luck is random and will be assigned each time the player attack.
        uint256 weightStrength = 2; // idealy these would be random within a range
        uint256 weightAgility = 2;
        uint256 weightIntelligence = 2;

        uint256 luck = getPseudoRandomNumber();

        uint256 score = (attributes.strength * weightStrength) +
            (attributes.agility * weightAgility) +
            (attributes.intelligence * weightIntelligence) +
            (luck * weightLuck);
        return score;
    }

    // here we are verifying and setting a cooldown for the player to attack another player,
    // player can attack different players every X time [shorter period] but must wait more time to attack the same player again
    function _isAllowedToAttackAnotherPlayer(
        address _player1,
        address _player2
    ) private returns (bool) {
        // this one checks for p1 cool down for a SPECIFIC players
        require(
            block.timestamp >=
                timeToWaitToAttackAnotherPlayer[_player1][_player2],
            "You need to wait X time to attack this player again"
        );

        // this one checks for p1 cool down for all players
        require(
            block.timestamp >=
                players[_player1].lastAttackTime +
                    MIN_TIME_WAITING_FOR_ALL_PLAYERS ||
                players[_player1].lastAttackTime == 0,
            "Player is waiting"
        );

        timeToWaitToAttackAnotherPlayer[_player1][_player2] =
            block.timestamp +
            HOURS_TO_ATTACK_SAME_PLAYER_AGAIN;

        players[_player1].lastAttackTime = block.timestamp;

        return true;
    }

    // is this the correct one?
    function determineWinnerPlayers(
        string memory _player2
    ) private returns (string memory) {
        Player storage player1 = players[msg.sender];
        Player storage player2 = players[name_to_address[_player2]];

        // checking X hours to attack another player
        _isAllowedToAttackAnotherPlayer(msg.sender, name_to_address[_player2]);

        // PLAYER CANT ATTACK HIMSELF
        require(
            msg.sender != name_to_address[_player2],
            "Player can't attack himself"
        );

        // calculates the fight
        uint256 player1Score = _calculateScore(player1.attributes);
        uint256 player2Score = _calculateScore(player2.attributes);

        // heree
        // i want a time to cool down so the player has to wait some time before attacking again
        // the above one is different from this one, one is if one player can attack again the other and this one is if the player can attack again after the X minutes have passed

        // REDUNDANT TOO, BEING CHECKED IN THE FUNCTION ABOVE
        // require(
        //     block.timestamp >= player1.lastAttackTime + MIN_TIME_WAITING_FOR_ALL_PLAYERS ||
        //         player1.lastAttackTime == 0,
        //     "Player is waiting"
        // );

        // player1.lastAttackTime = block.timestamp; // [MAYBE NOT] should we update player2 too so he doesnt get attacked again by other players or not??

        if (player1Score > player2Score) {
            _calculateLevelPlayerAgainstPlayer(
                FightResult.WIN,
                player1,
                player2
            );

            emit Main__PlayerAttackedPlayer(
                msg.sender,
                name_to_address[_player2],
                player1.name
            );

            return player1.name;
            //
        } else if (player2Score > player1Score) {
            _calculateLevelPlayerAgainstPlayer(
                FightResult.LOSS,
                player1,
                player2
            );

            emit Main__PlayerAttackedPlayer(
                msg.sender,
                name_to_address[_player2],
                player2.name
            );

            return player2.name;
        } else {
            _calculateLevelPlayerAgainstPlayer(
                FightResult.DRAW,
                player1,
                player2
            );

            emit Main__PlayerAttackedPlayer(
                msg.sender,
                name_to_address[_player2],
                "Draw"
            );

            return "Draw";
        }
    }

    // attacking creatures
    function determineWinnerWithCreature(
        uint256 _creatureId
    ) public returns (string memory) {
        Player storage player = players[msg.sender];
        Creature memory creature = creatures[_creatureId];

        // check if creature exists
        if (creature.id == 0 || creature.id > 5) {
            revert Main__CreatureDoesNotExist(_creatureId);
        }

        // is player alive?
        // if (!player.alive) {
        //     revert("Player is dead");
        // }

        // the one who makes the more amount of points wins
        uint256 playerScore = _calculateScore(player.attributes);
        uint256 creatureScore = _calculateScore(creature.attributes);
        console.log(playerScore, creatureScore);

        // i want a time to cool down so the player has to wait some time before attacking again
        require(
            block.timestamp >=
                player.lastAttackTime + MIN_TIME_WAITING_FOR_ALL_PLAYERS ||
                player.lastAttackTime == 0,
            "Player is waiting"
        );

        player.lastAttackTime = block.timestamp;

        if (playerScore > creatureScore) {
            player.battleStats.wins += 1;

            // kill creature and give exp to player and everything else
            _calculateLevel(FightResult.WIN, player, creature);
            // give gold according to the creature. after maybe make a random amount of gold?
            player.gold += creatureAmountOfGold[creature.id];

            emit Main__PlayerAttackedCreature(
                msg.sender,
                creature.id,
                player.name
            );

            return player.name;
        } else if (creatureScore > playerScore) {
            player.battleStats.losses += 1;
            // player.alive = false;
            _calculateLevel(FightResult.LOSS, player, creature);
            emit Main__PlayerAttackedCreature(
                msg.sender,
                creature.id,
                creature.name
            );

            // TODO: should the player lose gold when he dies?
            return creature.name;
        } else {
            player.battleStats.draws += 1;
            _calculateLevel(FightResult.DRAW, player, creature);
            emit Main__PlayerAttackedCreature(msg.sender, creature.id, "Draw");

            return "Draw";
        }
    }

    // @audit-ok
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

    // add a check here if underflow, but will revert anyways
    function improveAttribute(uint16 _attribute) public {
        Player storage player = players[msg.sender];
        uint cost;

        require(_attribute >= 1 && _attribute <= 3, "Invalid attribute"); // 1 = strength, 2 = agility, 3 = intelligence

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

    enum FightResult {
        LOSS,
        WIN,
        DRAW
    }

    // TODO: if the
    function _calculateLevel(
        FightResult _fightResult,
        Player storage _player,
        Creature memory _creature
    ) private {
        if (_fightResult == FightResult.WIN) {
            _player.exp += _creature.expGiven;
            // add gold to the player
            _player.gold += creatureAmountOfGold[_creature.id];

            //
        } else if (_fightResult == FightResult.LOSS) {
            if (_player.exp >= _creature.expGiven) {
                _player.exp -= _creature.expGiven;
            } else {
                _player.exp = 0;
            }

            // remove gold from the player
            if (_player.gold >= creatureAmountOfGold[_creature.id]) {
                _player.gold -= creatureAmountOfGold[_creature.id];
            } else {
                _player.gold = 0;
            }
        } else {
            // DRAW nothing happens for now
        }

        // Recalculate the player's level based on the new exp amount.
        uint256 newLevel = Math.sqrt(_player.exp / 1000) + 1;
        _player.level = newLevel;
    }

    function _calculateLevelPlayerAgainstPlayer(
        FightResult _fightResult,
        Player storage _player,
        Player storage _player2
    ) private {
        if (_fightResult == FightResult.WIN) {
            // updates both players exp, if the player2 exp is less than the exp given, it will be 0 so it does not go negative

            // this is taking 10 gold from player2 and giving it to player1, but it can be changed later according to the amount of gold the player being attacked has
            uint256 player2Gold = _player2.gold;
            if (player2Gold >= 10) {
                _player2.gold -= 10;
                _player.gold += 10;
            } else {
                _player2.gold = 0;
                _player.gold += player2Gold;
            }

            if (_player2.exp >= EXP) {
                _player2.exp -= EXP;
            } else {
                _player2.exp = 0;
            }

            _player.battleStats.wins += 1;
            _player2.battleStats.losses += 1;

            //
        } else if (_fightResult == FightResult.LOSS) {
            if (_player.exp >= EXP) {
                _player.exp -= EXP;

                // remove gold from p1 and give 10gold to p2
                if (_player.gold >= 10) {
                    _player.gold -= 10;
                    _player2.gold += 10;
                } else {
                    _player.gold = 0;
                    _player2.gold += _player.gold;
                }
            } else {
                _player.exp = 0;
            }

            _player.battleStats.losses += 1;
            _player2.battleStats.wins += 1;

            // IF WE INCREASE PLAYER2 EXP BY HIM BEING ATTACKED, IT CAN BE USED TO GAME THE SYSTEM, SO WE WILL NOT INCREASE IT
        } else {
            // DRAW nothing happens for now
            _player.battleStats.draws += 1;
            _player2.battleStats.draws += 1;
        }

        // CALCULATE THIS PART BELLOW IN ANOTHER FN????!!!!
        // Recalculate the player's level based on the new exp amount.
        uint256 newLevel = Math.sqrt(_player.exp / 1000) + 1;
        _player.level = newLevel;

        // now calculate player2 level
        uint256 newLevel2 = Math.sqrt(_player2.exp / 1000) + 1;
        _player2.level = newLevel2;
    }

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
