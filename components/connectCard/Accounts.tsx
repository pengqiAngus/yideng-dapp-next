'use client'

import type { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import type { Web3ReactHooks } from '@web3-react/core';
import { useEffect, useState } from 'react';

// 辅助函数：截断地址
const truncateAddress = (address: string) => {
  if (!address) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 辅助函数：格式化 ETH 余额
const formatBalance = (balance: BigNumber) => {
  const formatted = formatEther(balance);
  // 只保留 4 位小数
  return Number(formatted).toFixed(4) + 'ETH';
};

function useBalances(
  provider?: ReturnType<Web3ReactHooks['useProvider']>,
  accounts?: string[],
): BigNumber[] | undefined {
  const [balances, setBalances] = useState<BigNumber[] | undefined>();

  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false;

      void Promise.all(accounts.map(account => provider.getBalance(account))).then(balances => {
        if (stale) return;
        setBalances(balances);
      });

      return () => {
        stale = true;
        setBalances(undefined);
      };
    }
  }, [provider, accounts]);

  return balances;
}

export function Accounts({
  accounts,
  provider,
  ENSNames,
}: {
  accounts: ReturnType<Web3ReactHooks['useAccounts']>;
  provider: ReturnType<Web3ReactHooks['useProvider']>;
  ENSNames: ReturnType<Web3ReactHooks['useENSNames']>;
}) {
  const balances = useBalances(provider, accounts);

  if (accounts === undefined) return null;

  return (
    <div>
      <span>Accounts: </span>
      {accounts.length === 0
        ? 'None'
        : accounts?.map((account, i) => (
            <span
              key={account}
              style={{
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {ENSNames?.[i] ?? truncateAddress(account)}
              {balances?.[i] ? ` (Ξ${formatBalance(balances[i])})` : null}
            </span>
          ))}
    </div>
  );
}
