import React, { useState } from "react";
import { Shield } from "lucide-react";
import { HedgePositionSummary } from "../types";

interface HedgedPositionCardProps {
  position: HedgePositionSummary;
  totalPortfolioValue: number;
  onAllocationChange: (symbol: string, percentage: number) => void;
  className?: string;
}

const HedgedPositionCard: React.FC<HedgedPositionCardProps> = ({
  position,
  totalPortfolioValue,
  onAllocationChange,
  className = "",
}) => {
  // Calculate current position value in USD
  const positionValueUSD = position.margin + (position.spotBalance * (position.perpValueUSD / Math.abs(position.perpPosition) || 0));
  const currentAllocation = totalPortfolioValue > 0 ? (positionValueUSD / totalPortfolioValue) * 100 : 0;
  
  const [sliderValue, setSliderValue] = useState(currentAllocation);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onAllocationChange(position.symbol, newValue);
  };

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{position.symbol}</h3>
            <span className="text-sm text-dark-400">Hedged Position</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-semibold">${positionValueUSD.toFixed(2)}</div>
          <div className="text-xs text-dark-400">Position Value</div>
        </div>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-dark-400 text-sm mb-1">Spot Balance</p>
          <p className="text-white font-medium">{position.spotBalance.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-dark-400 text-sm mb-1">Perp Position</p>
          <p className="text-white font-medium">{position.perpPosition.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-dark-400 text-sm mb-1">Leverage</p>
          <p className="text-white font-medium">{position.leverage.toFixed(2)}x</p>
        </div>
        <div>
          <p className="text-dark-400 text-sm mb-1">Margin Used</p>
          <p className="text-white font-medium">${position.margin.toFixed(2)}</p>
        </div>
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
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
            }}
          />
        </div>
        
        {/* Value Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-400">Position Value</span>
          <span className="text-white font-medium">${positionValueUSD.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default HedgedPositionCard;
