"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import PlayerCard from "@/components/game/PlayerCard";
import CreatureGrid from "@/components/game/CreatureGrid";
import ConnectWallet from "@/components/ui/ConnectWallet";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x07883bA76958F85C97804ba2f599dA41bFF08848"; // You need to deploy your contract and put the address here
const CONTRACT_ABI = [
  "function createPlayer(string memory _name) public",
  "function determineWinnerWithCreature(uint256 _creatureId) public returns (string memory)",
  "function improveAttribute(uint16 _attribute) public",
  "function get_players(address _address) public view returns (tuple(uint256 id, string name, uint256 level, uint256 exp, uint256 lastAttackTime, uint256 gold, tuple(uint256 wins, uint256 losses, uint256 draws) battleStats, tuple(uint256 strength, uint256 agility, uint256 intelligence) attributes, address playerAddress))",
];

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [player, setPlayer] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [creating, setCreating] = useState(false);
  const [attacking, setAttacking] = useState(null);
  const [contract, setContract] = useState(null);

  const creatures = [
    { id: 1, name: "Goblin", level: 1, emoji: "👹", exp: 10, gold: 1 },
    { id: 2, name: "Orc", level: 2, emoji: "🧌", exp: 50, gold: 2 },
    { id: 3, name: "Troll", level: 3, emoji: "🧟", exp: 100, gold: 8 },
    { id: 4, name: "Dragon", level: 4, emoji: "🐉", exp: 500, gold: 16 },
    { id: 5, name: "Hydra", level: 5, emoji: "🐲", exp: 1000, gold: 32 },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await setupContract(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const setupContract = async (userAccount) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setContract(contract);

      // Load player data if exists
      await loadPlayerData(contract, userAccount);
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  };

  const loadPlayerData = async (contract, userAccount) => {
    try {
      const playerData = await contract.get_players(userAccount);

      if (playerData.id > 0) {
        setPlayer({
          id: Number(playerData.id),
          name: playerData.name,
          level: Number(playerData.level),
          exp: Number(playerData.exp),
          gold: Number(playerData.gold),
          attributes: {
            strength: Number(playerData.attributes.strength),
            agility: Number(playerData.attributes.agility),
            intelligence: Number(playerData.attributes.intelligence),
          },
          battleStats: {
            wins: Number(playerData.battleStats.wins),
            losses: Number(playerData.battleStats.losses),
            draws: Number(playerData.battleStats.draws),
          },
        });
      }
    } catch (error) {
      console.error("Error loading player data:", error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setIsConnected(true);
        await setupContract(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const createPlayer = async () => {
    if (!playerName.trim()) {
      alert("Please enter a gladiator name!");
      return;
    }

    if (!contract) {
      alert(
        "Contract not connected! Please deploy your contract and update the CONTRACT_ADDRESS"
      );
      return;
    }

    setCreating(true);
    try {
      const tx = await contract.createPlayer(playerName);
      console.log("Transaction sent:", tx.hash);

      await tx.wait();
      console.log("Transaction confirmed!");

      await loadPlayerData(contract, account);
      alert("Gladiator created successfully!");
    } catch (error) {
      console.error("Error creating player:", error);
      alert("Failed to create player: " + error.message);
    }
    setCreating(false);
  };

  const attackCreature = async (creatureId) => {
    if (!contract) {
      alert("Contract not connected!");
      return;
    }

    setAttacking(creatureId);
    try {
      const tx = await contract.determineWinnerWithCreature(creatureId);
      console.log("Attack transaction sent:", tx.hash);

      await tx.wait();
      console.log("Attack confirmed!");

      await loadPlayerData(contract, account);
      alert("Battle completed!");
    } catch (error) {
      console.error("Error attacking creature:", error);
      alert("Attack failed: " + error.message);
    }
    setAttacking(null);
  };

  const upgradeAttribute = async (attributeId) => {
    if (!contract) {
      alert("Contract not connected!");
      return;
    }

    try {
      const tx = await contract.improveAttribute(attributeId);
      console.log("Upgrade transaction sent:", tx.hash);

      await tx.wait();
      console.log("Upgrade confirmed!");

      await loadPlayerData(contract, account);
      alert("Attribute upgraded!");
    } catch (error) {
      console.error("Error upgrading attribute:", error);
      alert("Upgrade failed: " + error.message);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="panel max-w-2xl w-full">
          <div className="panel-inner text-center">
            <h1 className="medieval-title text-4xl mb-6">
              ⚔️ GLADIATOR ARENA ⚔️
            </h1>
            <p className="text-xl mb-8 gold-text">
              Fight monsters, battle players, and become the ultimate gladiator!
            </p>
            <button onClick={connectWallet} className="btn-gold text-xl">
              ⚔️ Connect Wallet & Enter Arena
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="panel mb-4">
        <div className="panel-inner">
          <div className="flex justify-between items-center">
            <h1 className="medieval-title text-2xl">⚔️ GLADIATOR ARENA</h1>
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="gold-text font-bold text-lg">
                  🪙 {player?.gold || 0}
                </div>
                <div className="text-xs">Gold</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">
                  ⭐ {player?.exp || 0}
                </div>
                <div className="text-xs">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-xs">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <div className="text-xs">Connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Original Layout */}
      <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
        {/* Left Menu */}
        <div className="col-span-2">
          <div className="panel">
            <div className="panel-inner">
              <h3 className="medieval-title text-lg mb-4 text-center">Menu</h3>
              <nav className="space-y-2">
                <div className="p-2 rounded hover:bg-yellow-600/20 transition-colors gold-text cursor-pointer">
                  🏛️ Arena
                </div>
                <div className="p-2 rounded hover:bg-yellow-600/20 transition-colors gold-text cursor-pointer">
                  👤 Profile
                </div>
                <div className="p-2 rounded hover:bg-yellow-600/20 transition-colors gold-text cursor-pointer">
                  🏆 Leaderboard
                </div>
                <div className="p-2 rounded hover:bg-yellow-600/20 transition-colors gold-text cursor-pointer">
                  ⚔️ Battle
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Character Panel */}
        <div className="col-span-4">
          <div className="panel">
            <div className="panel-inner">
              {!player ? (
                <div>
                  <h3 className="medieval-title text-xl mb-4 text-center">
                    Create Gladiator
                  </h3>
                  <input
                    type="text"
                    placeholder="Enter gladiator name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full p-3 mb-4 bg-stone-800 border-2 border-yellow-600 rounded text-yellow-100 placeholder-yellow-600/50"
                    maxLength={20}
                  />
                  <button
                    onClick={createPlayer}
                    disabled={creating || !playerName.trim()}
                    className="btn-gold w-full"
                  >
                    {creating ? "⚔️ Creating..." : "⚔️ Create Gladiator"}
                  </button>
                </div>
              ) : (
                <div>
                  {/* Character Portrait */}
                  <div className="character-portrait p-4 mb-4 text-center">
                    <div className="text-4xl mb-2">🏛️</div>
                    <h3 className="medieval-title text-lg">{player.name}</h3>
                    <p className="text-sm text-yellow-300">
                      Level {player.level} Gladiator
                    </p>
                  </div>

                  {/* Only Contract Attributes */}
                  <div className="space-y-3 mb-4">
                    <h4 className="medieval-title text-center mb-2 gold-text">
                      Attributes
                    </h4>

                    {/* Strength */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="gold-text">💪 Strength</span>
                        <span className="text-red-400 font-bold">
                          {player.attributes.strength}
                        </span>
                      </div>
                      <div className="stat-bar">
                        <div
                          className="stat-fill stat-strength"
                          style={{
                            width: `${Math.min(
                              player.attributes.strength * 10,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Agility */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="gold-text">🏃 Agility</span>
                        <span className="text-green-400 font-bold">
                          {player.attributes.agility}
                        </span>
                      </div>
                      <div className="stat-bar">
                        <div
                          className="stat-fill stat-agility"
                          style={{
                            width: `${Math.min(
                              player.attributes.agility * 10,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Intelligence */}
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="gold-text">🧠 Intelligence</span>
                        <span className="text-blue-400 font-bold">
                          {player.attributes.intelligence}
                        </span>
                      </div>
                      <div className="stat-bar">
                        <div
                          className="stat-fill stat-intelligence"
                          style={{
                            width: `${Math.min(
                              player.attributes.intelligence * 10,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Battle Stats */}
                  <div className="panel mb-4">
                    <div className="p-3">
                      <h4 className="medieval-title text-center mb-2 gold-text">
                        Battle Record
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div className="bg-green-600/20 p-2 rounded border border-green-600/50">
                          <div className="text-green-400 font-bold">
                            {player.battleStats.wins}
                          </div>
                          <div>Wins</div>
                        </div>
                        <div className="bg-red-600/20 p-2 rounded border border-red-600/50">
                          <div className="text-red-400 font-bold">
                            {player.battleStats.losses}
                          </div>
                          <div>Losses</div>
                        </div>
                        <div className="bg-yellow-600/20 p-2 rounded border border-yellow-600/50">
                          <div className="text-yellow-400 font-bold">
                            {player.battleStats.draws}
                          </div>
                          <div>Draws</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Buttons */}
                  <div className="space-y-2">
                    <h4 className="medieval-title text-center gold-text text-sm">
                      Upgrade Attributes
                    </h4>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => upgradeAttribute(1)}
                        className="btn-gold text-xs py-2"
                      >
                        💪 STR
                      </button>
                      <button
                        onClick={() => upgradeAttribute(2)}
                        className="btn-gold text-xs py-2"
                      >
                        🏃 AGI
                      </button>
                      <button
                        onClick={() => upgradeAttribute(3)}
                        className="btn-gold text-xs py-2"
                      >
                        🧠 INT
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Equipment Panel */}
        <div className="col-span-3">
          <div className="panel">
            <div className="panel-inner">
              <h3 className="medieval-title text-xl mb-4 text-center">
                Equipment
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="equipment-slot">
                  <span className="text-xl">🛡️</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">⛑️</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">🗡️</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">🧤</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">👕</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">💍</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">👖</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">🥾</span>
                </div>
                <div className="equipment-slot">
                  <span className="text-xl">📿</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arena Panel */}
        <div className="col-span-3">
          <div className="panel">
            <div className="panel-inner">
              <h3 className="medieval-title text-xl mb-4 text-center">
                🏛️ Arena
              </h3>
              {player ? (
                <div className="space-y-3">
                  {creatures.map((creature) => (
                    <div key={creature.id} className="creature-card">
                      <div className="flex items-center space-x-3">
                        <div className="character-portrait w-12 h-12 flex items-center justify-center">
                          <span className="text-xl">{creature.emoji}</span>
                        </div>

                        <div className="flex-1">
                          <h4 className="gold-text font-bold text-sm">
                            {creature.name}
                          </h4>
                          <p className="text-xs text-yellow-300">
                            Level {creature.level}
                          </p>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-blue-400">
                              ⭐ {creature.exp}
                            </span>
                            <span className="gold-text">
                              🪙 {creature.gold}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => attackCreature(creature.id)}
                          disabled={attacking === creature.id}
                          className="btn-gold text-xs px-2 py-1"
                        >
                          {attacking === creature.id ? "⚔️" : "Attack"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="gold-text">
                    Create your gladiator to enter the arena!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
