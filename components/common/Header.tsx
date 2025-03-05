"use client";
import Link from "next/link";
import WalletConnectButton from "@/components/connectCard/ConnectButton";
import { hooks, metaMask } from "@/connectors/metaMask";
import { Accounts } from "@/components/connectCard/Accounts";

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks;

const Header = () => {
  const accounts = useAccounts();
  const provider = useProvider();
  const ENSNames = useENSNames(provider);
  //   const pathname = usePathname();

  //   const isActive = (path) => {
  //     return pathname === path;
  //   };

  return (
    <header className="w-full bg-white text-black border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side navigation */}
        <nav className="flex items-center space-x-4">
          <Link href="/">HomePage</Link>
          <Link href="/dapp">Dapp</Link>
          <Link href="/worker">Worker</Link>
        </nav>
        <Accounts accounts={accounts} provider={provider} ENSNames={ENSNames} />
        {/* Right side wallet button */}
        <WalletConnectButton />
      </div>
    </header>
  );
};

export default Header;
