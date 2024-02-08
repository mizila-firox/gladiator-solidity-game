// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Main {
    // ==============================================
    // ============== VARIABLES =====================

    uint256 constant MIN_TIME_WAITING = 2 minutes;
    uint256 public quantity_players = 0;

    struct Player {
        uint id;
        string name;
        uint256 level;
        uint256 exp;
        uint256 health;
        Attributes attributes;
    }

    struct Attributes {
        uint256 strength;
        uint256 agility;
        uint256 intelligence;
    }

    mapping(address player => Player) public players;
    mapping(string name => address) public name_to_address;
    mapping(address => string name) public address_to_name;

    address public admin;

    // ==============================================
    // ============== ERRORS ========================

    error Main__NotAdmin(address sender, address admin);
    error Main__PlayerAlreadyExists(address player);
    error Main__NameAlreadyExists(string name);

    constructor() {
        admin = msg.sender;
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
            100, // health
            _attributes
        );
    }

    function attack(string memory _player) public {}
}
