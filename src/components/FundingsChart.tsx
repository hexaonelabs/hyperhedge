import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface FundingDataPoint {
  time: number;
  funding: number;
}

interface FundingsChartProps {
  data: FundingDataPoint[];
  totalDays: number;
  apyPercentage: number;
  initialAmountUSD: number;
  className?: string;
}

const FundingsChart: React.FC<FundingsChartProps> = ({
  data,
  totalDays,
  apyPercentage,
  initialAmountUSD,
  className = "",
}) => {
  // Format data for chart
  const chartData = data.map((point) => ({
    ...point,
    date: new Date(point.time).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    fundingUSD: point.funding,
  }));

  // Calculate APY progression data
  const apyData = data.map((point) => {
    const periodDays = (point.time - data[0].time) / (1000 * 60 * 60 * 24);
    const annualizedReturn = periodDays > 0 ? (point.funding / initialAmountUSD) * (365 / periodDays) * 100 : 0;
    return {
      ...point,
      date: new Date(point.time).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      apy: annualizedReturn,
    };
  });

  // Custom tooltip for funding chart
  const CustomFundingTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg">
          <p className="text-dark-300 text-sm mb-1">{label}</p>
          <p className="text-white font-semibold">
            ${value >= 0 ? "+" : ""}
            {value.toFixed(4)} USD
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for APY chart
  const CustomAPYTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg">
          <p className="text-dark-300 text-sm mb-1">{label}</p>
          <p className="text-white font-semibold">
            {value >= 0 ? "+" : ""}
            {value.toFixed(2)}% APY
          </p>
        </div>
      );
    }
    return null;
  };

  const totalFunding = data[data.length - 1]?.funding || 0;
  const isPositive = totalFunding >= 0;

  return (
    <div
      className={`bg-dark-900 border border-dark-800 rounded-xl p-6 ${className}`}
    >
      {/* Header with stats */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Funding Rates Progress
            </h3>
          </div>
          <p className="text-dark-400 text-sm">
            Cumulative funding earnings over the last {Math.round(totalDays)}{" "}
            days
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-dark-400" />
            <span className="text-dark-400 text-sm">Total Earned</span>
          </div>
          <p
            className={`text-xl font-bold ${
              isPositive ? "text-primary-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}${totalFunding.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-dark-400 text-sm mb-1">Estimated APY</p>
          <p
            className={`text-lg font-bold ${
              apyPercentage >= 0 ? "text-primary-400" : "text-red-400"
            }`}
          >
            {apyPercentage >= 0 ? "+" : ""}
            {apyPercentage.toFixed(2)}%
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-dark-400 text-sm mb-1">Daily Average</p>
          <p
            className={`text-lg font-bold ${
              totalFunding >= 0 ? "text-primary-400" : "text-red-400"
            }`}
          >
            ${((totalFunding || 0) / (totalDays || 1)).toFixed(4)}
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-dark-400 text-sm mb-1">Position Size</p>
          <p className="text-lg font-bold text-white">
            ${initialAmountUSD.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funding Progress Chart */}
        <div className="h-80">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary-400" />
            Cumulative Funding Earnings
          </h4>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <defs>
                  <linearGradient
                    id="fundingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={isPositive ? "#7bfcdd" : "#f87171"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? "#7bfcdd" : "#f87171"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  dx={-10}
                />
                <Tooltip content={<CustomFundingTooltip />} />
                <Area
                  type="monotone"
                  dataKey="fundingUSD"
                  stroke={isPositive ? "#7bfcdd" : "#f87171"}
                  strokeWidth={2}
                  fill="url(#fundingGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: isPositive ? "#7bfcdd" : "#f87171",
                    strokeWidth: 2,
                    fill: "#0f172a",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-dark-400 mb-2">
                  No Funding Data
                </h4>
                <p className="text-dark-500 text-sm">
                  Funding history will appear here once you have active positions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* APY Progress Chart */}
        <div className="h-80">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            APY Progression
          </h4>
          {apyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={apyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <defs>
                  <linearGradient
                    id="apyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={isPositive ? "#7bfcdd" : "#f87171"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? "#7bfcdd" : "#f87171"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  dx={-10}
                />
                <Tooltip content={<CustomAPYTooltip />} />
                <Area
                  type="monotone"
                  dataKey="apy"
                  stroke={isPositive ? "#7bfcdd" : "#f87171"}
                  strokeWidth={2}
                  fill="url(#apyGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: isPositive ? "#7bfcdd" : "#f87171",
                    strokeWidth: 2,
                    fill: "#0f172a",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-dark-400 mb-2">
                  No APY Data
                </h4>
                <p className="text-dark-500 text-sm">
                  APY progression will appear here once you have active positions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      {chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-800">
          <p className="pt-3 text-dark-500 text-xs text-center">
            Funding rates are collected every hour and represent earnings from
            holding positions. Past performance does not guarantee future
            results.
          </p>
        </div>
      )}
    </div>
  );
};

export default FundingsChart;
