import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
const Header = () => {
  const location = useLocation();
  const { address, isConnecting, isDisconnected } = useAccount();
  const isActive = path => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isActive(to) ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side navigation */}
        <nav className="flex items-center space-x-4">
          <NavLink to="/">HomePage</NavLink>
          <NavLink to="/dapp">Dapp</NavLink>
        </nav>
        <div>
          {isConnecting && 'Connecting...'}
          {isDisconnected && 'Disconnected'}
          Connected Wallet: {address}
        </div>
        {/* Right side wallet button */}
        <ConnectKitButton />
      </div>
    </header>
  );
};

export default Header;
