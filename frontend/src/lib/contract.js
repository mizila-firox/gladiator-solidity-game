import { ethers } from "ethers";

// You'll need to replace this with your deployed contract address
const CONTRACT_ADDRESS = "0x..."; // Replace with your deployed contract address

// Contract ABI - extracted from your Main.sol
const CONTRACT_ABI = [
  "function createPlayer(string memory _name) public",
  "function determineWinnerWithCreature(uint256 _creatureId) public returns (string memory)",
  "function improveAttribute(uint16 _attribute) public",
  "function get_players(address _address) public view returns (tuple(uint256 id, string name, uint256 level, uint256 exp, uint256 lastAttackTime, uint256 gold, tuple(uint256 wins, uint256 losses, uint256 draws) battleStats, tuple(uint256 strength, uint256 agility, uint256 intelligence) attributes, address playerAddress))",
  "function get_creatures(uint256 _index) public view returns (tuple(uint256 id, string name, uint256 level, uint256 expGiven, tuple(uint256 strength, uint256 agility, uint256 intelligence) attributes))",
  "function quantity_players() public view returns (uint256)",
  "event Main__PlayerCreated(address indexed player, string indexed name)",
  "event Main__PlayerAttackedCreature(address indexed player, uint256 indexed creatureId, string indexed winner)",
];

export const getContract = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) return null;
  return await provider.getSigner();
};
