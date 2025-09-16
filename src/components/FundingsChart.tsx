import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
  LineChart,
  ReferenceLine,
} from "recharts";
import { TrendingUp, DollarSign, BarChart3, ChevronDown } from "lucide-react";
import { useHyperliquidProcessedData } from "../hooks/useHyperliquidProcessedData";
import { UserFundingUpdate } from "@nktkas/hyperliquid";

interface FundingDataPoint {
  time: number;
  funding: number;
}

interface FundingsChartProps {
  data: FundingDataPoint[];
  initialAmountUSD: number;
  className?: string;
}

type TimeFilter = '7d' | '14d' | '30d' | '90d' | 'all';

interface TimeFilterOption {
  value: TimeFilter;
  label: string;
  days: number | null;
}

const timeFilterOptions: TimeFilterOption[] = [
  { value: '7d', label: '7 jours', days: 7 },
  { value: '14d', label: '14 jours', days: 14 },
  { value: '30d', label: '30 jours', days: 30 },
  { value: '90d', label: '90 jours', days: 90 },
  { value: 'all', label: 'Tout', days: null },
];

const FundingsChart: React.FC<FundingsChartProps> = ({
  data,
  initialAmountUSD,
  className = "",
}) => {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilter>('7d');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { raw: { userFunding } } = useHyperliquidProcessedData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter data based on selected time period
  const filteredData = useMemo(() => {
    const selectedOption = timeFilterOptions.find(option => option.value === selectedTimeFilter);
    
    if (!selectedOption || selectedOption.days === null) {
      return data; // Return all data
    }

    const cutoffTime = Date.now() - (selectedOption.days * 24 * 60 * 60 * 1000);
    return data.filter(point => point.time >= cutoffTime);
  }, [data, selectedTimeFilter]);

  // Filter userFunding data as well
  const filteredUserFunding = useMemo(() => {
    const selectedOption = timeFilterOptions.find(option => option.value === selectedTimeFilter);
    
    if (!userFunding || !selectedOption || selectedOption.days === null) {
      return userFunding || [];
    }

    const cutoffTime = Date.now() - (selectedOption.days * 24 * 60 * 60 * 1000);
    return userFunding.filter(point => point.time >= cutoffTime);
  }, [userFunding, selectedTimeFilter]);

  // Recalculate metrics based on filtered data
  const filteredMetrics = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalFunding: 0,
        actualTotalDays: 0,
        actualApyPercentage: 0,
      };
    }

    const totalFunding = filteredData[filteredData.length - 1]?.funding || 0;
    const actualTotalDays = (Date.now() - (filteredData[0]?.time || 0)) / (1000 * 60 * 60 * 24);
    const totalGainByDayUSD = totalFunding / (actualTotalDays || 1);
    const actualApyPercentage = (Math.pow(1 + totalGainByDayUSD / initialAmountUSD, 365) - 1) * 100;

    return {
      totalFunding,
      actualTotalDays,
      actualApyPercentage,
    };
  }, [filteredData, initialAmountUSD]);
  // Format data for chart with stable keys
  const chartData = useMemo(() => filteredData.map((point) => ({
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
  })), [filteredData]);

  // Calculate APY progression data based on real funding data with stable keys
  const apyData = useMemo(() => filteredUserFunding.map((point, index) => {
    let instantAPY = 0;
    
    if (index > 0) {
      instantAPY = Number(point.delta.fundingRate || 0) * 24 * 365 * 100;
    }
    
    return {
      ...point,
      index: index,
      timestamp: point.time,
      date: new Date(point.time).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      apy: instantAPY,
    };
  }), [filteredUserFunding]);
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
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: UserFundingUpdate }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const dataPoint = payload[0].payload;
      const fundingAmount = Number(dataPoint.delta.usdc || 0);
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg">
          <p className="text-dark-300 text-sm mb-1">{new Date(dataPoint.time).toLocaleString()}</p>
          <p className={`font-semibold ${value >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
            {value >= 0 ? "+" : ""}
            {value.toFixed(2)}% APY
          </p>
          <p className="text-dark-400 text-xs mt-1">
            Cumulative: ${fundingAmount.toFixed(8)}
          </p>
          <p className="text-dark-400 text-xs">
            Instantaneous yield for this period
          </p>
        </div>
      );
    }
    return null;
  };

  const totalFunding = filteredMetrics.totalFunding;
  const isPositive = totalFunding >= 0;

  // Calculate APY statistics with memoization
  const apyStatistics = useMemo(() => {
    const validAPYValues = apyData.filter(point => point.apy !== 0).map(point => point.apy);
    return {
      maxAPY: validAPYValues.length > 0 ? Math.max(...validAPYValues) : 0,
      minAPY: validAPYValues.length > 0 ? Math.min(...validAPYValues) : 0,
    };
  }, [apyData]);

  const { maxAPY, minAPY } = apyStatistics;

  return (
    <div
      className={`bg-dark-900 border border-dark-800 rounded-xl p-6 ${className}`}
    >
      {/* Header with stats and time filter */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6 mb-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Funding Rates Progress
              </h3>
            </div>
            
            {/* Time Filter Dropdown - à côté du titre */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-300 hover:bg-dark-700 hover:border-dark-500 transition-colors min-w-[100px]"
              >
                <span className="truncate">
                  {timeFilterOptions.find(option => option.value === selectedTimeFilter)?.label}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                  {timeFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedTimeFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-dark-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedTimeFilter === option.value
                          ? 'text-primary-400 bg-primary-500/10'
                          : 'text-dark-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-dark-400 text-sm">
            Cumulative funding earnings over the last {Math.round(filteredMetrics.actualTotalDays)}{" "}
            days
          </p>
        </div>

        <div className="text-left lg:text-right">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-dark-400 text-sm mb-1">Average APY</p>
          <p
            className={`text-lg font-bold ${
              filteredMetrics.actualApyPercentage >= 0 ? "text-primary-400" : "text-red-400"
            }`}
          >
            {filteredMetrics.actualApyPercentage >= 0 ? "+" : ""}
            {filteredMetrics.actualApyPercentage.toFixed(2)}%
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-dark-400 text-sm mb-1">APY Range</p>
          <p
            className={`text-lg font-bold ${
              maxAPY >= 0 ? "text-white" : "text-red-400"
            }`}
          >
            {minAPY.toFixed(1)}% → {maxAPY.toFixed(1)}%
          </p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-dark-400 text-sm mb-1">Daily Average</p>
          <p
            className={`text-lg font-bold ${
              totalFunding >= 0 ? "text-primary-400" : "text-red-400"
            }`}
          >
            ${((totalFunding || 0) / (filteredMetrics.actualTotalDays || 1)).toFixed(4)}
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
            <ResponsiveContainer width="100%" height="100%" key={`funding-chart-${selectedTimeFilter}`}>
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
                    id={`fundingGradient-${selectedTimeFilter}`}
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
                  fill={`url(#fundingGradient-${selectedTimeFilter})`}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: isPositive ? "#7bfcdd" : "#f87171",
                    strokeWidth: 2,
                    fill: "#0f172a",
                  }}
                  isAnimationActive={false}
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
            Instantaneous APY
          </h4>
          {apyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" key={`apy-chart-${selectedTimeFilter}`}>
              <LineChart
                data={apyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="index"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => {
                    const dataPoint = apyData[value];
                    return dataPoint ? dataPoint.date : '';
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  dx={-10}
                  domain={[minAPY, maxAPY]}
                />
                <Tooltip content={<CustomAPYTooltip />} />
                <ReferenceLine 
                  y={0} 
                  stroke="#64748b" 
                  strokeDasharray="5 5" 
                  strokeWidth={1}
                  opacity={0.7}
                />
                <Line
                  type="monotone"
                  dataKey="apy"
                  stroke="#7bfcdd"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: "#7bfcdd",
                    strokeWidth: 2,
                    fill: "#0f172a",
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
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
