'use client'
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { hooks } from "@/connectors/metaMask";
import {
  YidengContract,
  YidengContract__factory,
} from "@/types/ethers-contracts";

import {
  AlertCircle,
  Loader,
  Wallet,
  CircleDollarSign,
  Send,
} from "lucide-react";

// Transfer Section Component
const TransferSection = ({
  contract,
  onSuccess,
  loading,
  setLoading,
  setError,
}: {
  contract: any;
  onSuccess: any;
  loading: any;
  setLoading: any;
  setError: any;
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = async () => {
    if (!recipient || !amount || !ethers.utils.isAddress(recipient)) {
      setError("Please enter a valid recipient address and amount");
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.transfer(
        recipient,
        ethers.utils.parseEther(amount)
      );
      await tx.wait();
      setRecipient("");
      setAmount("");
      onSuccess();
    } catch (err) {
      console.error("Transfer error:", err);
      setError("Failed to transfer tokens");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Send className="w-5 h-5 mr-2" />
        Transfer Tokens
      </h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Recipient Address (0x...)"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTransfer}
            disabled={loading || !amount || !recipient}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Transfer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main DApp Component
const CONTRACT_ADDRESS = "0x9FD47F7E247bFd1C6BbB30Ef2f9f46E55370fFd6";
interface StakeInfo {
  amount: string;
  stakingTime: string;
  lastInterestTime: string;
}

const StakingDApp = () => {
  const { useProvider, useAccounts } = hooks;
  const accounts = useAccounts();
  const account = accounts?.[0];
  const [contract, setContract] = useState<YidengContract | null>(null);
  const provider = useProvider();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 监听账户变化
  useEffect(() => {
    if (provider && account) {
      getContract();
    }
  }, [provider, account]);

  // 初始化合约
  const getContract = async () => {
    const signer = provider!.getSigner();
    console.log(provider, signer, CONTRACT_ADDRESS);

    const tokenContract = YidengContract__factory.connect(
      CONTRACT_ADDRESS,
      signer!
    );
    setContract(tokenContract);

    await loadUserData(tokenContract);
    return () => {
      tokenContract.removeAllListeners();
    };
  };

  // 加载用户数据
  const loadUserData = async (tokenContract: YidengContract) => {
    try {
      if (!tokenContract || !account) return;

      const balance = await tokenContract.balanceOf(account);
      const stake = await tokenContract.stakes(account);

        setTokenBalance(ethers.utils.formatEther(balance)); 
        const amount= ethers.utils.formatEther(stake[0])
      setStakeInfo({
        amount,
        stakingTime: stake[1].toString(),
        lastInterestTime: stake[2].toString(),
      });
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user data");
    }
  };

  // 质押 ETH
  const handleStake = async () => {
    if (!stakeAmount || !contract) return;
    setLoading(true);
    setError("");
    try {
      const tx = await contract.stakeEth({
        value: ethers.utils.parseEther(stakeAmount),
      });
      await tx.wait();
      setStakeAmount("");
      await loadUserData(contract);
    } catch (err) {
      console.error("Staking error:", err);
      setError("Failed to stake ETH");
    } finally {
      setLoading(false);
    }
  };

  // 赎回代币
  const handleUnstake = async () => {
    if (!unstakeAmount || !contract) return;
    setLoading(true);
    setError("");

    try {
      const tx = await contract.unstake(ethers.utils.parseEther(unstakeAmount));
      await tx.wait();
      await loadUserData(contract);
      setUnstakeAmount("");
    } catch (err) {
      console.error("Unstaking error:", err);
      setError("Failed to unstake tokens");
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-500 rounded-lg p-4 flex items-center space-x-2">
          <Wallet className="w-5 h-5 " />
          <span>Please connect your wallet to use the DApp</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 text-black">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Staking Dashboard</h2>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-1">
              <CircleDollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Token Balance</span>
            </div>
            <p className="text-xl font-bold">{tokenBalance}</p>
          </div>

          {/* Stake ETH Section */}
          <div className="space-y-4 mb-6">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="ETH Amount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleStake}
                disabled={loading || !stakeAmount}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Stake ETH"
                )}
              </button>
            </div>
          </div>

          {/* Unstake Section */}
          <div className="space-y-4 mb-6">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Token Amount"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleUnstake}
                disabled={loading || !unstakeAmount}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Unstake"
                )}
              </button>
            </div>
          </div>

          {/* Transfer Section */}
          <TransferSection
            contract={contract}
            onSuccess={() => loadUserData(contract!)}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Staking Info */}
          {stakeInfo && Number(stakeInfo.amount) > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Staking Information</h3>
              <div className="space-y-2 text-sm">
                <p>Staked Amount: {stakeInfo.amount} tokens</p>
                <p>
                  Staking Time:{" "}
                  {new Date(
                    Number(stakeInfo.stakingTime) * 1000
                  ).toLocaleString()}
                </p>
                <p>
                  Last Interest Calculation:{" "}
                  {new Date(
                    Number(stakeInfo.lastInterestTime) * 1000
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakingDApp;
