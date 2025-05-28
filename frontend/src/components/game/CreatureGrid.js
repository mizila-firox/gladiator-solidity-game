"use client";

import { useState } from "react";

const creatures = [
  {
    id: 1,
    name: "Goblin",
    level: 1,
    emoji: "👹",
    difficulty: "Weak",
    exp: 10,
    gold: 1,
  },
  {
    id: 2,
    name: "Orc",
    level: 2,
    emoji: "🧌",
    difficulty: "Normal",
    exp: 50,
    gold: 2,
  },
  {
    id: 3,
    name: "Troll",
    level: 3,
    emoji: "🧟",
    difficulty: "Strong",
    exp: 100,
    gold: 8,
  },
  {
    id: 4,
    name: "Dragon",
    level: 4,
    emoji: "🐉",
    difficulty: "Elite",
    exp: 500,
    gold: 16,
  },
  {
    id: 5,
    name: "Hydra",
    level: 5,
    emoji: "🐲",
    difficulty: "Legendary",
    exp: 1000,
    gold: 32,
  },
];

export default function CreatureGrid({ onAttackCreature }) {
  const [attacking, setAttacking] = useState(null);

  const attackCreature = async (creatureId) => {
    setAttacking(creatureId);
    try {
      if (onAttackCreature) {
        await onAttackCreature(creatureId);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error("Attack failed:", error);
      alert("Attack failed! Please try again.");
    }
    setAttacking(null);
  };

  return (
    <div className="space-y-3">
      {creatures.map((creature) => (
        <div key={creature.id} className="creature-card p-3">
          <div className="flex items-center space-x-3">
            <div className="character-portrait w-16 h-16 flex items-center justify-center">
              <span className="text-2xl">{creature.emoji}</span>
            </div>

            <div className="flex-1">
              <h4 className="gold-text font-bold">{creature.name}</h4>
              <p className="text-xs text-yellow-300">
                Level {creature.level} • {creature.difficulty}
              </p>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-blue-400">⭐ {creature.exp}</span>
                <span className="gold-text">🪙 {creature.gold}</span>
              </div>
            </div>

            <button
              onClick={() => attackCreature(creature.id)}
              disabled={attacking === creature.id}
              className="gladiatus-button px-3 py-1 text-xs"
            >
              {attacking === creature.id ? "⚔️" : "Attack"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
