import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, AlertCircle, Settings } from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { useState } from "react";
import HyperliquidConfigModal from "./HyperliquidConfigModal";

interface HeaderProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, toggleMenu }) => {
  const {
    // address,
    isConnected,
    error,
    openConnectModal,
    disconnectWallet,
    clearError,
  } = useWallet();

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const location = useLocation();

  const isActiveLink = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="bg-dark-950/95 backdrop-blur-sm border-b border-dark-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp size={20} className="text-black" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  Hyper<span className="text-primary-400">Hedge</span>
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  to="/markets"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActiveLink("/markets")
                      ? "text-white"
                      : "text-dark-300 hover:text-primary-400"
                  }`}
                >
                  Markets
                </Link>
                <Link
                  to="/positions"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActiveLink("/positions")
                      ? "text-white"
                      : "text-dark-300 hover:text-primary-400"
                  }`}
                >
                  Positions
                </Link>
                <Link
                  to="/analytics"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActiveLink("/analytics")
                      ? "text-white"
                      : "text-dark-300 hover:text-primary-400"
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/docs"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActiveLink("/docs")
                      ? "text-white"
                      : "text-dark-300 hover:text-primary-400"
                  }`}
                >
                  Docs
                </Link>
              </div>
            </nav>

            {/* Buttons Group */}
            <div className="flex items-center space-x-3">
              {/* Hyperliquid Config Button */}
              {isConnected && (
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="hidden md:flex items-center justify-center p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-primary-400 border border-dark-700 hover:border-primary-500/50 transition-all duration-200"
                  title="Configure Hyperliquid SDK"
                >
                  <Settings size={18} />
                </button>
              )}

              {/* Connect/Disconnect Wallet Button */}
              {!isConnected ? (
                <>
                  <div className="hidden md:flex">
                    <button
                      className="btn-primary text-black"
                      onClick={openConnectModal}
                    >
                      Connect
                    </button>
                  </div>

                  {/* Mobile menu button */}
                  <div className="md:hidden">
                    <button
                      onClick={toggleMenu}
                      className="bg-dark-800 inline-flex items-center justify-center p-2 rounded-md text-dark-300 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
                    >
                      {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="hidden md:flex">
                    <button
                      className="btn-primary text-black"
                      onClick={disconnectWallet}
                    >
                      Disconnect
                    </button>
                  </div>

                  {/* Mobile menu button */}
                  <div className="md:hidden">
                    <button
                      onClick={toggleMenu}
                      className="bg-dark-800 inline-flex items-center justify-center p-2 rounded-md text-dark-300 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
                    >
                      {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-900 border-t border-dark-800">
              <Link
                to="/markets"
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActiveLink("/markets")
                    ? "text-white"
                    : "text-dark-300 hover:text-primary-400"
                }`}
                onClick={toggleMenu}
              >
                Markets
              </Link>
              <Link
                to="/positions"
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActiveLink("/positions")
                    ? "text-white"
                    : "text-dark-300 hover:text-primary-400"
                }`}
                onClick={toggleMenu}
              >
                Positions
              </Link>
              <Link
                to="/analytics"
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActiveLink("/analytics")
                    ? "text-white"
                    : "text-dark-300 hover:text-primary-400"
                }`}
                onClick={toggleMenu}
              >
                Analytics
              </Link>
              <Link
                to="/docs"
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActiveLink("/docs")
                    ? "text-white"
                    : "text-dark-300 hover:text-primary-400"
                }`}
                onClick={toggleMenu}
              >
                Docs
              </Link>

              {/* Mobile Hyperliquid Config Button */}
              {isConnected && (
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="flex items-center w-full px-3 py-2 text-dark-300 hover:text-primary-400 text-base font-medium transition-colors"
                >
                  <Settings size={18} className="mr-2" />
                  Configure Hyperliquid
                </button>
              )}

              <div className="px-3 py-2">
                {!isConnected ? (
                  <button
                    className="btn-primary w-full text-black"
                    onClick={openConnectModal}
                  >
                    Connect
                  </button>
                ) : (
                  <button
                    className="btn-primary w-full text-black"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle
                size={16}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <span className="text-red-700 text-sm leading-tight">
                {error}
              </span>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:underline px-2 py-1 rounded hover:bg-red-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hyperliquid Configuration Modal */}
      <HyperliquidConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
};

export default Header;
