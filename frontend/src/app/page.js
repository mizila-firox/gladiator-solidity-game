"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import styled from "styled-components";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x07883bA76958F85C97804ba2f599dA41bFF08848"; // You need to put your deployed contract address here
const CONTRACT_ABI = [
  "function createPlayer(string memory _name) public",
  "function determineWinnerWithCreature(uint256 _creatureId) public returns (string memory)",
  "function improveAttribute(uint16 _attribute) public",
  "function get_players(address _address) public view returns (tuple(uint256 id, string name, uint256 level, uint256 exp, uint256 lastAttackTime, uint256 gold, tuple(uint256 wins, uint256 losses, uint256 draws) battleStats, tuple(uint256 strength, uint256 agility, uint256 intelligence) attributes, address playerAddress))",
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
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-family: "Cinzel", serif;
  font-weight: 700;
  color: #daa520;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-size: 2rem;
  margin: 0;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 24px;
  font-size: 0.875rem;
`;

const StatItem = styled.div`
  text-align: center;

  .value {
    font-weight: bold;
    font-size: 1.125rem;
    color: ${(props) => props.color || "#ffd700"};
  }

  .label {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const MainLayout = styled.div`
  display: flex;
  height: calc(100vh - 80px);
`;

const Sidebar = styled.aside`
  width: 280px;
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
  padding: 20px;
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
  padding: 24px;
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
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
`;

const PanelInner = styled.div`
  background: linear-gradient(135deg, #2c1810 0%, #3d2317 50%, #2c1810 100%);
  border: 2px solid #8b4513;
  border-radius: 4px;
  margin: 4px;
  padding: 16px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
`;

const MenuTitle = styled.h3`
  font-family: "Cinzel", serif;
  font-weight: 700;
  color: #daa520;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  margin-bottom: 16px;
  font-size: 1.125rem;
`;

const MenuItem = styled.div`
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  margin-bottom: 8px;
  border: 1px solid transparent;

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.3);
  }
`;

const CharacterPortrait = styled.div`
  background: linear-gradient(135deg, #1a0f08 0%, #2d1810 50%, #1a0f08 100%);
  border: 3px solid #daa520;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(218, 165, 32, 0.3);

  .avatar {
    font-size: 3rem;
    margin-bottom: 12px;
  }

  .name {
    font-family: "Cinzel", serif;
    font-weight: 700;
    color: #daa520;
    font-size: 1.25rem;
    margin-bottom: 4px;
  }

  .level {
    color: #ffd700;
    font-size: 0.875rem;
  }
`;

const StatBar = styled.div`
  background: linear-gradient(135deg, #1a0f08 0%, #2d1810 50%, #1a0f08 100%);
  border: 1px solid #8b4513;
  border-radius: 10px;
  padding: 2px;
  height: 20px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  margin-top: 4px;
  margin-bottom: 12px;
`;

const StatFill = styled.div`
  height: 100%;
  border-radius: 8px;
  transition: width 0.8s ease-in-out;
  width: ${(props) => props.width}%;
  background: ${(props) => props.gradient};
  box-shadow: ${(props) => props.shadow};
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.875rem;

  .label {
    color: #ffd700;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .value {
    font-weight: bold;
    color: ${(props) => props.valueColor || "#ffd700"};
  }
`;

const GoldButton = styled.button`
  background: linear-gradient(
    145deg,
    #daa520 0%,
    #ffd700 25%,
    #ffff00 50%,
    #ffd700 75%,
    #daa520 100%
  );
  border: 2px solid #b8860b;
  border-radius: 6px;
  color: #2d1810;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 8px 16px;
  font-family: "Cinzel", serif;

  &:hover {
    background: linear-gradient(
      145deg,
      #ffd700 0%,
      #ffff00 25%,
      #ffffff 50%,
      #ffff00 75%,
      #ffd700 100%
    );
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.6);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CreatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const CreatureCard = styled.div`
  background: linear-gradient(
    135deg,
    #2d1810 0%,
    #4a2c1a 25%,
    #3d2317 75%,
    #2d1810 100%
  );
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    border-color: #daa520;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.8), 0 0 25px rgba(218, 165, 32, 0.4);
    transform: translateY(-2px);
  }

  display: flex;
  align-items: center;
  gap: 16px;
`;

const CreatureAvatar = styled.div`
  background: linear-gradient(135deg, #1a0f08 0%, #2d1810 50%, #1a0f08 100%);
  border: 3px solid #daa520;
  border-radius: 8px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: #2c1810;
  border: 2px solid #daa520;
  border-radius: 4px;
  color: #ffd700;
  font-family: "Cinzel", serif;
  margin-bottom: 16px;

  &::placeholder {
    color: rgba(255, 215, 0, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
`;

const ButtonGrid = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  font-size: 0.75rem;
  text-align: center;
`;

const StatCard = styled.div`
  background: ${(props) => props.bgColor};
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.borderColor};

  .value {
    color: ${(props) => props.textColor};
    font-weight: bold;
    font-size: 1rem;
  }
`;

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
          <Panel style={{ maxWidth: "600px", width: "100%" }}>
            <PanelInner style={{ textAlign: "center" }}>
              <Title style={{ fontSize: "2.5rem", marginBottom: "24px" }}>
                ⚔️ GLADIATOR ARENA ⚔️
              </Title>
              <p
                style={{
                  fontSize: "1.25rem",
                  marginBottom: "32px",
                  color: "#ffd700",
                }}
              >
                Fight monsters, battle players, and become the ultimate
                gladiator!
              </p>
              <GoldButton
                onClick={connectWallet}
                style={{ fontSize: "1.25rem", padding: "16px 32px" }}
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
                <MenuItem>🏛️ Arena</MenuItem>
                <MenuItem>👤 Profile</MenuItem>
                <MenuItem>🏆 Leaderboard</MenuItem>
                <MenuItem>⚔️ Battle</MenuItem>
                <MenuItem>🏪 Market</MenuItem>
                <MenuItem>🎯 Quests</MenuItem>
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
                      <div className="avatar">🏛️</div>
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
                        width={Math.min(player.attributes.strength * 10, 100)}
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
                        width={Math.min(player.attributes.agility * 10, 100)}
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
                          player.attributes.intelligence * 10,
                          100
                        )}
                        gradient="linear-gradient(90deg, #000080 0%, #4169e1 50%, #87ceeb 100%)"
                        shadow="0 0 10px rgba(65, 105, 225, 0.5)"
                      />
                    </StatBar>

                    <ButtonGrid>
                      <GoldButton
                        onClick={() => upgradeAttribute(1)}
                        style={{ fontSize: "0.75rem", padding: "8px 4px" }}
                      >
                        💪 STR
                      </GoldButton>
                      <GoldButton
                        onClick={() => upgradeAttribute(2)}
                        style={{ fontSize: "0.75rem", padding: "8px 4px" }}
                      >
                        🏃 AGI
                      </GoldButton>
                      <GoldButton
                        onClick={() => upgradeAttribute(3)}
                        style={{ fontSize: "0.75rem", padding: "8px 4px" }}
                      >
                        🧠 INT
                      </GoldButton>
                    </ButtonGrid>
                  </PanelInner>
                </Panel>

                {/* Battle Stats */}
                <Panel>
                  <PanelInner>
                    <MenuTitle>Battle Record</MenuTitle>
                    <StatsGrid>
                      <StatCard
                        bgColor="rgba(34, 197, 94, 0.2)"
                        borderColor="rgba(34, 197, 94, 0.5)"
                        textColor="#22c55e"
                      >
                        <div className="value">{player.battleStats.wins}</div>
                        <div>Wins</div>
                      </StatCard>
                      <StatCard
                        bgColor="rgba(239, 68, 68, 0.2)"
                        borderColor="rgba(239, 68, 68, 0.5)"
                        textColor="#ef4444"
                      >
                        <div className="value">{player.battleStats.losses}</div>
                        <div>Losses</div>
                      </StatCard>
                      <StatCard
                        bgColor="rgba(234, 179, 8, 0.2)"
                        borderColor="rgba(234, 179, 8, 0.5)"
                        textColor="#eab308"
                      >
                        <div className="value">{player.battleStats.draws}</div>
                        <div>Draws</div>
                      </StatCard>
                    </StatsGrid>
                  </PanelInner>
                </Panel>
              </>
            )}
          </SidebarInner>
        </Sidebar>

        {/* Main Content */}
        <MainContent>
          <ContentInner>
            <MenuTitle style={{ fontSize: "2rem", marginBottom: "24px" }}>
              🏛️ THE ARENA
            </MenuTitle>

            {player ? (
              <CreatureGrid>
                {creatures.map((creature) => (
                  <CreatureCard key={creature.id}>
                    <CreatureAvatar>{creature.emoji}</CreatureAvatar>

                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          color: "#ffd700",
                          fontWeight: "bold",
                          fontSize: "1.125rem",
                          marginBottom: "4px",
                        }}
                      >
                        {creature.name}
                      </h4>
                      <p
                        style={{
                          color: "#ffd700",
                          fontSize: "0.875rem",
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
                          gap: "8px",
                          fontSize: "0.875rem",
                          marginBottom: "12px",
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
                        disabled={attacking === creature.id}
                        style={{ width: "100%", padding: "12px" }}
                      >
                        {attacking === creature.id
                          ? "⚔️ Fighting..."
                          : "⚔️ Attack"}
                      </GoldButton>
                    </div>
                  </CreatureCard>
                ))}
              </CreatureGrid>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🏛️</div>
                <h4
                  style={{
                    fontSize: "2rem",
                    marginBottom: "16px",
                    color: "#daa520",
                  }}
                >
                  Welcome to the Arena
                </h4>
                <p
                  style={{
                    fontSize: "1.125rem",
                    color: "#ffd700",
                    marginBottom: "24px",
                  }}
                >
                  Create your gladiator to begin your journey to glory!
                </p>
                <p style={{ fontSize: "0.875rem", color: "#a0a0a0" }}>
                  Fight monsters, gain experience, and become the ultimate
                  champion.
                </p>
              </div>
            )}
          </ContentInner>
        </MainContent>
      </MainLayout>
    </AppContainer>
  );
}
