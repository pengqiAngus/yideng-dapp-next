"use client";
import type { Web3ReactHooks } from "@web3-react/core";
import type { MetaMask } from "@web3-react/metamask";
import { useCallback, useEffect, useState } from "react";
import { CHAINS, getAddChainParameters } from "@/utils/chains";
import { ChevronDown, PowerOff, RefreshCw } from "lucide-react";

function ChainSelect({
  activeChainId,
  switchChain,
  chainIds,
}: {
  activeChainId: number;
  switchChain: (chainId: number) => void;
  chainIds: number[];
}) {
  return (
    <div className="relative">
      <select
        value={activeChainId}
        onChange={(event) => {
          switchChain(Number(event.target.value));
        }}
        disabled={switchChain === undefined}
        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg 
                   appearance-none cursor-pointer focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:border-transparent
                   disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option hidden disabled value="">
          选择网络
        </option>
        <option value={-1} className="py-1">
          默认网络
        </option>
        {chainIds.map((chainId) => (
          <option key={chainId} value={chainId} className="py-1">
            {CHAINS[chainId]?.name ?? chainId}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
    </div>
  );
}

export function ConnectWithSelect({
  connector,
  activeChainId,
  chainIds = Object.keys(CHAINS).map(Number),
  isActivating,
  isActive,
  error,
  setError,
}: {
  connector: MetaMask;
  activeChainId: ReturnType<Web3ReactHooks["useChainId"]>;
  chainIds?: ReturnType<Web3ReactHooks["useChainId"]>[];
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
}) {
  const [desiredChainId, setDesiredChainId] = useState<number>(undefined);

  useEffect(() => {
    if (activeChainId && (!desiredChainId || desiredChainId === -1)) {
      setDesiredChainId(activeChainId);
    }
  }, [desiredChainId, activeChainId]);

  const switchChain = useCallback(
    async (desiredChainId: number) => {
      setDesiredChainId(desiredChainId);

      try {
        if (
          desiredChainId === activeChainId ||
          (desiredChainId === -1 && activeChainId !== undefined)
        ) {
          setError(undefined);
          return;
        }

        if (desiredChainId === -1) {
          await connector.activate();
        } else {
          await connector.activate(getAddChainParameters(desiredChainId));
        }

        setError(undefined);
      } catch (error) {
        setError(error);
      }
    },
    [connector, activeChainId, setError]
  );

  return (
    <div className="flex flex-col space-y-4">
      <ChainSelect
        activeChainId={desiredChainId}
        switchChain={switchChain}
        chainIds={chainIds}
      />

      {isActive ? (
        error ? (
          <button
            onClick={() => switchChain(desiredChainId)}
            className="flex items-center justify-center px-4 py-2 space-x-2
                     bg-red-50 text-red-600 rounded-lg hover:bg-red-100 
                     transition-colors duration-200"
          >
            <RefreshCw size={16} className="animate-spin" />
            <span>重试连接</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (connector?.deactivate) {
                void connector.deactivate();
              } else {
                void connector.resetState();
              }
              setDesiredChainId(undefined);
            }}
            className="flex items-center justify-center px-4 py-2 space-x-2
                     bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100
                     transition-colors duration-200"
          >
            <PowerOff size={16} />
            <span>断开连接</span>
          </button>
        )
      ) : (
        <button
          onClick={() => switchChain(desiredChainId)}
          disabled={isActivating || !desiredChainId}
          className="flex items-center justify-center px-4 py-2 space-x-2
                   bg-blue-500 text-white rounded-lg hover:bg-blue-600
                   transition-colors duration-200 disabled:bg-gray-100 
                   disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {error ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>重试连接</span>
            </>
          ) : isActivating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>连接中...</span>
            </>
          ) : (
            <>
              <PowerOff size={16} />
              <span>连接钱包</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
