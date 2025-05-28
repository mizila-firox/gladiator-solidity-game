"use client";

import { useState } from "react";

export default function PlayerCard({ player, onCreatePlayer }) {
  const [playerName, setPlayerName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreatePlayer = async () => {
    if (!playerName.trim()) {
      alert("Please enter a gladiator name!");
      return;
    }

    setCreating(true);
    try {
      await onCreatePlayer(playerName);
    } catch (error) {
      console.error("Error creating player:", error);
      alert("Failed to create player. Please try again.");
    }
    setCreating(false);
  };

  if (!player) {
    return (
      <div className="gladiatus-panel">
        <div className="gladiatus-inner">
          <h3 className="medieval-text text-lg mb-4 text-center">
            Create Gladiator
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter gladiator name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-yellow-600 rounded text-yellow-100 placeholder-yellow-600/50 focus:outline-none focus:border-yellow-400"
              maxLength={20}
            />
            <button
              onClick={handleCreatePlayer}
              disabled={creating || !playerName.trim()}
              className="gladiatus-button w-full py-3 text-lg"
            >
              {creating ? "⚔️ Creating..." : "⚔️ Create Gladiator"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gladiatus-panel">
      <div className="gladiatus-inner">
        {/* Character Portrait */}
        <div className="character-portrait mb-4 p-4 text-center">
          <div className="text-6xl mb-2">🏛️</div>
          <h3 className="medieval-text text-xl gold-text">{player.name}</h3>
          <p className="text-sm text-yellow-300">
            Level {player.level} Gladiator
          </p>
        </div>

        {/* Attributes with Gladiatus-style bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="gold-text">💪 Strength</span>
              <span className="text-red-400 font-bold">
                {player.attributes?.strength || 1}
              </span>
            </div>
            <div className="stat-bar-container">
              <div className="stat-bar">
                <div
                  className="stat-fill strength"
                  style={{
                    width: `${Math.min(
                      (player.attributes?.strength || 1) * 10,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="gold-text">🏃 Agility</span>
              <span className="text-green-400 font-bold">
                {player.attributes?.agility || 1}
              </span>
            </div>
            <div className="stat-bar-container">
              <div className="stat-bar">
                <div
                  className="stat-fill agility"
                  style={{
                    width: `${Math.min(
                      (player.attributes?.agility || 1) * 10,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="gold-text">🧠 Intelligence</span>
              <span className="text-blue-400 font-bold">
                {player.attributes?.intelligence || 1}
              </span>
            </div>
            <div className="stat-bar-container">
              <div className="stat-bar">
                <div
                  className="stat-fill intelligence"
                  style={{
                    width: `${Math.min(
                      (player.attributes?.intelligence || 1) * 10,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Record */}
        <div className="gladiatus-panel mb-4">
          <div className="p-3">
            <h4 className="medieval-text text-center mb-2 gold-text">
              Battle Record
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="resource-display">
                <div className="text-green-400 font-bold">
                  {player.battleStats?.wins || 0}
                </div>
                <div>Wins</div>
              </div>
              <div className="resource-display">
                <div className="text-red-400 font-bold">
                  {player.battleStats?.losses || 0}
                </div>
                <div>Losses</div>
              </div>
              <div className="resource-display">
                <div className="text-yellow-400 font-bold">
                  {player.battleStats?.draws || 0}
                </div>
                <div>Draws</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Buttons */}
        <div className="space-y-2">
          <h4 className="medieval-text text-center gold-text text-sm">
            Upgrade Attributes
          </h4>
          <div className="grid grid-cols-3 gap-1">
            <button className="gladiatus-button text-xs py-2">💪 STR</button>
            <button className="gladiatus-button text-xs py-2">🏃 AGI</button>
            <button className="gladiatus-button text-xs py-2">🧠 INT</button>
          </div>
        </div>
      </div>
    </div>
  );
}
