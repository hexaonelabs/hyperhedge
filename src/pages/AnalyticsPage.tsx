import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Filter, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useHyperliquidProcessedData } from "../hooks/useHyperliquidProcessedData";

// interface FundingData {
//   coin: string;
//   fundings: number[][];
// }

interface ChartData {
  timestamp: number;
  date: string;
  [key: string]: number | string;
}

// interface CachedFundingData {
//   data: FundingData[];
//   timestamp: number;
// }

interface APYStats {
  coin: string;
  averageAPY: number;
  minAPY: number;
  maxAPY: number;
  dataPoints: number;
}

// // Cache configuration
// const CACHE_KEY = "funding_rates_cache";
// const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// // Cache utility functions
// const getCachedData = (): FundingData[] | null => {
//   try {
//     const cached = localStorage.getItem(CACHE_KEY);
//     if (!cached) return null;

//     const parsedCache: CachedFundingData = JSON.parse(cached);
//     const now = Date.now();

//     // Check if cache is still valid (within 30 minutes)
//     if (now - parsedCache.timestamp < CACHE_DURATION) {
//       console.log("Using cached funding rates data");
//       return parsedCache.data;
//     } else {
//       // Cache expired, remove it
//       localStorage.removeItem(CACHE_KEY);
//       console.log("Cache expired, removed from localStorage");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error reading cache:", error);
//     localStorage.removeItem(CACHE_KEY);
//     return null;
//   }
// };

// const setCachedData = (data: FundingData[]): void => {
//   try {
//     const cacheData: CachedFundingData = {
//       data,
//       timestamp: Date.now(),
//     };
//     localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
//     console.log("Funding rates data cached successfully");
//   } catch (error) {
//     console.error("Error caching data:", error);
//   }
// };

