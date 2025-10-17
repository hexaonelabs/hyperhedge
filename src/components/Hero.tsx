import React, { useMemo } from "react";
import { ArrowRight, Shield, TrendingUp, DollarSign, Zap } from "lucide-react";
import { useHyperliquidProcessedData } from "../hooks/useHyperliquidProcessedData";
import { Link } from "react-router-dom";

const Hero: React.FC = () => {
  const {fundingHistory, fundingRates} = useHyperliquidProcessedData();
  const stats = useMemo(() => {
    const tokens = fundingHistory.map((item) => {
      const minAPY = Math.min(...item.fundings.flatMap(f => f[1])) * 24 * 365 * 100;
      const maxAPY = Math.max(...item.fundings.flatMap(f => f[1])) * 24 * 365 * 100;
      const averageAPY = item.fundings.length > 0
        ? item.fundings.reduce((acc, f) => acc + Number(f[1]), 0) / item.fundings.length * 24 * 365 * 100
        : 0;
      
      return {
        token: item.coin,
        averageAPY,
        minAPY,
        maxAPY,
      };
    });
    // select 3 better tokens
    const topTokens = tokens.sort((a, b) => b.averageAPY - a.averageAPY).slice(0, 3);
    const apy = topTokens.length > 0 
      ? (topTokens.reduce((acc, token) => acc + token.averageAPY, 0) / topTokens.length).toFixed(2) 
      : '0.00';
    const marketCount = fundingRates.length;
    const total24hVolume = fundingRates.reduce((acc, rate) => acc + rate.volume24h, 0);
    // console.log('Calculating stats from funding history:', fundingHistory, tokens, topTokens, apy);
    return {
      apy,
      marketCount,
      total24hVolume,
    };
  }, [fundingHistory, fundingRates]);

  const formatNumber = (number: number|string) => {
    // return value with `k` suffix if over 1000
    // `M` suffix if over 1 million
    // `B` suffix if over 1 billion
    const num = Number(number);
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(1)}k`;
    }
    return `$${num}`;
  }

  return (
    <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 pt-20 pb-16 sm:pt-24 sm:pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-700/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary-600/10 to-primary-800/10 blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-900/30 border border-primary-700/30 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Shield size={16} className="mr-2" />
            Build on Hyperliquid Protocol
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
            Earn Passive Income with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 pb-2">
              Delta-Neutral Strategy
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Create automated positions combining perpetual futures and
            spot holdings on Hyperliquid. Capture funding rate while
            maintaining market-neutral exposure.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-success-400">{stats.apy}%</div>
              <div className="text-sm text-dark-400">Best Avg. Annual Yield</div>
              <div className="text-xs text-dark-500">
                Based on last week funding
              </div>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-400">{stats.marketCount}</div>
              <div className="text-sm text-dark-400">Markets available</div>
              <div className="text-xs text-dark-500">
                Across Hyperliquid assets
              </div>
            </div>
            <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-warning-400">{formatNumber(stats.total24hVolume)}</div>
              <div className="text-sm text-dark-400">Total 24h Volume</div>
              <div className="text-xs text-dark-500">
                Perp & Spot combined
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/markets"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-black text-lg font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl">
              Explore Markets
              <ArrowRight size={20} className="ml-2" />
            </Link>
            <Link 
              to="/docs" 
              className="inline-flex items-center px-8 py-4 border-2 border-dark-600 text-lg font-medium rounded-lg text-dark-200 bg-dark-800/50 hover:bg-dark-700/50 hover:border-dark-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-500 transition-all duration-200"
            >
              View Documentation
            </Link>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="card hover:border-primary-700/50 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
                <TrendingUp size={24} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Market Neutral
              </h3>
              <p className="text-dark-300">
                Maintain delta-neutral positions while capturing funding rate
                differentials across perpetual and spot markets.
              </p>
            </div>

            <div className="card hover:border-success-700/50 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
                <DollarSign size={24} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Automated Yield
              </h3>
              <p className="text-dark-300">
                Set-and-forget strategy that automatically captures funding fees
                without active management required.
              </p>
            </div>

            <div className="card hover:border-warning-700/50 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
                <Zap size={24} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Low Risk
              </h3>
              <p className="text-dark-300">
                Minimize directional market exposure while earning consistent
                returns from funding rate arbitrage opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
