import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface UnhedgedPositionCardProps {
  symbol: string;
  balance: number;
  valueUSD: number;
  type: "spot" | "perp";
  totalPortfolioValue: number;
  onAllocationChange: (symbol: string, percentage: number) => void;
  currentAllocation?: number;
  resetTrigger?: number;
  totalAllocation?: number;
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
  currentAllocation,
  resetTrigger,
  totalAllocation,
  className = "",
  perpPosition,
  leverage,
  margin,
}) => {
  const initialAllocation = totalPortfolioValue > 0 ? (valueUSD / totalPortfolioValue) * 100 : 0;
  const [sliderValue, setSliderValue] = useState(currentAllocation !== undefined ? currentAllocation : initialAllocation);

  // Update slider when currentAllocation changes
  React.useEffect(() => {
    if (currentAllocation !== undefined) {
      setSliderValue(currentAllocation);
    }
  }, [currentAllocation]);

  // Reset to initial allocation when resetTrigger changes
  React.useEffect(() => {
    if (resetTrigger !== undefined) {
      setSliderValue(initialAllocation);
    }
  }, [resetTrigger, initialAllocation]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onAllocationChange(symbol, newValue);
  };

  // Check if allocation has changed
  const hasChanged = Math.abs(sliderValue - initialAllocation) > 1;
  const isOverAllocated = totalAllocation !== undefined && totalAllocation > 100;

  const getPositionType = () => {
    if (type === "spot") return { label: "SPOT", color: "text-blue-400", bgColor: "bg-blue-500/20" };
    if (perpPosition && perpPosition > 0) return { label: "LONG", color: "text-green-400", bgColor: "bg-green-500/20" };
    if (perpPosition && perpPosition < 0) return { label: "SHORT", color: "text-red-400", bgColor: "bg-red-500/20" };
    return { label: "PERP", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  };

  const positionType = getPositionType();

  return (
    <div className={`bg-dark-800 border ${hasChanged ? 'border-orange-500/50 shadow-orange-500/20 shadow-lg' : 'border-dark-700'} rounded-xl p-6 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${hasChanged ? 'bg-orange-500/30' : 'bg-orange-500/10'} rounded-lg transition-colors duration-300`}>
            <AlertTriangle className={`w-5 h-5 ${hasChanged ? 'text-orange-300' : 'text-orange-400'} transition-colors duration-300`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{symbol}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-400">Unhedged Position</span>
              {hasChanged && (
                <span className="text-xs text-orange-400 font-medium">Modified</span>
              )}
            </div>
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
          <div className="flex items-center gap-2">
            {hasChanged && (
              <span className="text-xs text-orange-400 font-medium">
                {initialAllocation.toFixed(0)}% → 
              </span>
            )}
            <span className={`font-medium ${hasChanged ? 'text-orange-400' : 'text-white'}`}>
              {Math.round(sliderValue)}%
            </span>
          </div>
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
        
        {/* Over-allocation Warning */}
        {isOverAllocated && (
          <div className="flex items-center gap-2 text-xs text-red-400 mt-2">
            <AlertTriangle className="w-3 h-3" />
            <span>Total allocation exceeds 100%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnhedgedPositionCard;
