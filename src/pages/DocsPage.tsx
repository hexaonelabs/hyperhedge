import React, { useState } from "react";
import { 
  Wallet, 
  Key, 
  Settings, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight,
  ChevronDown,
  TrendingUp,
  BarChart3,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

const DocsPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>("wallet");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          HyperHedge Setup Guide
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
          Complete guide to configure your Hyperliquid integration and start professional hedge fund-style portfolio management
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8 bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Setup Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-dark-800 rounded-lg">
            <Wallet className="w-5 h-5 text-primary-400" />
            <span className="text-white text-sm">1. Connect Wallet</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-dark-800 rounded-lg">
            <Settings className="w-5 h-5 text-blue-400" />
            <span className="text-white text-sm">2. Sub Account</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-dark-800 rounded-lg">
            <Key className="w-5 h-5 text-green-400" />
            <span className="text-white text-sm">3. API Wallet</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-dark-800 rounded-lg">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm">4. Fund Account</span>
          </div>
        </div>
      </div>

      {/* Step 1: Wallet Connection */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("wallet")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <Wallet className="w-6 h-6 text-primary-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Step 1: Connect Your Wallet</h3>
              <p className="text-dark-300">Connect the same wallet used as master account on Hyperliquid</p>
            </div>
          </div>
          {expandedSection === "wallet" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "wallet" && (
          <div className="px-6 pb-6">
            <div className="bg-dark-800 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-2">Important Requirements</h4>
                  <ul className="text-dark-300 text-sm space-y-1">
                    <li>• Use the same wallet address as your Hyperliquid master account</li>
                    <li>• Ensure your wallet is properly connected to the app</li>
                    <li>• This wallet will be used for authentication and API key generation</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Click "Connect" in the top navigation</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Select your preferred wallet provider (MetaMask, WalletConnect, etc.)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Verify the connected address matches your Hyperliquid master account</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Sub Account Setup */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("subaccount")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Step 2: Configure Sub Account (Optional)</h3>
              <p className="text-dark-300">Isolate positions for better portfolio management</p>
            </div>
          </div>
          {expandedSection === "subaccount" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "subaccount" && (
          <div className="px-6 pb-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2">Sub Account Requirements</h4>
                  <p className="text-yellow-300 text-sm">
                    Sub accounts are only available for Hyperliquid accounts that have generated over $100,000 in trading volume.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Benefits of Using Sub Accounts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <Target className="w-5 h-5 text-green-400 mb-2" />
                    <h5 className="text-white font-medium mb-1">Position Isolation</h5>
                    <p className="text-dark-300 text-sm">Separate HyperHedge positions from your main trading activities</p>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-4">
                    <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
                    <h5 className="text-white font-medium mb-1">Better Analytics</h5>
                    <p className="text-dark-300 text-sm">Clean performance tracking and portfolio analysis</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Setup Instructions</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">1</span>
                    <div>
                      <p className="text-white">Go to Hyperliquid app and create a new sub account</p>
                      <p className="text-dark-300 text-sm">Navigate to More → Sub Accounts → Click Create Sub-Account button</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">2</span>
                    <div>
                      <p className="text-white">Copy the sub account address</p>
                      <p className="text-dark-300 text-sm">This will be a 42-character address starting with 0x</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">3</span>
                    <div>
                      <p className="text-white">Add the address in HyperHedge configuration</p>
                      <p className="text-dark-300 text-sm">Use the settings modal to configure your sub account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: API Key Generation */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("apikey")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Key className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Step 3: Generate API Wallet</h3>
              <p className="text-dark-300">Enable automated position management</p>
            </div>
          </div>
          {expandedSection === "apikey" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "apikey" && (
          <div className="px-6 pb-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-semibold mb-2">Security Warning</h4>
                  <p className="text-red-300 text-sm">
                    Your API Wallet grants trading permissions. Keep it secure and never share it. HyperHedge stores it encrypted locally.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Generate Your API Wallet</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">1</span>
                    <div>
                      <p className="text-white">Go to Hyperliquid app and create a new API Wallet </p>
                      <p className="text-dark-300 text-sm">Navigate to More → API → Then generate and Authorize API Wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">3</span>
                    <div>
                      <p className="text-white">Enter the API Wallet in HyperHedge</p>
                      <p className="text-dark-300 text-sm">Use the configuration modal to securely store your API Wallet</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">API Wallet Permissions</h5>
                <p className="text-dark-300 text-sm mb-3">The API Wallet will enable HyperHedge to:</p>
                <ul className="text-dark-300 text-sm space-y-1">
                  <li>• Open and close perpetual positions</li>
                  <li>• Execute spot trades for hedging</li>
                  <li>• Transfer funds between spot and perpetual accounts</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Fund Your Account */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("funding")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Step 4: Fund Your Trading Account</h3>
              <p className="text-dark-300">Ensure sufficient USDC balance for trading</p>
            </div>
          </div>
          {expandedSection === "funding" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "funding" && (
          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Funding Requirements</h4>
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-dark-300 text-sm mb-3">
                    Ensure your Hyperliquid account has sufficient USDC for:
                  </p>
                  <ul className="text-dark-300 text-sm space-y-1">
                    <li>• Initial margin for perpetual positions</li>
                    <li>• Spot purchases for hedging</li>
                    <li>• Maintenance margin buffers</li>
                    <li>• Transaction fees</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">For Master Account Users</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Deposit USDC directly to your master account on Hyperliquid</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Your funds are immediately available for trading</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">For Sub Account Users</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">1</span>
                    <div>
                      <p className="text-white">Ensure USDC is in your master account</p>
                      <p className="text-dark-300 text-sm">Deposit USDC to your master account first</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">2</span>
                    <div>
                      <p className="text-white">Transfer funds to sub account</p>
                      <p className="text-dark-300 text-sm">Use Hyperliquid's internal transfer feature: More → Sub-Accounts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white text-xs rounded-full flex items-center justify-center mt-0.5">3</span>
                    <div>
                      <p className="text-white">Verify sub account balance</p>
                      <p className="text-dark-300 text-sm">Check that funds appear in your designated sub account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-gradient-to-r from-primary-500/10 to-blue-500/10 border border-primary-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Ready to Start Trading!</h2>
        <p className="text-dark-300 mb-6">
          Once you've completed the setup, you can start using HyperHedge's professional trading features:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <h4 className="text-white font-medium">Markets Page</h4>
              <p className="text-dark-300 text-sm">Browse and select positions to open</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <div>
              <h4 className="text-white font-medium">Positions Dashboard</h4>
              <p className="text-dark-300 text-sm">Monitor performance and analytics</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/markets"
            className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-black px-6 py-3 rounded-lg transition-colors"
          >
            <span>Explore Markets</span>
          </Link>
          <Link
            to="/positions"
            className="flex items-center justify-center space-x-2 bg-dark-700 hover:bg-dark-600 text-white px-6 py-3 rounded-lg transition-colors border border-dark-600"
          >
            <span>View Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
