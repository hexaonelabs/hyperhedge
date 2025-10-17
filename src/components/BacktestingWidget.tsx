import React, { useMemo, useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Zap } from "lucide-react";
import BacktestingConfig from "./BacktestingConfig";

interface FundingData {
  coin: string;
  fundings: number[][];
}

interface BacktestData {
  date: string;
  timestamp: number;
  portfolioValue: number;
  totalReturn: number;
  returnPercentage: number;
  cumulativeFunding: number;
  [key: string]: number | string;
}

interface BacktestingWidgetProps {
  fundingHistory: FundingData[];
  selectedTokens: string[];
  initialAmount?: number;
  onPerformanceUpdate?: (data: {
    portfolioValue: number;
    totalReturn: number;
    returnPercentage: number;
  }) => void;
}

const BacktestingWidget: React.FC<BacktestingWidgetProps> = ({
  fundingHistory,
  selectedTokens,
  initialAmount: initialAmountProp = 10000,
  onPerformanceUpdate,
}) => {
  const [viewMode, setViewMode] = useState<'value' | 'percentage'>('value');
  const [initialAmount, setInitialAmount] = useState(initialAmountProp);

  const handleInitialAmountChange = (newAmount: number) => {
    setInitialAmount(newAmount);
  };

  const handleReset = () => {
    setInitialAmount(initialAmountProp);
    setViewMode('value');
  };

  const backtestResults = useMemo(() => {
    if (!fundingHistory.length || !selectedTokens.length) return [];

    // Get all timestamps from the last days
    const now = Date.now();
    const daysAgo = now - (21 * 24 * 60 * 60 * 1000);
    
    // Collect all unique timestamps and sort them
    const timestampSet = new Set<number>();
    fundingHistory
      .filter((item) => selectedTokens.includes(item.coin))
      .forEach((item) => {
        item.fundings.forEach(([timestamp]) => {
          if (timestamp >= daysAgo) {
            timestampSet.add(timestamp);
          }
        });
      });

    const sortedTimestamps = Array.from(timestampSet).sort((a, b) => a - b);
    
    if (sortedTimestamps.length === 0) return [];

    // Allocate initial amount evenly among selected tokens
    const allocationPerToken = initialAmount / selectedTokens.length;
    
    let cumulativeFunding = 0;
    let portfolioValue = initialAmount;

    const results: BacktestData[] = [];

    sortedTimestamps.forEach((timestamp) => {
      let periodFunding = 0;

      // Calculate funding for this period for each token
      selectedTokens.forEach((coin) => {
        const tokenData = fundingHistory.find((item) => item.coin === coin);
        if (tokenData) {
          const fundingEntry = tokenData.fundings.find(([ts]) => ts === timestamp);
          if (fundingEntry) {
            // Funding rate for this token * allocation
            const tokenFunding = fundingEntry[1] * allocationPerToken;
            periodFunding += tokenFunding;
          }
        }
      });

      cumulativeFunding += periodFunding;
      portfolioValue = initialAmount + cumulativeFunding;

      const totalReturn = portfolioValue - initialAmount;
      const returnPercentage = (totalReturn / initialAmount) * 100;

      results.push({
        date: new Date(timestamp).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        timestamp,
        portfolioValue,
        totalReturn,
        returnPercentage,
        cumulativeFunding,
      });
    });

    return results;
  }, [fundingHistory, selectedTokens, initialAmount]);

  const stats = useMemo(() => {
    if (backtestResults.length === 0) {
      return {
        finalValue: initialAmount,
        totalReturn: 0,
        totalReturnPercentage: 0,
        maxDrawdown: 0,
        maxValue: initialAmount,
        minValue: initialAmount,
        volatility: 0,
        sharpeRatio: 0,
        avgDailyReturn: 0,
        winRate: 0,
      };
    }

    const finalValue = backtestResults[backtestResults.length - 1].portfolioValue;
    const totalReturn = finalValue - initialAmount;
    const totalReturnPercentage = (totalReturn / initialAmount) * 100;

    // Calculate maximum and minimum
    const values = backtestResults.map(r => r.portfolioValue);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = initialAmount;
    for (const result of backtestResults) {
      if (result.portfolioValue > peak) {
        peak = result.portfolioValue;
      }
      const drawdown = ((peak - result.portfolioValue) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Calculate volatility (standard deviation of daily returns)
    const dailyReturns = backtestResults.slice(1).map((result, index) => {
      const prevValue = backtestResults[index].portfolioValue;
      return ((result.portfolioValue - prevValue) / prevValue) * 100;
    });

    const avgDailyReturn = dailyReturns.length > 0 
      ? dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length 
      : 0;

    const variance = dailyReturns.length > 0
      ? dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length
      : 0;
    
    const volatility = Math.sqrt(variance);

    // Simplified Sharpe ratio (assuming risk-free rate of 0%)
    const sharpeRatio = volatility > 0 ? avgDailyReturn / volatility : 0;

    // Win rate (percentage of periods with positive return)
    const positiveReturns = dailyReturns.filter(ret => ret > 0).length;
    const winRate = dailyReturns.length > 0 ? (positiveReturns / dailyReturns.length) * 100 : 0;

    return {
      finalValue,
      totalReturn,
      totalReturnPercentage,
      maxDrawdown,
      maxValue,
      minValue,
      volatility,
      sharpeRatio,
      avgDailyReturn,
      winRate,
    };
  }, [backtestResults, initialAmount]);

  // Notify parent of performance changes
  useEffect(() => {
    if (onPerformanceUpdate && backtestResults.length > 0) {
      onPerformanceUpdate({
        portfolioValue: stats.finalValue,
        totalReturn: stats.totalReturn,
        returnPercentage: stats.totalReturnPercentage,
      });
    }
  }, [stats.finalValue, stats.totalReturn, stats.totalReturnPercentage, onPerformanceUpdate, backtestResults.length]);

  if (!selectedTokens.length) {
    return (
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Backtesting (21 days)</h3>
        </div>
        <div className="text-center py-8">
          <TrendingUp className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-400 mb-2">
            Select tokens
          </h3>
          <p className="text-dark-500">
            Choose tokens to see the backtesting simulation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">
            Strategy Backtesting (21 days)
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('value')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'value'
                ? 'bg-primary-600 text-black'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Value ($)
          </button>
          <button
            onClick={() => setViewMode('percentage')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'percentage'
                ? 'bg-primary-600 text-black'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            Percentage (%)
          </button>
        </div>
      </div>

      {/* Backtesting configuration */}
      <BacktestingConfig
        initialAmount={initialAmount}
        onInitialAmountChange={handleInitialAmountChange}
        onReset={handleReset}
        selectedTokensCount={selectedTokens.length}
      />

      {/* Main statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary-400" />
            <p className="text-sm text-dark-300">Final Value</p>
          </div>
          <p className="text-xl font-bold text-white">
            ${stats.finalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="bg-dark-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            <p className="text-sm text-dark-300">Total Return</p>
          </div>
          <p className={`text-xl font-bold ${stats.totalReturn >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
            {stats.totalReturnPercentage >= 0 ? '+' : ''}{stats.totalReturnPercentage.toFixed(2)}%
          </p>
        </div>

        <div className="bg-dark-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-sm text-dark-300">Max Drawdown</p>
          </div>
          <p className="text-xl font-bold text-red-400">
            -{stats.maxDrawdown.toFixed(2)}%
          </p>
        </div>

        <div className="bg-dark-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="w-4 h-4 text-primary-400" />
            <p className="text-sm text-dark-300">Win Rate</p>
          </div>
          <p className="text-xl font-bold text-primary-400">
            {stats.winRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      {backtestResults.length > 0 && (
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={backtestResults}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7bfcdd" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7bfcdd" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                domain={viewMode === 'percentage' ? ['dataMin', 'dataMax'] : [initialAmount * 0.995, 'dataMax']}
                label={{
                  value: viewMode === 'value' ? 'Portfolio Value ($)' : 'Return (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#9CA3AF' },
                }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'portfolioValue') {
                    return [`$${value.toLocaleString('en-US')}`, 'Portfolio Value'];
                  }
                  if (name === 'returnPercentage') {
                    return [`${value.toFixed(2)}%`, 'Return'];
                  }
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey={viewMode === 'value' ? 'portfolioValue' : 'returnPercentage'}
                stroke="#7bfcdd"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-dark-800 rounded-lg p-3">
          <p className="text-dark-300 mb-1">Daily Volatility</p>
          <p className="text-white font-semibold">{stats.volatility.toFixed(2)}%</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3">
          <p className="text-dark-300 mb-1">Sharpe Ratio</p>
          <p className="text-white font-semibold">{stats.sharpeRatio.toFixed(2)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg p-3">
          <p className="text-dark-300 mb-1">Average Daily Return</p>
          <p className={`font-semibold ${stats.avgDailyReturn >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
            {stats.avgDailyReturn >= 0 ? '+' : ''}{stats.avgDailyReturn.toFixed(4)}%
          </p>
        </div>
      </div>

      {/* Explanatory note */}
      <div className="mt-4 p-3 bg-dark-800 rounded-lg">
        <p className="text-xs text-dark-400">
          <span className="font-semibold text-dark-300">Note:</span> This simulation assumes an equal allocation of ${(initialAmount / selectedTokens.length).toLocaleString('en-US')} 
          per selected token, with automatic reinvestment of funding rates. 
          Past results do not guarantee future performance.
        </p>
      </div>
    </div>
  );
};

export default BacktestingWidget;