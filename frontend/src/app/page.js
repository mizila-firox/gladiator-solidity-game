"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import styled from "styled-components";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x07883bA76958F85C97804ba2f599dA41bFF08848";
const CONTRACT_ABI = [
  "function createPlayer(string memory _name) public",
  "function determineWinnerWithCreature(uint256 _creatureId) public returns (string memory)",
  "function improveAttribute(uint16 _attribute) public",
  "function get_players(address _address) public view returns (tuple(uint256 id, string name, uint256 level, uint256 exp, uint256 lastAttackTime, uint256 gold, tuple(uint256 wins, uint256 losses, uint256 draws) battleStats, tuple(uint256 strength, uint256 agility, uint256 intelligence) attributes, address playerAddress))",
  "function getTopPlayers() public view returns (tuple(address playerAddress, uint256 exp)[10] memory)",
  "function quantity_players() public view returns (uint256)",
  "function attackPlayer(string memory _player2) public",
];

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #2d1810 0%,
    #4a2c1a 25%,
    #3d2317 50%,
    #2d1810 75%,
    #1a0f08 100%
  );
  font-family: "Cinzel", serif;
  color: #f4e4bc;
`;

const Header = styled.header`
  background: linear-gradient(
    145deg,
    #8b4513 0%,
    #a0522d 15%,
    #cd853f 30%,
    #daa520 45%,
    #cd853f 60%,
    #a0522d 85%,
    #8b4513 100%
  );
  border: 3px solid #daa520;
  border-bottom: 4px solid #daa520;
  padding: 12px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-weight: 700;
  color: #daa520;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-size: 1.75rem;
  margin: 0;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 20px;
  font-size: 0.8rem;
`;

const StatItem = styled.div`
  text-align: center;

  .value {
    font-weight: bold;
    font-size: 1rem;
    color: ${(props) => props.color || "#ffd700"};
  }

  .label {
    font-size: 0.7rem;
    opacity: 0.8;
  }
`;

const MainLayout = styled.div`
  display: flex;
  height: calc(100vh - 70px);
`;

const Sidebar = styled.aside`
  width: 260px;
  background: linear-gradient(
    145deg,
    #8b4513 0%,
    #a0522d 15%,
    #cd853f 30%,
    #daa520 45%,
    #cd853f 60%,
    #a0522d 85%,
    #8b4513 100%
  );
  border-right: 3px solid #daa520;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.6);
  overflow-y: auto;
`;

const SidebarInner = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 2px solid #8b4513;
  margin: 4px;
  padding: 16px;
  height: calc(100% - 8px);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
`;

const MainContent = styled.main`
  flex: 1;
  background: linear-gradient(
    145deg,
    #8b4513 0%,
    #a0522d 15%,
    #cd853f 30%,
    #daa520 45%,
    #cd853f 60%,
    #a0522d 85%,
    #8b4513 100%
  );
  border: 3px solid #daa520;
  border-left: none;
  margin: 0 4px 4px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
`;

const ContentInner = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 2px solid #8b4513;
  margin: 4px;
  padding: 20px;
  height: calc(100% - 8px);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
`;

const Panel = styled.div`
  background: linear-gradient(
    145deg,
    #8b4513 0%,
    #a0522d 15%,
    #cd853f 30%,
    #daa520 45%,
    #cd853f 60%,
    #a0522d 85%,
    #8b4513 100%
  );
  border: 3px solid #daa520;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
`;

const PanelInner = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 2px solid #8b4513;
  border-radius: 4px;
  margin: 4px;
  padding: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
`;

const MenuTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-weight: 700;
  color: #daa520;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  margin-bottom: 12px;
  font-size: 1rem;
`;

const MenuItem = styled.div`
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  margin-bottom: 6px;
  border: 1px solid transparent;
  background: ${(props) =>
    props.active ? "rgba(255, 215, 0, 0.3)" : "transparent"};
  border-color: ${(props) =>
    props.active ? "rgba(255, 215, 0, 0.5)" : "transparent"};

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.3);
  }
`;

const CharacterPortrait = styled.div`
  background: linear-gradient(135deg, #1a0f08 0%, #2d1810 50%, #1a0f08 100%);
  border: 3px solid #daa520;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(218, 165, 32, 0.3);

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 8px;
    border: 3px solid #daa520;
    object-fit: cover;
    box-shadow: 0 0 15px rgba(218, 165, 32, 0.5);
  }

  .name {
    font-size: 1.125rem;
    font-weight: bold;
    color: #daa520;
    margin-bottom: 4px;
  }

  .level {
    font-size: 0.875rem;
    color: #ffd700;
    opacity: 0.9;
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.875rem;

  .label {
    color: #ffd700;
  }

  .value {
    font-weight: bold;
    color: ${(props) => props.valueColor || "#ffd700"};
  }
`;

const StatBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.3);
`;

const StatFill = styled.div`
  height: 100%;
  width: ${(props) => props.width}%;
  background: ${(props) => props.gradient};
  border-radius: 3px;
  box-shadow: ${(props) => props.shadow};
  transition: width 0.3s ease;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

const StatCard = styled.div`
  background: ${(props) => props.bgColor};
  border: 1px solid ${(props) => props.borderColor};
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  color: ${(props) => props.textColor};

  .value {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 2px;
  }

  div:last-child {
    font-size: 0.75rem;
    opacity: 0.9;
  }
`;

const GoldButton = styled.button`
  background: linear-gradient(
    145deg,
    #daa520 0%,
    #ffd700 25%,
    #ffed4e 50%,
    #ffd700 75%,
    #daa520 100%
  );
  border: 2px solid #b8860b;
  border-radius: 6px;
  color: #8b4513;
  font-weight: bold;
  font-family: "Cinzel", serif;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(
      145deg,
      #ffed4e 0%,
      #ffd700 25%,
      #daa520 50%,
      #ffd700 75%,
      #ffed4e 100%
    );
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 2px solid #8b4513;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: #ffd700;
  font-family: "Cinzel", serif;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #daa520;
    box-shadow: 0 0 8px rgba(218, 165, 32, 0.3);
  }

  &::placeholder {
    color: rgba(255, 215, 0, 0.5);
  }
