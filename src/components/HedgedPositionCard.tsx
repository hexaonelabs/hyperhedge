import React, { useState } from "react";
import { Shield, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className={`bg-dark-800 border ${hasChanged ? 'border-orange-500/50 shadow-orange-500/20 shadow-lg' : 'border-dark-700'} rounded-xl transition-all duration-300 ${className}`}>
      {/* Compact Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-dark-700 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Desktop Layout: Single Row */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 ${hasChanged ? 'bg-orange-500/20' : 'bg-primary-500/10'} rounded-lg transition-colors duration-300 flex-shrink-0`}>
              <Shield className={`w-4 h-4 ${hasChanged ? 'text-orange-400' : 'text-primary-400'} transition-colors duration-300`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{position.symbol}</h3>
              <span className="text-sm text-dark-400">Hedged Position</span>
            </div>
          </div>
          
          {/* Allocation Slider - Desktop */}
          <div className="flex items-center gap-3 min-w-[280px] mx-6">
            <span className="text-sm text-dark-400 whitespace-nowrap">Allocation:</span>
            <div className="flex-1 relative">
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
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className={`text-lg font-bold ${hasChanged ? 'text-orange-400' : 'text-primary-500'} whitespace-nowrap min-w-[50px] text-right`}>
              {Math.round(sliderValue)}%
            </span>
          </div>
          
          {/* Position Value - Desktop */}
          <div className="text-right min-w-[120px]">
            <div className="text-white font-medium text-sm">${positionValueUSD.toFixed(2)}</div>
            {hasChanged && (
              <div className="text-orange-400 text-xs font-medium">
                → ${dynamicPositionBreakdown.totalValue.toFixed(2)}
              </div>
            )}
          </div>
          
          {/* Expand/Collapse Icon - Desktop */}
          <div className="flex-shrink-0 ml-4">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-dark-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-dark-400" />
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout: Two Rows */}
        <div className="lg:hidden">
          {/* First Row: Icon, Name, Value, Expand Icon */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 ${hasChanged ? 'bg-orange-500/20' : 'bg-primary-500/10'} rounded-lg transition-colors duration-300 flex-shrink-0`}>
                <Shield className={`w-4 h-4 ${hasChanged ? 'text-orange-400' : 'text-primary-400'} transition-colors duration-300`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{position.symbol}</h3>
                <span className="text-sm text-dark-400">Hedged Position</span>
              </div>
            </div>
            
            {/* Position Value - Mobile/Tablet */}
            <div className="text-right min-w-[120px]">
              <div className="text-white font-medium text-sm">${positionValueUSD.toFixed(2)}</div>
              {hasChanged && (
                <div className="text-orange-400 text-xs font-medium">
                  → ${dynamicPositionBreakdown.totalValue.toFixed(2)}
                </div>
              )}
            </div>
            
            {/* Expand/Collapse Icon - Mobile/Tablet */}
            <div className="flex-shrink-0 ml-2">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-dark-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-dark-400" />
              )}
            </div>
          </div>

          {/* Second Row: Allocation Slider - Mobile/Tablet */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-dark-400 whitespace-nowrap">Allocation:</span>
            <div className="flex-1 relative">
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
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className={`text-lg font-bold ${hasChanged ? 'text-orange-400' : 'text-primary-500'} whitespace-nowrap min-w-[50px] text-right`}>
              {Math.round(sliderValue)}%
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-dark-700">
          <div className="mt-4">
            {/* Position Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 text-sm">
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

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Allocated Capital USD</span>
                <div className="flex flex-col items-end">
                  <p className="text-white font-medium">${positionValueRequied.toFixed(2)}</p>
                  {hasChanged && (
                    <p className="text-orange-400 text-xs">
                      → ${(dynamicPositionBreakdown.totalValue + dynamicPositionBreakdown.margin).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-dark-400">Current price</span>
                <span className="text-white font-medium">${(position.perpValueUSD / Math.abs(position.perpPosition)).toFixed(4)}</span>
              </div>

              <div className="flex items-center justify-between">
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
            </div>
            
            {/* Allocation Change Indicator */}
            {hasChanged && (
              <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Position Modified</span>
                </div>
                <span className="text-xs text-orange-400 font-medium">
                  {initialAllocation.toFixed(1)}% → {sliderValue.toFixed(1)}%
                </span>
              </div>
            )}
            
            {/* Over-allocation Warning */}
            {isOverAllocated && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-3 h-3" />
                <span>Total allocation exceeds 100%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HedgedPositionCard;
