import React, { useState } from "react";
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Zap,
  Timer,
  Eye,
  Settings
} from "lucide-react";

const RiskManagementPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Risk Management Guide
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
          Understanding and managing risks in hedge fund-style trading strategies on Hyperliquid
        </p>
      </div>

      {/* Risk Categories Overview */}
      <div className="mb-8 bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Key Risk Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-white text-sm">Liquidation Risk</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-sm">Volatility Risk</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-white text-sm">Funding Rate Risk</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-white text-sm">Liquidity Risk</span>
          </div>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("overview")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Understanding Hedge Fund Risks</h3>
              <p className="text-dark-300">Core risks inherent to leveraged trading strategies</p>
            </div>
          </div>
          {expandedSection === "overview" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "overview" && (
          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-semibold mb-2">Important Disclaimer</h4>
                    <p className="text-red-300 text-sm">
                      Hedge fund strategies involve significant risks including potential total loss of capital. 
                      Leverage amplifies both gains and losses. Only trade with funds you can afford to lose.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Risk vs Reward Profile</h4>
                <p className="text-dark-300 mb-4">
                  HyperHedge strategies aim to capture funding rate premiums while maintaining market-neutral positions. 
                  However, several risk factors can impact performance:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <h5 className="text-green-400 font-medium">Potential Rewards</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Consistent funding rate income</li>
                      <li>• Market-neutral exposure</li>
                      <li>• Lower directional risk</li>
                      <li>• Scalable strategy</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <h5 className="text-red-400 font-medium">Key Risks</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Liquidation exposure</li>
                      <li>• Volatile market conditions</li>
                      <li>• Negative funding periods</li>
                      <li>• Execution slippage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liquidation Risk */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("liquidation")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Liquidation Risk Management</h3>
              <p className="text-dark-300">Understanding and mitigating liquidation scenarios</p>
            </div>
          </div>
          {expandedSection === "liquidation" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "liquidation" && (
          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-semibold mb-2">Liquidation in Hedged Positions</h4>
                    <p className="text-yellow-300 text-sm">
                      While liquidation of perpetual positions isn't catastrophic when spot holdings are present, 
                      it can still result in significant losses if not properly managed.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">How Liquidation Works</h4>
                <div className="space-y-4">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Scenario: Perpetual Position Liquidated</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-dark-300">Spot position remains intact</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-dark-300">Perpetual hedge is forcibly closed at unfavorable price</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-dark-300">Portfolio becomes unhedged and exposed to price movements</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Prevention Strategies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <Target className="w-5 h-5 text-green-400 mb-2" />
                    <h5 className="text-white font-medium mb-2">Maintain Adequate Margin</h5>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Keep margin ratio above 20%</li>
                      <li>• Monitor margin requirements daily</li>
                      <li>• Set up automated alerts</li>
                      <li>• Maintain USDC reserves</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <Eye className="w-5 h-5 text-blue-400 mb-2" />
                    <h5 className="text-white font-medium mb-2">Active Monitoring</h5>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Set price movement alerts</li>
                      <li>• Monitor position sizes</li>
                      <li>• Track unrealized PnL</li>
                      <li>• Review positions daily</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Volatility & Market Risk */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("volatility")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Volatility & Market Risk</h3>
              <p className="text-dark-300">Managing exposure during volatile market conditions</p>
            </div>
          </div>
          {expandedSection === "volatility" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "volatility" && (
          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Volatility Impact on Hedged Positions</h4>
                <div className="bg-dark-800 rounded-lg p-4 mb-4">
                  <p className="text-dark-300 text-sm mb-3">
                    High volatility can significantly impact hedged positions even when maintaining market neutrality:
                  </p>
                  <ul className="text-dark-300 text-sm space-y-2">
                    <li>• <strong className="text-red-400">Margin pressure:</strong> Volatile moves can quickly consume margin on perpetual positions</li>
                    <li>• <strong className="text-red-400">Execution risk:</strong> Wide bid-ask spreads during volatile periods increase trading costs</li>
                    <li>• <strong className="text-red-400">Rebalancing costs:</strong> Frequent rebalancing required to maintain hedge ratios</li>
                    <li>• <strong className="text-red-400">Timing risk:</strong> Delayed execution can result in imperfect hedges</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">High Volatility Scenarios</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h5 className="text-red-400 font-medium mb-2">Crisis Events</h5>
                    <ul className="text-red-300 text-sm space-y-1">
                      <li>• Market crashes (&gt;20% moves)</li>
                      <li>• Regulatory announcements</li>
                      <li>• Exchange outages</li>
                      <li>• Liquidity crises</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h5 className="text-yellow-400 font-medium mb-2">Normal Volatility</h5>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• Daily price swings (5-15%)</li>
                      <li>• News-driven movements</li>
                      <li>• Options expiry effects</li>
                      <li>• Low liquidity periods</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Mitigation Strategies</h4>
                <div className="space-y-3">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Settings className="w-5 h-5 text-blue-400" />
                      <h5 className="text-white font-medium">Position Sizing</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Reduce position sizes during high volatility periods</li>
                      <li>• Use dynamic position sizing based on VIX or similar volatility indicators</li>
                      <li>• Maintain higher cash reserves during uncertain times</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Timer className="w-5 h-5 text-green-400" />
                      <h5 className="text-white font-medium">Timing & Execution</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Avoid opening new positions during high volatility</li>
                      <li>• Use limit orders instead of market orders</li>
                      <li>• Implement gradual position scaling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Funding Rate Risk */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("funding")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Funding Rate Risk</h3>
              <p className="text-dark-300">Understanding negative funding periods and their impact</p>
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
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-2">Negative Funding Rates</h4>
                    <p className="text-blue-300 text-sm">
                      During bearish markets or when shorts dominate, funding rates can turn negative, 
                      meaning short positions pay long positions instead of receiving payments.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">When Funding Rates Turn Negative</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Market Conditions</h5>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Strong bearish sentiment</li>
                      <li>• Excessive short interest</li>
                      <li>• Market manipulation attempts</li>
                      <li>• Low demand for leverage</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Impact on Strategy</h5>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Short positions become cost centers</li>
                      <li>• Strategy profitability decreases</li>
                      <li>• May require position reversal</li>
                      <li>• Increased monitoring needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Managing Funding Rate Risk</h4>
                <div className="space-y-3">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      <h5 className="text-white font-medium">Historical Analysis</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Study historical funding rate patterns for each asset</li>
                      <li>• Identify periods of persistent negative funding</li>
                      <li>• Understand market cycles and their impact on funding</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      <h5 className="text-white font-medium">Adaptive Strategies</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Set minimum funding rate thresholds for entry</li>
                      <li>• Implement position closure rules for extended negative periods</li>
                      <li>• Diversify across multiple assets to reduce single-asset risk</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liquidity Risk */}
      <div className="mb-6 bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection("liquidity")}
          className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Liquidity Risk</h3>
              <p className="text-dark-300">Managing risks in low-liquidity markets</p>
            </div>
          </div>
          {expandedSection === "liquidity" ? (
            <ChevronDown className="w-5 h-5 text-dark-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-dark-400" />
          )}
        </button>
        
        {expandedSection === "liquidity" && (
          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Liquidity Risk Factors</h4>
                <div className="bg-dark-800 rounded-lg p-4 mb-4">
                  <p className="text-dark-300 text-sm mb-3">
                    Low liquidity markets present unique challenges for hedge fund strategies:
                  </p>
                  <ul className="text-dark-300 text-sm space-y-2">
                    <li>• <strong className="text-purple-400">Wide spreads:</strong> Large bid-ask spreads increase execution costs</li>
                    <li>• <strong className="text-purple-400">Slippage:</strong> Large orders can significantly move market prices</li>
                    <li>• <strong className="text-purple-400">Exit difficulty:</strong> Hard to close positions quickly without losses</li>
                    <li>• <strong className="text-purple-400">Price manipulation:</strong> Low liquidity makes markets susceptible to manipulation</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Identifying Low Liquidity Conditions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Volume Metrics</h5>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• 24h volume &lt; &#36;1M</li>
                      <li>• Declining volume trends</li>
                      <li>• Low order book depth</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Spread Analysis</h5>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Bid-ask spread &gt; 0.1%</li>
                      <li>• Irregular price gaps</li>
                      <li>• Few market makers</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Market Behavior</h5>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Sudden price movements</li>
                      <li>• Long periods without trades</li>
                      <li>• Inconsistent pricing</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Liquidity Risk Management</h4>
                <div className="space-y-3">
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <h5 className="text-white font-medium">Asset Selection</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Focus on high-volume assets (&gt;&#36;10M daily volume)</li>
                      <li>• Prioritize major cryptocurrencies with deep order books</li>
                      <li>• Avoid newly listed or experimental tokens</li>
                    </ul>
                  </div>
                  
                  <div className="bg-dark-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <Settings className="w-5 h-5 text-blue-400" />
                      <h5 className="text-white font-medium">Execution Strategy</h5>
                    </div>
                    <ul className="text-dark-300 text-sm space-y-1">
                      <li>• Use smaller position sizes in low-liquidity markets</li>
                      <li>• Implement gradual entry/exit strategies</li>
                      <li>• Set maximum spread thresholds for execution</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Best Practices */}
      <div className="mt-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Risk Management Best Practices</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Daily Risk Monitoring</h3>
            <ul className="space-y-2 text-dark-300 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Review margin levels and liquidation prices</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Monitor funding rate trends and forecasts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Check portfolio balance and hedge ratios</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Assess market volatility and liquidity conditions</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Portfolio Protection</h3>
            <ul className="space-y-2 text-dark-300 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Maintain 25%+ margin buffers</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Diversify across multiple assets and strategies</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Set stop-loss levels for maximum drawdown</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Keep emergency USDC reserves available</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-dark-800/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Remember</h4>
          <p className="text-dark-300 text-sm">
            Successful risk management is about consistent application of sound principles rather than perfect market timing. 
            Always prioritize capital preservation over profit maximization, and never risk more than you can afford to lose.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskManagementPage;
