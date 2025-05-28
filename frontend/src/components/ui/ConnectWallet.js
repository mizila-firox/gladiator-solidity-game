"use client";

import { useState, useEffect } from "react";

export default function ConnectWallet({ onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnect(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    setConnecting(true);
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        onConnect(true);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
    setConnecting(false);
  };

  if (account) {
    return (
      <div className="text-center">
        <div className="bg-green-600/20 border border-green-500 rounded-lg p-4 mb-4">
          <div className="text-green-400 text-lg font-bold">
            ✅ Wallet Connected
          </div>
          <div className="text-sm text-gray-300 mt-2">
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 shadow-lg disabled:opacity-50"
    >
      {connecting ? "⚔️ Connecting..." : "⚔️ Connect Wallet & Enter Arena"}
    </button>
  );
}
