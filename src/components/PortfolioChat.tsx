import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface PortfolioChartProps {
  data: Array<{ time: number; portfolioValue: number }>;
  initialDepositValue: number;
  className?: string;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({
  data,
  initialDepositValue,
  className = "",
}) => {
  // stats calculation
  const currentValue =
    data.length > 0 ? data[data.length - 1].portfolioValue : 0;
  const initialValue = initialDepositValue ?? 0;
  const absoluteChange = currentValue - initialValue;
  const percentageChange =
    initialValue !== 0
      ? ((currentValue - initialValue) / initialValue) * 100
      : 0;
  const isPositive = absoluteChange >= 0;

  // formating data
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.time).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }));

  // Formatting tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 shadow-lg">
          <p className="text-dark-300 text-sm mb-1">{label}</p>
          <p className="text-white font-medium">
            Value: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-dark-900 border border-dark-800 rounded-xl p-6 ${className}`}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Account Value
              </h3>
            </div>
            <p className="text-dark-400 text-sm">
              Cumulative account value since{" "}
              {new Date(chartData[0].time).toLocaleDateString()}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              isPositive
                ? "bg-green-500/10 text-primary-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? "+" : ""}
              {percentageChange.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-dark-400 text-sm mb-1">Current Value</p>
            <p className="text-white text-xl font-bold">
              ${currentValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-dark-400 text-sm mb-1">Initial Value</p>
            <p className="text-white text-xl font-bold">
              ${initialValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-dark-400 text-sm mb-1">Change</p>
            <p
              className={`text-xl font-bold ${
                isPositive ? "text-primary-400" : "text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}${absoluteChange.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-80">
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
              <linearGradient id="fundingGradient" x1="0" y1="0" x2="0" y2="1">
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="portfolioValue"
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
      </div>
    </div>
  );
};

export default PortfolioChart;