`;

const CreatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

const CreatureCard = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CreatureAvatar = styled.div`
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a0f08 0%, #2d1810 50%, #1a0f08 100%);
  border: 2px solid #daa520;
  border-radius: 50%;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
`;

const CooldownTimer = styled.div`
  background: rgba(255, 69, 0, 0.2);
  border: 1px solid rgba(255, 69, 0, 0.5);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  color: #ff4500;
  font-size: 0.875rem;
  margin-bottom: 12px;
`;

const LeaderboardTable = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 2px solid #8b4513;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
`;

const LeaderboardHeader = styled.div`
  background: linear-gradient(145deg, #8b4513 0%, #daa520 50%, #8b4513 100%);
  padding: 12px;
  display: grid;
  grid-template-columns: 50px 1fr 80px 80px 80px 100px;
  gap: 12px;
  font-weight: bold;
  color: #2c1810;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
`;

const LeaderboardRow = styled.div`
  padding: 12px;
  display: grid;
  grid-template-columns: 50px 1fr 80px 80px 80px 100px;
  gap: 12px;
  border-bottom: 1px solid rgba(139, 69, 19, 0.3);
  color: #ffd700;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }

  .rank {
    font-weight: bold;
    font-size: 1.125rem;
    color: ${(props) =>
      props.rank === 1
        ? "#ffd700"
        : props.rank === 2
        ? "#c0c0c0"
        : props.rank === 3
        ? "#cd7f32"
        : "#ffd700"};
  }

  .name {
    font-weight: bold;
  }

  .address {
    font-size: 0.75rem;
    opacity: 0.7;
  }
`;

const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 24px;
  height: 100%;
`;

const ProfileCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ProfileCard = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 3px solid #daa520;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  width: 100%;
  max-width: 400px;
`;

const ProfileAvatar = styled.img`
  width: 170px;
  height: 170px;
  border-radius: 50%;
  border: 4px solid #daa520;
  object-fit: cover;
  margin: 0 auto 16px;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(218, 165, 32, 0.5);
  display: block;
`;

const PlayerBattleCard = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #daa520;
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .player-avatar {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #1a0f08 0%, #2d1810 50%, #1a0f08 100%);
    border: 2px solid #daa520;
    border-radius: 50%;
    object-fit: cover;
  }

  .player-details {
    .name {
      font-weight: bold;
      color: #daa520;
      font-size: 1.125rem;
    }

    .level {
      color: #ffd700;
      font-size: 0.875rem;
    }

    .stats {
      color: #a0a0a0;
      font-size: 0.75rem;
      margin-top: 4px;
    }
  }
`;

const BattleRecordSection = styled.div`
  margin-bottom: 16px;

  .section-title {
    font-size: 0.875rem;
    color: #daa520;
    font-weight: bold;
    margin-bottom: 8px;
    text-align: center;
  }
