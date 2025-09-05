import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface UnhedgedPositionCardProps {
  symbol: string;
  balance: number;
  valueUSD: number;
  type: "spot" | "perp";
  totalPortfolioValue: number;
  onAllocationChange: (symbol: string, percentage: number) => void;
  className?: string;
  perpPosition?: number;
  leverage?: number;
  margin?: number;
}

const UnhedgedPositionCard: React.FC<UnhedgedPositionCardProps> = ({
  symbol,
  balance,
  valueUSD,
  type,
  totalPortfolioValue,
  onAllocationChange,
  className = "",
  perpPosition,
  leverage,
  margin,
}) => {
  const currentAllocation = totalPortfolioValue > 0 ? (valueUSD / totalPortfolioValue) * 100 : 0;
  const [sliderValue, setSliderValue] = useState(currentAllocation);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onAllocationChange(symbol, newValue);
  };

  const getPositionType = () => {
    if (type === "spot") return { label: "SPOT", color: "text-blue-400", bgColor: "bg-blue-500/20" };
    if (perpPosition && perpPosition > 0) return { label: "LONG", color: "text-green-400", bgColor: "bg-green-500/20" };
    if (perpPosition && perpPosition < 0) return { label: "SHORT", color: "text-red-400", bgColor: "bg-red-500/20" };
    return { label: "PERP", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  };

  const positionType = getPositionType();

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{symbol}</h3>
            <span className="text-sm text-dark-400">Unhedged Position</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${positionType.bgColor} ${positionType.color}`}>
          {positionType.label}
        </span>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-dark-400 text-sm mb-1">Balance</p>
          <p className="text-white font-medium">{balance.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-dark-400 text-sm mb-1">Value USD</p>
          <p className="text-white font-medium">${valueUSD.toFixed(2)}</p>
        </div>
        {type === "perp" && (
          <>
            <div>
              <p className="text-dark-400 text-sm mb-1">Leverage</p>
              <p className="text-white font-medium">{leverage?.toFixed(2) || 0}x</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm mb-1">Margin Used</p>
              <p className="text-white font-medium">${margin?.toFixed(2) || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Risk Warning */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
        <p className="text-orange-400 text-sm">
          This position is not hedged and exposed to market risk
        </p>
      </div>

      {/* Portfolio Allocation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-dark-400 text-sm">Portfolio Allocation</span>
          <span className="text-white font-medium">{Math.round(sliderValue)}%</span>
        </div>
        
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
            }}
          />
        </div>
        
        {/* Value Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-400">Position Value</span>
          <span className="text-white font-medium">${valueUSD.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default UnhedgedPositionCard;
