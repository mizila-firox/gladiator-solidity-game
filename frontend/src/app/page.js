"use client";

import { useState } from "react";
import PlayerCard from "@/components/game/PlayerCard";
import CreatureGrid from "@/components/game/CreatureGrid";
import ConnectWallet from "@/components/ui/ConnectWallet";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [creating, setCreating] = useState(false);
  const [attacking, setAttacking] = useState(null);

  const creatures = [
    { id: 1, name: "Goblin", level: 1, emoji: "👹", exp: 10, gold: 1 },
    { id: 2, name: "Orc", level: 2, emoji: "🧌", exp: 50, gold: 2 },
    { id: 3, name: "Troll", level: 3, emoji: "🧟", exp: 100, gold: 8 },
    { id: 4, name: "Dragon", level: 4, emoji: "🐉", exp: 500, gold: 16 },
    { id: 5, name: "Hydra", level: 5, emoji: "🐲", exp: 1000, gold: 32 },
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
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

    setCreating(true);
    // Simulate contract call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPlayer({
      name: playerName,
      level: 1,
      exp: 0,
      gold: 0,
      attributes: { strength: 1, agility: 1, intelligence: 1 },
      battleStats: { wins: 0, losses: 0, draws: 0 },
    });
    setCreating(false);
  };

  const attackCreature = async (creatureId) => {
    setAttacking(creatureId);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const creature = creatures[creatureId - 1];
    const won = Math.random() > 0.3;

    if (won) {
      setPlayer((prev) => ({
        ...prev,
        exp: prev.exp + creature.exp,
        gold: prev.gold + creature.gold,
        battleStats: { ...prev.battleStats, wins: prev.battleStats.wins + 1 },
      }));
      alert(
        `Victory! You gained ${creature.exp} EXP and ${creature.gold} gold!`
      );
    } else {
      setPlayer((prev) => ({
        ...prev,
        battleStats: {
          ...prev.battleStats,
          losses: prev.battleStats.losses + 1,
        },
      }));
      alert("Defeat! Better luck next time!");
    }
    setAttacking(null);
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
            <div className="flex space-x-4 text-sm">
              <div className="text-center">
                <div className="gold-text font-bold">
                  🪙 {player?.gold || 0}
                </div>
                <div>Gold</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">
                  ⭐ {player?.exp || 0}
                </div>
                <div>EXP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              </nav>
            </div>
          </div>
        </div>

        {/* Character */}
        <div className="col-span-3">
          <div className="panel">
            <div className="panel-inner">
              {!player ? (
                <div>
                  <h3 className="medieval-title text-lg mb-4 text-center">
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
                      Level {player.level}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="gold-text">💪 Strength</span>
                        <span className="text-red-400">
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

                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="gold-text">🏃 Agility</span>
                        <span className="text-green-400">
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

                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="gold-text">🧠 Intelligence</span>
                        <span className="text-blue-400">
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
                      <h4 className="medieval-title text-center mb-2">
                        Battle Record
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div>
                          <div className="text-green-400 font-bold">
                            {player.battleStats.wins}
                          </div>
                          <div>Wins</div>
                        </div>
                        <div>
                          <div className="text-red-400 font-bold">
                            {player.battleStats.losses}
                          </div>
                          <div>Losses</div>
                        </div>
                        <div>
                          <div className="text-yellow-400 font-bold">
                            {player.battleStats.draws}
                          </div>
                          <div>Draws</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="col-span-4">
          <div className="panel">
            <div className="panel-inner">
              <h3 className="medieval-title text-xl mb-4 text-center">
                Equipment
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
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

              <h4 className="gold-text font-bold mb-2">Inventory</h4>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="equipment-slot"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Arena */}
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
