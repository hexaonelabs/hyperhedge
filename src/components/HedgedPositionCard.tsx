import React, { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { HedgePositionSummary } from "../types";
import { 
  calculateHedgePositionFromAllocation, 
  calculatePositionValue, 
  calculatePositionValueRequied, 
  getCurrentPrice 
} from "../utils/hedgeCalculations";

interface HedgedPositionCardProps {
  position: HedgePositionSummary;
  totalPortfolioValue: number;
  onAllocationChange: (symbol: string, percentage: number) => void;
  currentAllocation?: number;
  resetTrigger?: number;
  totalAllocation?: number;
  className?: string;
  disabled?: boolean;
}

const HedgedPositionCard: React.FC<HedgedPositionCardProps> = ({
  position,
  totalPortfolioValue,
  onAllocationChange,
  currentAllocation,
  resetTrigger,
  totalAllocation,
  className = "",
  disabled = false,
}) => {
  // Calculate current position value in USD
  const positionValueRequied = calculatePositionValueRequied(
    position.spotBalance, 
    position.perpPosition, 
    position.perpValueUSD, 
    position.margin
  );
  const positionValueUSD = calculatePositionValue(
    position.spotBalance,
    position.perpPosition,
    position.perpValueUSD
  );
  const initialAllocation = totalPortfolioValue > 0 ? (positionValueRequied / totalPortfolioValue) * 100 : 0;
  
  const [sliderValue, setSliderValue] = useState(currentAllocation !== undefined ? currentAllocation : initialAllocation);

  // Calculate dynamic values based on slider allocation
  const currentPrice = getCurrentPrice(position.perpValueUSD, position.perpPosition);
  const dynamicPositionBreakdown = calculateHedgePositionFromAllocation(
    sliderValue,
    totalPortfolioValue,
    currentPrice,
    position.leverage
  );

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
    if (disabled) return;
    
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onAllocationChange(position.symbol, newValue);
  };

  // Check if allocation has changed
  const hasChanged = Math.abs(sliderValue - initialAllocation) > 0.1; // Plus sensible: 0.1% au lieu de 1%
  const isOverAllocated = totalAllocation !== undefined && totalAllocation > 100;

  return (
    <div className={`bg-dark-800 border ${hasChanged ? 'border-orange-500/50 shadow-orange-500/20 shadow-lg' : 'border-dark-700'} rounded-xl p-6 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${hasChanged ? 'bg-orange-500/20' : 'bg-primary-500/10'} rounded-lg transition-colors duration-300`}>
            <Shield className={`w-5 h-5 ${hasChanged ? 'text-orange-400' : 'text-primary-400'} transition-colors duration-300`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{position.symbol}</h3>
            <span className="text-sm text-dark-400">Hedged Position</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex flex-col">
            <div className="text-white font-semibold">${positionValueUSD.toFixed(2)}</div>
            {hasChanged && (
              <div className="text-orange-400 text-sm font-medium">
                → ${dynamicPositionBreakdown.totalValue.toFixed(2)}
              </div>
            )}
          </div>
          <div className="text-xs text-dark-400">Position Value</div>
          {hasChanged && (
            <div className="text-xs text-orange-400 font-medium mt-1">Modified</div>
          )}
        </div>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div>
          <p className="text-dark-400 text-xs mb-1">Spot Value USD</p>
          <div className="flex flex-col">
            <p className="text-white font-medium">${(currentPrice * position.spotBalance).toFixed(2)}</p>
            {hasChanged && (
              <p className="text-orange-400 text-xs">
                → ${(currentPrice * dynamicPositionBreakdown.spotBalance).toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-dark-400 text-xs mb-1">Spot Quantity</p>
          <div className="flex flex-col">
            <p className="text-white font-medium">{position.spotBalance.toFixed(4)}</p>
            {hasChanged && (
              <p className="text-orange-400 text-xs">
                → {dynamicPositionBreakdown.spotBalance.toFixed(4)}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-dark-400 text-xs mb-1">Perp Value USD</p>
          <div className="flex flex-col">
            <p className="text-white font-medium">${position.perpValueUSD.toFixed(2)}</p>
            {hasChanged && (
              <p className="text-orange-400 text-xs">
                → ${(currentPrice * Math.abs(dynamicPositionBreakdown.perpPosition)).toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-dark-400 text-xs mb-1">Perp Quantity</p>
          <div className="flex flex-col">
            <p className="text-white font-medium">{position.perpPosition.toFixed(4)}</p>
            {hasChanged && (
              <p className="text-orange-400 text-xs">
                → {dynamicPositionBreakdown.perpPosition.toFixed(4)}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-dark-400 text-xs mb-1">Leverage</p>
          <p className="text-white font-medium">{position.leverage.toFixed(0)}x</p>
        </div>
        <div>
          <p className="text-dark-400 text-xs mb-1">Margin Value USD</p>
          <div className="flex flex-col">
            <p className="text-white font-medium">${position.margin.toFixed(2)}</p>
            {hasChanged && (
              <p className="text-orange-400 text-xs">
                → ${dynamicPositionBreakdown.margin.toFixed(2)}
              </p>
            )}
          </div>
        </div>
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
            <span className={`text-2xl font-medium ${hasChanged ? 'text-orange-400' : 'text-primary-500'}`}>
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
            disabled={disabled}
            className={`w-full h-2 bg-dark-600 rounded-lg appearance-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            style={{
              background: `linear-gradient(to right, #97fce4 0%, #97fce4 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
            }}
          />
        </div>
        
        {/* Value Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-400">Current price</span>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">${(position.perpValueUSD / Math.abs(position.perpPosition)).toFixed(4)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-400">Liquidation price</span>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">${position.liquidationPx.toFixed(2)}</span>
              <span className="text-xs text-dark-400">
                ({(((position.liquidationPx - currentPrice) / currentPrice) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
        
        {/* Over-allocation Warning */}
        {isOverAllocated && (
          <div className="flex items-center gap-2 text-xs text-red-400 mt-2">
            <AlertCircle className="w-3 h-3" />
            <span>Total allocation exceeds 100%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HedgedPositionCard;
