import React from "react";
import { Book, ExternalLink, Code, MessageCircle, GitBranch, Zap } from "lucide-react";

const DocsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Documentation</h1>
        <p className="text-dark-300">
          Learn how to use HyperHedge and integrate with Hyperliquid for automated trading.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Start */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Quick Start</h2>
          </div>
          <p className="text-dark-300 mb-4">
            Get started with HyperHedge in just a few steps.
          </p>
          <ul className="space-y-2 text-dark-300 text-sm">
            <li>• Connect your wallet</li>
            <li>• Configure Hyperliquid API</li>
            <li>• Set funding rate parameters</li>
            <li>• Start automated hedging</li>
          </ul>
          <button className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
        
        {/* API Reference */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Code className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">API Reference</h2>
          </div>
          <p className="text-dark-300 mb-4">
            Complete API documentation for developers.
          </p>
          <div className="space-y-3">
            <a href="#" className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-white text-sm">REST API</span>
              <ExternalLink className="w-4 h-4 text-dark-400" />
            </a>
            <a href="#" className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-white text-sm">WebSocket API</span>
              <ExternalLink className="w-4 h-4 text-dark-400" />
            </a>
            <a href="#" className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-white text-sm">SDK Documentation</span>
              <ExternalLink className="w-4 h-4 text-dark-400" />
            </a>
          </div>
        </div>
        
        {/* Community */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Community</h2>
          </div>
          <p className="text-dark-300 mb-4">
            Join our community for support and updates.
          </p>
          <div className="space-y-3">
            <a href="#" className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-white text-sm">Discord</span>
              <ExternalLink className="w-4 h-4 text-dark-400" />
            </a>
            <a href="#" className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-white text-sm">GitHub</span>
              <GitBranch className="w-4 h-4 text-dark-400" />
            </a>
            <a href="#" className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
              <span className="text-white text-sm">Twitter</span>
              <ExternalLink className="w-4 h-4 text-dark-400" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Detailed Guides */}
      <div className="mt-8 bg-dark-900 border border-dark-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Book className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Detailed Guides</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-dark-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Setting Up Hyperliquid</h3>
            <p className="text-dark-300 text-sm mb-3">
              Learn how to configure your Hyperliquid API keys and wallet connection.
            </p>
            <a href="#" className="text-primary-400 hover:text-primary-300 text-sm">
              Read more →
            </a>
          </div>
          
          <div className="p-4 bg-dark-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Funding Rate Strategies</h3>
            <p className="text-dark-300 text-sm mb-3">
              Understand different approaches to funding rate arbitrage and hedging.
            </p>
            <a href="#" className="text-primary-400 hover:text-primary-300 text-sm">
              Read more →
            </a>
          </div>
          
          <div className="p-4 bg-dark-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Risk Management</h3>
            <p className="text-dark-300 text-sm mb-3">
              Best practices for managing risk in automated trading strategies.
            </p>
            <a href="#" className="text-primary-400 hover:text-primary-300 text-sm">
              Read more →
            </a>
          </div>
          
          <div className="p-4 bg-dark-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Advanced Features</h3>
            <p className="text-dark-300 text-sm mb-3">
              Explore advanced features like custom triggers and portfolio management.
            </p>
            <a href="#" className="text-primary-400 hover:text-primary-300 text-sm">
              Read more →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
