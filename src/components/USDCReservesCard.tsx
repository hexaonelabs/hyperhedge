import React, { useState } from "react";
import { DollarSign, ChevronDown, ChevronUp } from "lucide-react";

interface USDCReservesCardProps {
  spotUSDC: number;
  perpUSDC: number;
  totalPortfolioValue?: number;
  className?: string;
}

const USDCReservesCard: React.FC<USDCReservesCardProps> = ({
  spotUSDC,
  perpUSDC,
  totalPortfolioValue,
  className = "",
}) => {
  const totalUSDC = spotUSDC + perpUSDC;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`relative bg-gradient-to-br from-blue-900/20 via-dark-800 to-dark-800 border-2 border-blue-500/30 rounded-xl transition-all duration-300 ${className}`}>
      {/* Compact Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-dark-700 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Desktop Layout: Single Row */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-500/20 rounded-lg ring-2 ring-blue-500/20 flex-shrink-0">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white truncate">USDC Reserves</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/30 text-blue-300 border border-blue-500/40 flex-shrink-0">
                  STABLE
                </span>
              </div>
              <span className="text-sm text-dark-400">Cash Position</span>
            </div>
          </div>
          
          {/* Portfolio Allocation - Desktop */}
          <div className="text-center mx-6">
            <div className="text-blue-400 font-bold text-lg">
              {(totalPortfolioValue && totalPortfolioValue > 0) ? ((totalUSDC / totalPortfolioValue) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-dark-400">Portfolio</div>
          </div>
          
          {/* Total USDC - Desktop */}
          <div className="text-right min-w-[120px]">
            <div className="text-white font-medium text-sm">${totalUSDC.toFixed(2)}</div>
            <div className="text-xs text-dark-400">Total USDC</div>
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
          {/* First Row: Icon, Name, Badge, Total USDC, Expand Icon */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-blue-500/20 rounded-lg ring-2 ring-blue-500/20 flex-shrink-0">
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white truncate">USDC Reserves</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/30 text-blue-300 border border-blue-500/40 flex-shrink-0">
                    STABLE
                  </span>
                </div>
                <span className="text-sm text-dark-400">Cash Position</span>
              </div>
            </div>
            
            {/* Total USDC - Mobile/Tablet */}
            <div className="text-right min-w-[120px]">
              <div className="text-white font-medium text-sm">${totalUSDC.toFixed(2)}</div>
              <div className="text-xs text-dark-400">Total USDC</div>
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

          {/* Second Row: Portfolio Allocation - Mobile/Tablet */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">
                {(totalPortfolioValue && totalPortfolioValue > 0) ? ((totalUSDC / totalPortfolioValue) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-dark-400">Portfolio Allocation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-blue-500/20">
          <div className="mt-4">
            {/* USDC Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-dark-400 text-sm mb-1">Spot USDC</p>
                <p className="text-white font-medium">${spotUSDC.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">Perp USDC</p>
                <p className="text-white font-medium">${perpUSDC.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">Total USDC</p>
                <p className="text-white font-bold text-lg">${totalUSDC.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm mb-1">Portfolio Allocation</p>
                <p className="text-blue-400 font-bold text-lg">
                  {(totalPortfolioValue && totalPortfolioValue > 0) ? ((totalUSDC / totalPortfolioValue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            {/* Allocation Breakdown */}
            <div className="pt-3 border-t border-blue-500/20">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-dark-400">
                    Spot: <span className="text-white font-medium">{totalUSDC > 0 ? ((spotUSDC / totalUSDC) * 100).toFixed(1) : 0}%</span>
                  </span>
                  <span className="text-dark-400">
                    Perp: <span className="text-white font-medium">{totalUSDC > 0 ? ((perpUSDC / totalUSDC) * 100).toFixed(1) : 0}%</span>
                  </span>
                </div>
                <span className="text-dark-500 text-xs">Internal Allocation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default USDCReservesCard;
