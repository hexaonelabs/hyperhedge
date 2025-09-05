import React from "react";
import { DollarSign } from "lucide-react";

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

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">USDC Reserves</h3>
            <span className="text-sm text-dark-400">Cash Position</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
          STABLE
        </span>
      </div>

      {/* USDC Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-dark-400 text-sm mb-1">Spot USDC</p>
          <p className="text-white font-medium">${spotUSDC.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-dark-400 text-sm mb-1">Perp USDC</p>
          <p className="text-white font-medium">${perpUSDC.toFixed(2)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-dark-400 text-sm mb-1">Total USDC</p>
          <p className="text-white font-bold text-lg">${totalUSDC.toFixed(2)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-dark-400 text-sm mb-1">Portfolio Allocation</p>
          <p className="text-blue-400 font-bold text-lg">
            {(totalPortfolioValue && totalPortfolioValue > 0) ? ((totalUSDC / totalPortfolioValue) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Allocation Breakdown */}
      <div className="pt-4 border-t border-dark-600">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Spot Allocation</span>
            <span className="text-white">{totalUSDC > 0 ? ((spotUSDC / totalUSDC) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Perp Allocation</span>
            <span className="text-white">{totalUSDC > 0 ? ((perpUSDC / totalUSDC) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default USDCReservesCard;
