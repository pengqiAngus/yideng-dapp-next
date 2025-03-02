"use client";
import React, { useState } from "react";
import { Wallet, X } from "lucide-react";
import MetaMaskCard from "./MetaMaskCard";

const WalletConnectButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="group flex items-center space-x-2 px-6 py-3 bg-gray-50
                   text-gray-700 rounded-lg hover:bg-gray-100
                   shadow-sm transition-all duration-200 ease-in-out
                   border border-gray-200 hover:border-gray-300"
        onClick={() => setIsDialogOpen(true)}
      >
        <Wallet
          size={20}
          className="group-hover:scale-110 transition-transform duration-200"
        />
        <span className="font-medium">连接钱包</span>
      </button>

      {isDialogOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 bg-gray-800/75 "
            style={{ zIndex: 999 }}
            onClick={() => setIsDialogOpen(false)}
          />

          {/* 对话框 */}
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-lg w-full max-w-md p-6"
            style={{ zIndex: 1000, background: "#fff" }}
          >
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsDialogOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">连接钱包</h2>
            </div>

            <div className="py-4">
              {/* 这里添加你的钱包连接相关组件 */}
              <div className="text-center text-gray-500">
                <MetaMaskCard />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletConnectButton;
