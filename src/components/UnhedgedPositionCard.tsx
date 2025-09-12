import React, { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

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
  disabled?: boolean;
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
  disabled = false,
}) => {
  const initialAllocation = totalPortfolioValue > 0 ? (valueUSD / totalPortfolioValue) * 100 : 0;
  const [sliderValue, setSliderValue] = useState(currentAllocation !== undefined ? currentAllocation : initialAllocation);
  const [isExpanded, setIsExpanded] = useState(false);

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
    onAllocationChange(symbol, newValue);
  };

  // Check if allocation has changed
  const hasChanged = Math.abs(sliderValue - initialAllocation) > 1;
  const isOverAllocated = totalAllocation !== undefined && totalAllocation > 100;

  const getPositionType = () => {
    if (type === "spot") return { label: "SPOT", color: "text-blue-400", bgColor: "bg-blue-500/20" };
    if (perpPosition && perpPosition > 0) return { label: "LONG", color: "text-primary-400", bgColor: "bg-green-500/20" };
    if (perpPosition && perpPosition < 0) return { label: "SHORT", color: "text-red-400", bgColor: "bg-red-500/20" };
    return { label: "PERP", color: "text-yellow-400", bgColor: "bg-yellow-500/20" };
  };

  const positionType = getPositionType();

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
            <div className={`p-2 ${hasChanged ? 'bg-orange-500/30' : 'bg-orange-500/10'} rounded-lg transition-colors duration-300 flex-shrink-0`}>
              <AlertTriangle className={`w-4 h-4 ${hasChanged ? 'text-orange-300' : 'text-orange-400'} transition-colors duration-300`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white truncate">{symbol}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${positionType.bgColor} ${positionType.color} flex-shrink-0`}>
                  {positionType.label}
                </span>
              </div>
              <span className="text-sm text-dark-400">Unhedged Position</span>
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
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className={`text-lg font-bold ${hasChanged ? 'text-orange-400' : 'text-white'} whitespace-nowrap min-w-[50px] text-right`}>
              {Math.round(sliderValue)}%
            </span>
          </div>
          
          {/* Position Value - Desktop */}
          <div className="text-right min-w-[120px]">
            <div className="text-white font-medium text-sm">${valueUSD.toFixed(2)}</div>
            <div className="text-xs text-dark-400">Position Value</div>
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
          {/* First Row: Icon, Name, Badge, Value, Expand Icon */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 ${hasChanged ? 'bg-orange-500/30' : 'bg-orange-500/10'} rounded-lg transition-colors duration-300 flex-shrink-0`}>
                <AlertTriangle className={`w-4 h-4 ${hasChanged ? 'text-orange-300' : 'text-orange-400'} transition-colors duration-300`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white truncate">{symbol}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${positionType.bgColor} ${positionType.color} flex-shrink-0`}>
                    {positionType.label}
                  </span>
                </div>
                <span className="text-sm text-dark-400">Unhedged Position</span>
              </div>
            </div>
            
            {/* Position Value - Mobile/Tablet */}
            <div className="text-right min-w-[120px]">
              <div className="text-white font-medium text-sm">${valueUSD.toFixed(2)}</div>
              <div className="text-xs text-dark-400">Position Value</div>
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
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className={`text-lg font-bold ${hasChanged ? 'text-orange-400' : 'text-white'} whitespace-nowrap min-w-[50px] text-right`}>
              {Math.round(sliderValue)}%
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-dark-700">
          <div className="mt-4">
            {/* Risk Warning */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
              <p className="text-orange-400 text-sm">
                This position is not hedged and exposed to market risk
              </p>
            </div>

            {/* Position Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            
            {/* Allocation Change Indicator */}
            {hasChanged && (
              <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
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
                <AlertTriangle className="w-3 h-3" />
                <span>Total allocation exceeds 100%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnhedgedPositionCard;