const AnalyticsPage: React.FC = () => {
  const { fundingHistory, isLoading: loading } = useHyperliquidProcessedData();
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [apyStats, setApyStats] = useState<APYStats[]>([]);

  
  // Create a stable color mapping for each token
  const tokenColorMap = useMemo(() => {
    // Colors for different lines
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7300",
      "#8dd1e1",
      "#d084d0",
      "#ffb347",
      "#87ceeb",
      "#dda0dd",
      "#98fb98",
    ];
    const map = new Map<string, string>();
    if (fundingHistory) {
      // Sort tokens alphabetically to ensure consistent order
      const sortedTokens = fundingHistory.map((item) => item.coin).sort();

      sortedTokens.forEach((token, index) => {
        map.set(token, colors[index % colors.length]);
      });
    }
    return map;
  }, [fundingHistory]);

  useEffect(() => {
    // On initial load, select the 3 tokens with best average APY
    if (fundingHistory && fundingHistory.length > 0) {
      // Calculate APY for each token
      const tokensWithAPY = fundingHistory.map((item) => {
        // Calculate average APY for this token
        const averageAPY =
          item.fundings.length > 0
            ? (item.fundings.reduce(
                (acc, funding) => acc + Number(funding[1]),
                0
              ) /
                item.fundings.length) *
              24 *
              365 *
              100
            : 0;

        return {
          coin: item.coin,
          averageAPY,
        };
      });

      // Sort by APY (descending) and take top 3
      const topTokens = tokensWithAPY
        .sort((a, b) => b.averageAPY - a.averageAPY)
        .slice(0, 3)
        .map((token) => token.coin);

      setSelectedTokens(topTokens);
    }
  }, [fundingHistory]);

  // Prepare data for chart
  useEffect(() => {
    if (fundingHistory.length === 0 || selectedTokens.length === 0) {
      setChartData([]);
      setApyStats([]);
      return;
    }

    // Create a map of all unique timestamps
    const timestampSet = new Set<number>();
    fundingHistory
      .filter((item) => selectedTokens.includes(item.coin))
      .forEach((item) => {
        item.fundings.forEach(([timestamp]) => {
          timestampSet.add(timestamp);
        });
      });

    // Sort timestamps
    const sortedTimestamps = Array.from(timestampSet).sort((a, b) => a - b);

    // Create chart data
    const processedData: ChartData[] = sortedTimestamps.map((timestamp) => {
      const dataPoint: ChartData = {
        timestamp,
        // Format date with time for display
        date: new Date(timestamp).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };

      // Add funding values for each selected token
      selectedTokens.forEach((coin) => {
        const tokenData = fundingHistory.find((item) => item.coin === coin);
        if (tokenData) {
          const fundingEntry = tokenData.fundings.find(
            ([ts]) => ts === timestamp
          );
          if (fundingEntry) {
            // Convert to annualized percentage (funding rate * 24 * 365)
            dataPoint[coin] = Number(
              (fundingEntry[1] * 24 * 365 * 100).toFixed(4)
            );
          }
        }
      });

      return dataPoint;
    });

    setChartData(processedData);

    // Calculate APY statistics
    const stats = calculateAPYStats(processedData, selectedTokens);
    setApyStats(stats);
  }, [fundingHistory, selectedTokens]);

  // Function to get color for a specific token
  const getTokenColor = (token: string): string => {
    return tokenColorMap.get(token) || '#8884d8';
  };

  const calculateAPYStats = (
    data: ChartData[],
    tokens: string[]
  ): APYStats[] => {
    return tokens.map((coin) => {
      const apyValues = data
        .map((item) => item[coin] as number)
        .filter((value) => value !== undefined && !isNaN(value));

      if (apyValues.length === 0) {
        return {
          coin,
          averageAPY: 0,
          minAPY: 0,
          maxAPY: 0,
          dataPoints: 0,
        };
      }

      const averageAPY =
        apyValues.reduce((sum, value) => sum + value, 0) / apyValues.length;
      const minAPY = Math.min(...apyValues);
      const maxAPY = Math.max(...apyValues);

      return {
        coin,
        averageAPY,
        minAPY,
        maxAPY,
        dataPoints: apyValues.length,
      };
    });
  };

  // Calculate overall portfolio average APY
  const calculatePortfolioAPY = (): number => {
    if (apyStats.length === 0) return 0;

    const totalAPY = apyStats.reduce((sum, stat) => sum + stat.averageAPY, 0);
    return totalAPY / apyStats.length;
  };

  const handleTokenToggle = (coin: string) => {
    setSelectedTokens((prev) =>
      prev.includes(coin)
        ? prev.filter((token) => token !== coin)
        : [...prev, coin]
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Analytics</h1>
          <p className="text-dark-300">
            Deep dive into funding rates history and performance metrics.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading funding data...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Analytics</h1>
        <p className="text-dark-300">
          Deep dive into funding rates history and performance metrics.
        </p>
      </div>

      {/* Chart */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          Funding Rates History (APY %)
        </h2>
        {chartData.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  label={{
                    value: "APY (%)",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: "#9CA3AF" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                  formatter={(value, name: string) => [
                    `${Number(value).toFixed(4)}%`,
                    name,
                  ]}
                />
                <Legend />
                {selectedTokens.map((coin) => (
                  <Line
                    key={coin}
                    type="monotone"
                    dataKey={coin}
                    stroke={getTokenColor(coin)}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-400 mb-2">
              Select Tokens to View Chart
            </h3>
            <p className="text-dark-500">
              Choose tokens from the filters above to display the funding rates
              chart.
            </p>
          </div>
        )}
      </div>

      {/* Token Filters */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Token Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {fundingHistory.map((item) => (
            <button
              key={item.coin}
              onClick={() => handleTokenToggle(item.coin)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTokens.includes(item.coin)
                  ? "bg-blue-600 text-white"
                  : "bg-dark-800 text-dark-300 hover:bg-dark-700"
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getTokenColor(item.coin) }}
              ></span>
              {item.coin}
            </button>
          ))}
        </div>
        <p className="text-sm text-dark-400 mt-2">
          {selectedTokens.length} token(s) selected
        </p>
      </div>

      {/* APY Statistics */}
      {selectedTokens.length > 0 && (
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">
              APY Statistics (7 Days)
            </h3>
          </div>

          {/* Portfolio Average */}
          <div className="bg-dark-800 rounded-lg p-4 mb-4">
            <div className="text-center">
              <p className="text-dark-300 text-sm mb-1">
                Portfolio Average APY
              </p>
              <p className="text-3xl font-bold text-green-400">
                {calculatePortfolioAPY().toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Individual Token Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apyStats.map((stat) => (
              <div key={stat.coin} className="bg-dark-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: getTokenColor(stat.coin) }}
                  ></span>
                  <h4 className="font-semibold text-white">{stat.coin}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-300">Average:</span>
                    <span className="text-white font-medium">
                      {stat.averageAPY.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Min:</span>
                    <span className="text-red-400">
                      {stat.minAPY.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Max:</span>
                    <span className="text-green-400">
                      {stat.maxAPY.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Data Points:</span>
                    <span className="text-dark-200">
                      {stat.dataPoints} ({stat.dataPoints / 24} days)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