`;

// Navigation pages
const PAGES = {
  ARENA: "arena",
  PROFILE: "profile",
  LEADERBOARD: "leaderboard",
  BATTLE: "battle",
  MARKET: "market",
  QUESTS: "quests",
};

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [creating, setCreating] = useState(false);
  const [attacking, setAttacking] = useState(null);
  const [currentPage, setCurrentPage] = useState(PAGES.ARENA);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Fixed creature data to match actual contract rewards (doubled amounts)
  const creatures = [
    { id: 1, name: "Goblin", level: 1, exp: 10, gold: 2, emoji: "👹" }, // 1*2=2 actual
    { id: 2, name: "Orc", level: 2, exp: 50, gold: 4, emoji: "🧌" }, // 2*2=4 actual
    { id: 3, name: "Troll", level: 3, exp: 100, gold: 16, emoji: "💀" }, // 8*2=16 actual
    { id: 4, name: "Dragon", level: 4, exp: 500, gold: 32, emoji: "👺" }, // 16*2=32 actual
    { id: 5, name: "Hydra", level: 5, exp: 1000, gold: 64, emoji: "🐉" }, // 32*2=64 actual
  ];

  // Get gladiator image based on level
  const getGladiatorImage = (level) => {
    if (level >= 90) return "/90-100.webp"; // Emperor (90+)
    if (level >= 80) return "/80-90.webp"; // King (80-89)
    if (level >= 70) return "/70-80.webp"; // Lion (70-79)
    if (level >= 60) return "/60-70.webp"; // Shield Bearer (60-69)
    if (level >= 50) return "/50-60.webp"; // Sword Master (50-59)
    if (level >= 40) return "/40-50.webp"; // Blade Warrior (40-49)
    if (level >= 30) return "/30-40.webp"; // Veteran (30-39)
    if (level >= 20) return "/20-30.webp"; // Mask Warrior (20-29)
    if (level >= 10) return "/10-20.webp"; // Apprentice (10-19)
    return "/0-10.webp"; // Novice (0-9)
  };

  // Calculate player health (100 base + 10 per strength point)
  const getPlayerHealth = () => {
    if (!player) return 100;
    return 100 + player.attributes.strength * 10;
  };

  // Get battle stats properly separated
  const getCreatureBattleStats = () => {
    if (!player) return { wins: 0, losses: 0, draws: 0 };

    // Get total battles from blockchain
    const totalBattles = {
      wins: player.battleStats.wins,
      losses: player.battleStats.losses,
      draws: player.battleStats.draws,
    };

    // Get player battles from localStorage
    const playerKey = `playerBattles_${account}`;
    const savedPlayerBattles = localStorage.getItem(playerKey);
    const playerBattles = savedPlayerBattles
      ? JSON.parse(savedPlayerBattles)
      : { wins: 0, losses: 0, draws: 0 };

    // Creature battles = Total battles - Player battles
    return {
      wins: Math.max(0, totalBattles.wins - playerBattles.wins),
      losses: Math.max(0, totalBattles.losses - playerBattles.losses),
      draws: Math.max(0, totalBattles.draws - playerBattles.draws),
    };
  };

  const getPlayerBattleStats = () => {
    if (!player) return { wins: 0, losses: 0, draws: 0 };
    // Get player battles from localStorage (real PvP battles)
    const saved = localStorage.getItem(`playerBattles_${account}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return { wins: 0, losses: 0, draws: 0 };
  };

  // Calculate upgrade costs (2^current_level)
  const getUpgradeCost = (attributeLevel) => {
    return Math.pow(2, attributeLevel);
  };

  // Calculate cooldown remaining
  useEffect(() => {
    if (!player || !player.lastAttackTime) return;

    const updateCooldown = () => {
      const now = Math.floor(Date.now() / 1000);
      const lastAttack = parseInt(player.lastAttackTime);
      const cooldownDuration = 30; // 30 seconds from contract
      const timeRemaining = Math.max(0, lastAttack + cooldownDuration - now);
      setCooldownTime(timeRemaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [player]);

  const formatCooldownTime = (seconds) => {
    if (seconds <= 0) return "Ready to attack!";
    return `Cooldown: ${seconds}s`;
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (account) {
      loadLeaderboard();
    } else {
      // Clear localStorage keys when no account
      if (typeof window !== "undefined") {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (
            key.includes("creatureBattles_") ||
            key.includes("playerBattles_")
          ) {
            // Don't remove, just reset for current session
          }
        });
      }
    }
  }, [account]);

  // Auto-load data when switching to certain tabs
  const handleTabChange = async (newPage) => {
    setCurrentPage(newPage);

    if (newPage === PAGES.LEADERBOARD || newPage === PAGES.BATTLE) {
      await loadLeaderboard();
    }
  };

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const userAccount = accounts[0];
          setAccount(userAccount);
          await setupContract(userAccount);
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
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(gameContract);
      await loadPlayerData(gameContract, userAccount);
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
          lastAttackTime: Number(playerData.lastAttackTime),
          gold: Number(playerData.gold),
          battleStats: {
            wins: Number(playerData.battleStats.wins),
            losses: Number(playerData.battleStats.losses),
            draws: Number(playerData.battleStats.draws),
          },
          attributes: {
            strength: Number(playerData.attributes.strength),
            agility: Number(playerData.attributes.agility),
            intelligence: Number(playerData.attributes.intelligence),
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
        const userAccount = accounts[0];
        setAccount(userAccount);
        await setupContract(userAccount);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const createPlayer = async () => {
    if (!contract || !playerName.trim()) return;

    setCreating(true);
    try {
      const tx = await contract.createPlayer(playerName.trim());
      await tx.wait();
      await loadPlayerData(contract, account);
      setPlayerName("");
    } catch (error) {
      console.error("Error creating player:", error);
      alert("Error creating player. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const attackCreature = async (creatureId) => {
    if (!contract || cooldownTime > 0) return;

    setAttacking(creatureId);
    try {
      const tx = await contract.determineWinnerWithCreature(creatureId);
      await tx.wait();
      await loadPlayerData(contract, account);
    } catch (error) {
      console.error("Error attacking creature:", error);
      alert("Error attacking creature. Please try again.");
    } finally {
      setAttacking(null);
    }
  };

  const upgradeAttribute = async (attributeId) => {
    if (!contract) return;

    try {
      const tx = await contract.improveAttribute(attributeId);
      await tx.wait();
      await loadPlayerData(contract, account);
    } catch (error) {
      console.error("Error upgrading attribute:", error);
      alert("Error upgrading attribute. Please try again.");
    }
  };

  const loadLeaderboard = async () => {
    if (!contract) return;

    setLoadingLeaderboard(true);
    try {
      const topPlayersData = await contract.getTopPlayers();
      const leaderboardData = [];

      for (let i = 0; i < topPlayersData.length; i++) {
        const topPlayer = topPlayersData[i];
        if (
          topPlayer.playerAddress !==
          "0x0000000000000000000000000000000000000000"
        ) {
          try {
            const playerData = await contract.get_players(
              topPlayer.playerAddress
            );
            if (playerData.id > 0) {
              leaderboardData.push({
                rank: i + 1,
                address: topPlayer.playerAddress,
                name: playerData.name,
                level: Number(playerData.level),
                exp: Number(topPlayer.exp),
                gold: Number(playerData.gold),
                wins: Number(playerData.battleStats.wins),
                losses: Number(playerData.battleStats.losses),
                draws: Number(playerData.battleStats.draws),
              });
            }
          } catch (error) {
            console.error(
              `Error loading player ${topPlayer.playerAddress}:`,
              error
            );
          }
        }
      }
      setLeaderboard(leaderboardData);

      // Also update allPlayers for battle page if we have an account
      if (account) {
        setAllPlayers(
          leaderboardData.filter(
            (p) => p.address.toLowerCase() !== account.toLowerCase()
          )
        );
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const loadAllPlayers = async () => {
    if (!contract) return;

    setLoadingPlayers(true);
    try {
      const totalPlayers = await contract.quantity_players();
      const playersData = [];

      // Note: This is a simplified approach. In a real app, you'd want pagination
      // and a more efficient way to get all players
      for (let i = 1; i <= Math.min(Number(totalPlayers), 50); i++) {
        // We can't directly iterate through all players without knowing their addresses
        // This would need to be implemented differently in a real scenario
        // For now, we'll just use the leaderboard data
      }

      // For now, use leaderboard data as available players
      setAllPlayers(
        leaderboard.filter(
          (p) => p.address.toLowerCase() !== account.toLowerCase()
        )
      );
    } catch (error) {
      console.error("Error loading all players:", error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const attackPlayer = async (playerName) => {
    if (!contract) return;

    try {
      // Store initial stats to determine win/loss for player tracking
      const initialExp = player.exp;
      const initialGold = player.gold;

      const tx = await contract.attackPlayer(playerName);
      await tx.wait();
      await loadPlayerData(contract, account);
      // Reload leaderboard to reflect changes
      await loadLeaderboard();

      // Update player battle record in localStorage
      const newPlayer = await contract.get_players(account);
      const finalExp = Number(newPlayer.exp);
      const finalGold = Number(newPlayer.gold);

      const playerKey = `playerBattles_${account}`;
      const saved = localStorage.getItem(playerKey);
      const currentRecords = saved
        ? JSON.parse(saved)
        : { wins: 0, losses: 0, draws: 0 };

      if (finalExp > initialExp || finalGold > initialGold) {
        currentRecords.wins += 1;
      } else if (finalExp < initialExp || finalGold < initialGold) {
        currentRecords.losses += 1;
      } else {
        currentRecords.draws += 1;
      }

      localStorage.setItem(playerKey, JSON.stringify(currentRecords));
    } catch (error) {
      console.error("Error attacking player:", error);
      alert("Error attacking player. Please try again.");
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case PAGES.ARENA:
        return (
          <>
            <MenuTitle style={{ fontSize: "1.75rem", marginBottom: "20px" }}>
              🏛️ THE ARENA
            </MenuTitle>

            {player ? (
              <>
                {cooldownTime > 0 && (
                  <CooldownTimer>
                    ⏰ {formatCooldownTime(cooldownTime)}
                  </CooldownTimer>
                )}

                <CreatureGrid>
                  {creatures.map((creature) => (
                    <CreatureCard key={creature.id}>
                      <CreatureAvatar>{creature.emoji}</CreatureAvatar>

                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            color: "#ffd700",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            marginBottom: "4px",
                          }}
                        >
                          {creature.name}
                        </h4>
                        <p
                          style={{
                            color: "#ffd700",
                            fontSize: "0.8rem",
                            marginBottom: "8px",
                            opacity: 0.8,
                          }}
                        >
                          Level {creature.level}
                        </p>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "6px",
                            fontSize: "0.8rem",
                            marginBottom: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#4169e1" }}>⭐ EXP:</span>
                            <span
                              style={{ color: "#4169e1", fontWeight: "bold" }}
                            >
                              {creature.exp}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ color: "#ffd700" }}>🪙 Gold:</span>
                            <span
                              style={{ color: "#ffd700", fontWeight: "bold" }}
                            >
                              {creature.gold}
                            </span>
                          </div>
                        </div>

                        <GoldButton
                          onClick={() => attackCreature(creature.id)}
                          disabled={
                            attacking === creature.id || cooldownTime > 0
                          }
                          style={{ width: "100%", padding: "10px" }}
                        >
                          {attacking === creature.id
                            ? "⚔️ Fighting..."
                            : cooldownTime > 0
                            ? `⏰ ${cooldownTime}s`
                            : "⚔️ Attack"}
                        </GoldButton>
                      </div>
                    </CreatureCard>
                  ))}
                </CreatureGrid>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🏛️</div>
                <h4
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "16px",
                    color: "#daa520",
                  }}
                >
                  Welcome to the Arena
                </h4>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#ffd700",
                    marginBottom: "20px",
                  }}
                >
                  Create your gladiator to begin your journey to glory!
                </p>
              </div>
            )}
          </>
        );

      case PAGES.PROFILE:
        return (
          <>
            <MenuTitle style={{ fontSize: "1.75rem", marginBottom: "20px" }}>
              👤 PROFILE
            </MenuTitle>
            {player ? (
              <ProfileContainer>
                <div></div> {/* Left spacer */}
                <ProfileCenter>
                  <ProfileCard>
                    <ProfileAvatar src={getGladiatorImage(player.level)} />
                    <h2
                      style={{
                        color: "#daa520",
                        fontSize: "2rem",
                        marginBottom: "8px",
                      }}
                    >
                      {player.name}
                    </h2>
                    <p
                      style={{
                        color: "#ffd700",
                        fontSize: "1.25rem",
                        marginBottom: "16px",
                      }}
                    >
                      Level {player.level} Gladiator
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            color: "#4169e1",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                          }}
                        >
                          {player.exp}
                        </div>
                        <div style={{ color: "#ffd700", fontSize: "0.875rem" }}>
                          Experience
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            color: "#ffd700",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                          }}
                        >
                          {player.gold}
                        </div>
                        <div style={{ color: "#ffd700", fontSize: "0.875rem" }}>
                          Gold
                        </div>
                      </div>
                    </div>

                    {/* Attributes Display */}
                    <div style={{ textAlign: "left", marginBottom: "20px" }}>
                      <h3
                        style={{
                          color: "#daa520",
                          marginBottom: "12px",
                          textAlign: "center",
                        }}
                      >
                        Attributes
                      </h3>

                      <StatRow valueColor="#dc143c">
                        <span className="label">💪 Strength</span>
                        <span className="value">
                          {player.attributes.strength}
                        </span>
                      </StatRow>
                      <StatBar>
                        <StatFill
                          width={Math.min(
                            50 + player.attributes.strength * 5,
                            100
                          )}
                          gradient="linear-gradient(90deg, #8b0000 0%, #dc143c 50%, #ff6347 100%)"
                          shadow="0 0 10px rgba(220, 20, 60, 0.5)"
                        />
                      </StatBar>

                      <StatRow valueColor="#32cd32">
                        <span className="label">🏃 Agility</span>
                        <span className="value">
                          {player.attributes.agility}
                        </span>
                      </StatRow>
                      <StatBar>
                        <StatFill
                          width={Math.min(
                            50 + player.attributes.agility * 5,
                            100
                          )}
                          gradient="linear-gradient(90deg, #006400 0%, #32cd32 50%, #90ee90 100%)"
                          shadow="0 0 10px rgba(50, 205, 50, 0.5)"
                        />
                      </StatBar>

                      <StatRow valueColor="#4169e1">
                        <span className="label">🧠 Intelligence</span>
                        <span className="value">
                          {player.attributes.intelligence}
                        </span>
                      </StatRow>
                      <StatBar>
                        <StatFill
                          width={Math.min(
                            50 + player.attributes.intelligence * 5,
                            100
                          )}
                          gradient="linear-gradient(90deg, #000080 0%, #4169e1 50%, #87ceeb 100%)"
                          shadow="0 0 10px rgba(65, 105, 225, 0.5)"
                        />
                      </StatBar>

                      <StatRow valueColor="#ff1493">
                        <span className="label">❤️ Health</span>
                        <span className="value">{getPlayerHealth()}</span>
                      </StatRow>
                      <StatBar>
                        <StatFill
                          width={Math.min(getPlayerHealth() / 4, 100)}
                          gradient="linear-gradient(90deg, #8b0000 0%, #ff1493 50%, #ff69b4 100%)"
                          shadow="0 0 10px rgba(255, 20, 147, 0.5)"
                        />
                      </StatBar>
                    </div>

                    {/* Battle Record */}
                    <div>
                      <h3 style={{ color: "#daa520", marginBottom: "12px" }}>
                        Battle Record
                      </h3>

                      <BattleRecordSection>
                        <div className="section-title">🏺 vs Creatures</div>
                        <StatsGrid>
                          <StatCard
                            bgColor="rgba(34, 197, 94, 0.2)"
                            borderColor="rgba(34, 197, 94, 0.5)"
                            textColor="#22c55e"
                          >
                            <div className="value">
                              {getCreatureBattleStats().wins}
                            </div>
                            <div>Wins</div>
                          </StatCard>
                          <StatCard
                            bgColor="rgba(239, 68, 68, 0.2)"
                            borderColor="rgba(239, 68, 68, 0.5)"
                            textColor="#ef4444"
                          >
                            <div className="value">
                              {getCreatureBattleStats().losses}
                            </div>
                            <div>Losses</div>
                          </StatCard>
                          <StatCard
                            bgColor="rgba(234, 179, 8, 0.2)"
                            borderColor="rgba(234, 179, 8, 0.5)"
                            textColor="#eab308"
                          >
                            <div className="value">
                              {getCreatureBattleStats().draws}
                            </div>
                            <div>Draws</div>
                          </StatCard>
                        </StatsGrid>
                      </BattleRecordSection>

                      <BattleRecordSection>
                        <div className="section-title">⚔️ vs Players</div>
                        <StatsGrid>
                          <StatCard
                            bgColor="rgba(34, 197, 94, 0.2)"
                            borderColor="rgba(34, 197, 94, 0.5)"
                            textColor="#22c55e"
                          >
                            <div className="value">
                              {getPlayerBattleStats().wins}
                            </div>
                            <div>Wins</div>
                          </StatCard>
                          <StatCard
                            bgColor="rgba(239, 68, 68, 0.2)"
                            borderColor="rgba(239, 68, 68, 0.5)"
                            textColor="#ef4444"
                          >
                            <div className="value">
                              {getPlayerBattleStats().losses}
                            </div>
                            <div>Losses</div>
                          </StatCard>
                          <StatCard
                            bgColor="rgba(234, 179, 8, 0.2)"
                            borderColor="rgba(234, 179, 8, 0.5)"
                            textColor="#eab308"
                          >
                            <div className="value">
                              {getPlayerBattleStats().draws}
                            </div>
                            <div>Draws</div>
                          </StatCard>
                        </StatsGrid>
                      </BattleRecordSection>
                    </div>
                  </ProfileCard>
                </ProfileCenter>
                <div></div> {/* Right spacer */}
              </ProfileContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ color: "#ffd700" }}>
                  Create a gladiator to view your profile!
                </p>
              </div>
            )}
          </>
        );

      case PAGES.LEADERBOARD:
        return (
          <>
            <MenuTitle style={{ fontSize: "1.75rem", marginBottom: "20px" }}>
              🏆 LEADERBOARD
            </MenuTitle>

            {leaderboard.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <GoldButton
                  onClick={loadLeaderboard}
                  disabled={loadingLeaderboard}
                  style={{ padding: "12px 24px" }}
                >
                  {loadingLeaderboard ? "🔄 Loading..." : "🔄 Refresh"}
                </GoldButton>
              </div>
            )}

            {leaderboard.length > 0 ? (
              <LeaderboardTable>
                <LeaderboardHeader>
                  <div>Rank</div>
                  <div>Player</div>
                  <div>Level</div>
                  <div>Experience</div>
                  <div>Gold</div>
                  <div>Record</div>
                </LeaderboardHeader>
                {leaderboard.map((player, index) => (
                  <LeaderboardRow key={player.address} rank={player.rank}>
                    <div className="rank">
                      {player.rank === 1
                        ? "🥇"
                        : player.rank === 2
                        ? "🥈"
                        : player.rank === 3
                        ? "🥉"
                        : `#${player.rank}`}
                    </div>
                    <div>
                      <div className="name">{player.name}</div>
                      <div className="address">
                        {player.address.slice(0, 6)}...
                        {player.address.slice(-4)}
                      </div>
                    </div>
                    <div>{player.level}</div>
                    <div>{player.exp}</div>
                    <div>{player.gold}</div>
                    <div>
                      <span style={{ color: "#22c55e" }}>{player.wins}W</span>/
                      <span style={{ color: "#ef4444" }}>{player.losses}L</span>
                      /<span style={{ color: "#eab308" }}>{player.draws}D</span>
                    </div>
                  </LeaderboardRow>
                ))}
              </LeaderboardTable>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ color: "#ffd700" }}>
                  {loadingLeaderboard
                    ? "Loading leaderboard..."
                    : "No players found on the leaderboard yet."}
                </p>
              </div>
            )}
          </>
        );

      case PAGES.BATTLE:
        return (
          <>
            <MenuTitle style={{ fontSize: "1.75rem", marginBottom: "20px" }}>
              ⚔️ BATTLE
            </MenuTitle>

            {player ? (
              <>
                {allPlayers.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <GoldButton
                      onClick={loadLeaderboard}
                      disabled={loadingLeaderboard}
                      style={{ padding: "12px 24px" }}
                    >
                      {loadingLeaderboard
                        ? "🔄 Loading..."
                        : "🔄 Refresh Opponents"}
                    </GoldButton>
                  </div>
                )}

                {cooldownTime > 0 && (
                  <CooldownTimer>
                    ⏰ Player Battle Cooldown:{" "}
                    {formatCooldownTime(cooldownTime)}
                  </CooldownTimer>
                )}

                {allPlayers.length > 0 ? (
                  <div>
                    <h3 style={{ color: "#daa520", marginBottom: "16px" }}>
                      Available Opponents ({allPlayers.length})
                    </h3>
                    {allPlayers.map((opponent) => (
                      <PlayerBattleCard key={opponent.address}>
                        <div className="player-info">
                          <img
                            src={getGladiatorImage(opponent.level)}
                            alt="Opponent Portrait"
                            className="player-avatar"
                          />
                          <div className="player-details">
                            <div className="name">{opponent.name}</div>
                            <div className="level">Level {opponent.level}</div>
                            <div className="stats">
                              {opponent.wins}W / {opponent.losses}L /{" "}
                              {opponent.draws}D
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{ textAlign: "right", fontSize: "0.875rem" }}
                          >
                            <div style={{ color: "#4169e1" }}>
                              ⭐ {opponent.exp}
                            </div>
                            <div style={{ color: "#ffd700" }}>
                              🪙 {opponent.gold}
                            </div>
                          </div>
                          <GoldButton
                            onClick={() => attackPlayer(opponent.name)}
                            disabled={cooldownTime > 0}
                            style={{ padding: "8px 16px" }}
                          >
                            {cooldownTime > 0
                              ? `⏰ ${cooldownTime}s`
                              : "⚔️ Challenge"}
                          </GoldButton>
                        </div>
                      </PlayerBattleCard>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <p style={{ color: "#ffd700" }}>
                      {loadingLeaderboard
                        ? "Loading opponents..."
                        : "No opponents found. Players will appear here as they join the game!"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ color: "#ffd700" }}>
                  Create a gladiator to start battling other players!
                </p>
              </div>
            )}
          </>
        );

      case PAGES.MARKET:
        return (
          <>
            <MenuTitle style={{ fontSize: "1.75rem", marginBottom: "20px" }}>
              🏪 MARKET
            </MenuTitle>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ color: "#ffd700" }}>Market coming soon...</p>
            </div>
          </>
        );

      case PAGES.QUESTS:
        return (
          <>
            <MenuTitle style={{ fontSize: "1.75rem", marginBottom: "20px" }}>
              🎯 QUESTS
            </MenuTitle>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ color: "#ffd700" }}>Quests coming soon...</p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!account) {
    return (
      <AppContainer>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "20px",
          }}
        >
          <Panel style={{ maxWidth: "500px", width: "100%" }}>
            <PanelInner style={{ textAlign: "center" }}>
              <Title style={{ fontSize: "2rem", marginBottom: "20px" }}>
                ⚔️ GLADIATOR ARENA ⚔️
              </Title>
              <p
                style={{
                  fontSize: "1rem",
                  marginBottom: "24px",
                  color: "#ffd700",
                }}
              >
                Fight monsters, battle players, and become the ultimate
                gladiator!
              </p>
              <GoldButton
                onClick={connectWallet}
                style={{ fontSize: "1rem", padding: "12px 24px" }}
              >
                ⚔️ Connect Wallet & Enter Arena
              </GoldButton>
            </PanelInner>
          </Panel>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {/* Header */}
      <Header>
        <Title>⚔️ GLADIATOR ARENA</Title>
        <HeaderStats>
          <StatItem color="#ffd700">
            <div className="value">🪙 {player?.gold || 0}</div>
            <div className="label">Gold</div>
          </StatItem>
          <StatItem color="#4169e1">
            <div className="value">⭐ {player?.exp || 0}</div>
            <div className="label">Experience</div>
          </StatItem>
          <StatItem color="#32cd32">
            <div className="value">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            <div className="label">Connected</div>
          </StatItem>
        </HeaderStats>
      </Header>

      <MainLayout>
        {/* Sidebar */}
        <Sidebar>
          <SidebarInner>
            {/* Menu */}
            <Panel>
              <PanelInner>
                <MenuTitle>Menu</MenuTitle>
                <MenuItem
                  active={currentPage === PAGES.ARENA}
                  onClick={() => handleTabChange(PAGES.ARENA)}
                >
                  🏛️ Arena
                </MenuItem>
                <MenuItem
                  active={currentPage === PAGES.PROFILE}
                  onClick={() => handleTabChange(PAGES.PROFILE)}
                >
                  👤 Profile
                </MenuItem>
                <MenuItem
                  active={currentPage === PAGES.LEADERBOARD}
                  onClick={() => handleTabChange(PAGES.LEADERBOARD)}
                >
                  🏆 Leaderboard
                </MenuItem>
                <MenuItem
                  active={currentPage === PAGES.BATTLE}
                  onClick={() => handleTabChange(PAGES.BATTLE)}
                >
                  ⚔️ Battle
                </MenuItem>
                <MenuItem
                  active={currentPage === PAGES.MARKET}
                  onClick={() => handleTabChange(PAGES.MARKET)}
                >
                  🏪 Market
                </MenuItem>
                <MenuItem
                  active={currentPage === PAGES.QUESTS}
                  onClick={() => handleTabChange(PAGES.QUESTS)}
                >
                  🎯 Quests
                </MenuItem>
              </PanelInner>
            </Panel>

            {/* Character */}
            {!player ? (
              <Panel>
                <PanelInner>
                  <MenuTitle>Create Gladiator</MenuTitle>
                  <Input
                    type="text"
                    placeholder="Enter gladiator name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                  />
                  <GoldButton
                    onClick={createPlayer}
                    disabled={creating || !playerName.trim()}
                    style={{ width: "100%" }}
                  >
                    {creating ? "⚔️ Creating..." : "⚔️ Create Gladiator"}
                  </GoldButton>
                </PanelInner>
              </Panel>
            ) : (
              <>
                {/* Character Portrait */}
                <Panel>
                  <PanelInner>
                    <CharacterPortrait>
                      <img
                        src={getGladiatorImage(player.level)}
                        alt="Gladiator Portrait"
                        className="avatar"
                      />
                      <div className="name">{player.name}</div>
                      <div className="level">
                        Level {player.level} Gladiator
                      </div>
                    </CharacterPortrait>
                  </PanelInner>
                </Panel>

                {/* Attributes */}
                <Panel>
                  <PanelInner>
                    <MenuTitle>Attributes</MenuTitle>

                    <StatRow valueColor="#dc143c">
                      <span className="label">💪 Strength</span>
                      <span className="value">
                        {player.attributes.strength}
                      </span>
                    </StatRow>
                    <StatBar>
                      <StatFill
                        width={Math.min(
                          50 + player.attributes.strength * 5,
                          100
                        )}
                        gradient="linear-gradient(90deg, #8b0000 0%, #dc143c 50%, #ff6347 100%)"
                        shadow="0 0 10px rgba(220, 20, 60, 0.5)"
                      />
                    </StatBar>

                    <StatRow valueColor="#32cd32">
                      <span className="label">🏃 Agility</span>
                      <span className="value">{player.attributes.agility}</span>
                    </StatRow>
                    <StatBar>
                      <StatFill
                        width={Math.min(
                          50 + player.attributes.agility * 5,
                          100
                        )}
                        gradient="linear-gradient(90deg, #006400 0%, #32cd32 50%, #90ee90 100%)"
                        shadow="0 0 10px rgba(50, 205, 50, 0.5)"
                      />
                    </StatBar>

                    <StatRow valueColor="#4169e1">
                      <span className="label">🧠 Intelligence</span>
                      <span className="value">
                        {player.attributes.intelligence}
                      </span>
                    </StatRow>
                    <StatBar>
                      <StatFill
                        width={Math.min(
                          50 + player.attributes.intelligence * 5,
                          100
                        )}
                        gradient="linear-gradient(90deg, #000080 0%, #4169e1 50%, #87ceeb 100%)"
                        shadow="0 0 10px rgba(65, 105, 225, 0.5)"
                      />
                    </StatBar>

                    <StatRow valueColor="#ff1493">
                      <span className="label">❤️ Health</span>
                      <span className="value">{getPlayerHealth()}</span>
                    </StatRow>
                    <StatBar>
                      <StatFill
                        width={Math.min(getPlayerHealth() / 4, 100)}
                        gradient="linear-gradient(90deg, #8b0000 0%, #ff1493 50%, #ff69b4 100%)"
                        shadow="0 0 10px rgba(255, 20, 147, 0.5)"
                      />
                    </StatBar>

                    <ButtonGrid>
                      <GoldButton
                        onClick={() => upgradeAttribute(1)}
                        disabled={
                          player.gold <
                          getUpgradeCost(player.attributes.strength)
                        }
                        style={{ fontSize: "0.65rem", padding: "6px 4px" }}
                      >
                        💪 STR
                        <br />
                        🪙 {getUpgradeCost(player.attributes.strength)}
                      </GoldButton>
                      <GoldButton
                        onClick={() => upgradeAttribute(2)}
                        disabled={
                          player.gold <
                          getUpgradeCost(player.attributes.agility)
                        }
                        style={{ fontSize: "0.65rem", padding: "6px 4px" }}
                      >
                        🏃 AGI
                        <br />
                        🪙 {getUpgradeCost(player.attributes.agility)}
                      </GoldButton>
                      <GoldButton
                        onClick={() => upgradeAttribute(3)}
                        disabled={
                          player.gold <
                          getUpgradeCost(player.attributes.intelligence)
                        }
                        style={{ fontSize: "0.65rem", padding: "6px 4px" }}
                      >
                        🧠 INT
                        <br />
                        🪙 {getUpgradeCost(player.attributes.intelligence)}
                      </GoldButton>
                    </ButtonGrid>
                  </PanelInner>
                </Panel>

                {/* Battle Record */}
                <Panel>
                  <PanelInner>
                    <MenuTitle>Battle Record</MenuTitle>

                    <BattleRecordSection>
                      <div className="section-title">🏺 vs Creatures</div>
                      <StatsGrid>
                        <StatCard
                          bgColor="rgba(34, 197, 94, 0.2)"
                          borderColor="rgba(34, 197, 94, 0.5)"
                          textColor="#22c55e"
                        >
                          <div className="value">
                            {getCreatureBattleStats().wins}
                          </div>
                          <div>Wins</div>
                        </StatCard>
                        <StatCard
                          bgColor="rgba(239, 68, 68, 0.2)"
                          borderColor="rgba(239, 68, 68, 0.5)"
                          textColor="#ef4444"
                        >
                          <div className="value">
                            {getCreatureBattleStats().losses}
                          </div>
                          <div>Losses</div>
                        </StatCard>
                        <StatCard
                          bgColor="rgba(234, 179, 8, 0.2)"
                          borderColor="rgba(234, 179, 8, 0.5)"
                          textColor="#eab308"
                        >
                          <div className="value">
                            {getCreatureBattleStats().draws}
                          </div>
                          <div>Draws</div>
                        </StatCard>
                      </StatsGrid>
                    </BattleRecordSection>

                    <BattleRecordSection>
                      <div className="section-title">⚔️ vs Players</div>
                      <StatsGrid>
                        <StatCard
                          bgColor="rgba(34, 197, 94, 0.2)"
                          borderColor="rgba(34, 197, 94, 0.5)"
                          textColor="#22c55e"
                        >
                          <div className="value">
                            {getPlayerBattleStats().wins}
                          </div>
                          <div>Wins</div>
                        </StatCard>
                        <StatCard
                          bgColor="rgba(239, 68, 68, 0.2)"
                          borderColor="rgba(239, 68, 68, 0.5)"
                          textColor="#ef4444"
                        >
                          <div className="value">
                            {getPlayerBattleStats().losses}
                          </div>
                          <div>Losses</div>
                        </StatCard>
                        <StatCard
                          bgColor="rgba(234, 179, 8, 0.2)"
                          borderColor="rgba(234, 179, 8, 0.5)"
                          textColor="#eab308"
                        >
                          <div className="value">
                            {getPlayerBattleStats().draws}
                          </div>
                          <div>Draws</div>
                        </StatCard>
                      </StatsGrid>
                    </BattleRecordSection>
                  </PanelInner>
                </Panel>
              </>
            )}
          </SidebarInner>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          <ContentInner>{renderPageContent()}</ContentInner>
        </MainContent>
      </MainLayout>
    </AppContainer>
  );
}
