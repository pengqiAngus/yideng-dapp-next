"use client";
import type { Web3ReactHooks } from "@web3-react/core";
import type { MetaMask } from "@web3-react/metamask";
import { Accounts } from "./Accounts";
import { Chain } from "./Chain";
import { ConnectWithSelect } from "./ConnectWithSelect";
import { Status } from "./Status";

interface Props {
  connector: MetaMask;
  activeChainId: ReturnType<Web3ReactHooks["useChainId"]>;
  chainIds?: ReturnType<Web3ReactHooks["useChainId"]>[];
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
  ENSNames: ReturnType<Web3ReactHooks["useENSNames"]>;
  provider?: ReturnType<Web3ReactHooks["useProvider"]>;
  accounts?: string[];
}

export function Card({
  connector,
  activeChainId,
  chainIds,
  isActivating,
  isActive,
  error,
  setError,
  ENSNames,
  accounts,
  provider,
}: Props) {
  return (
    <div className="flex flex-col justify-between w-80 p-6 m-4 overflow-auto rounded-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">MetaMask</span>
          <Status
            isActivating={isActivating}
            isActive={isActive}
            error={error}
          />
        </div>

        <div className="space-y-2">
          <Chain chainId={activeChainId} />
          <Accounts
            accounts={accounts}
            provider={provider}
            ENSNames={ENSNames}
          />
        </div>

        <div className="pt-4">
          <ConnectWithSelect
            connector={connector}
            activeChainId={activeChainId}
            chainIds={chainIds}
            isActivating={isActivating}
            isActive={isActive}
            error={error}
            setError={setError}
          />
        </div>
      </div>
    </div>
  );
}
