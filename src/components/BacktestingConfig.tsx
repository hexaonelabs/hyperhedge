import React, { useState } from "react";
import { Settings, DollarSign, Calendar, Percent, RotateCcw } from "lucide-react";

interface BacktestingConfigProps {
  initialAmount: number;
  onInitialAmountChange: (amount: number) => void;
  onReset: () => void;
  selectedTokensCount: number;
}

const BacktestingConfig: React.FC<BacktestingConfigProps> = ({
  initialAmount,
  onInitialAmountChange,
  onReset,
  selectedTokensCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempAmount, setTempAmount] = useState(initialAmount.toString());

  const handleAmountSubmit = () => {
    const newAmount = parseFloat(tempAmount);
    if (!isNaN(newAmount) && newAmount > 0) {
      onInitialAmountChange(newAmount);
    } else {
      setTempAmount(initialAmount.toString());
    }
  };

  const presetAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <div className="bg-dark-800 rounded-lg p-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-white">
            Backtesting Configuration
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-300">
          <span>${initialAmount.toLocaleString('en-US')}</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Montant initial */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Initial Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tempAmount}
                onChange={(e) => setTempAmount(e.target.value)}
                onBlur={handleAmountSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleAmountSubmit()}
                className="flex-1 bg-dark-700 border border-dark-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                placeholder="Amount in USD"
                min="1"
                step="100"
              />
              <button
                onClick={handleAmountSubmit}
                className="px-3 py-2 bg-primary-600 text-black rounded text-sm hover:bg-primary-700 transition-colors"
              >
                Apply
              </button>
            </div>
            
            {/* Montants prédéfinis */}
            <div className="flex flex-wrap gap-2 mt-2">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setTempAmount(amount.toString());
                    onInitialAmountChange(amount);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    initialAmount === amount
                      ? 'bg-primary-600 text-black'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  ${amount.toLocaleString('en-US')}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation par token */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <Percent className="w-4 h-4 inline mr-1" />
              Allocation per Token
            </label>
            <div className="bg-dark-700 rounded px-3 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-300">
                  {selectedTokensCount} token(s) selected
                </span>
                <span className="text-white font-medium">
                  ${selectedTokensCount > 0 
                    ? (initialAmount / selectedTokensCount).toLocaleString('en-US', { maximumFractionDigits: 0 })
                    : '0'
                  } each
                </span>
              </div>
              {selectedTokensCount > 0 && (
                <div className="text-xs text-dark-400 mt-1">
                  Equal distribution: {(100 / selectedTokensCount).toFixed(1)}% per token
                </div>
              )}
            </div>
          </div>

          {/* Période de backtesting */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Backtesting Period
            </label>
            <div className="bg-dark-700 rounded px-3 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-300">Period</span>
                <span className="text-white font-medium">Last 21 days</span>
              </div>
              <div className="text-xs text-dark-400 mt-1">
                Based on available historical funding rates
              </div>
            </div>
          </div>

          {/* Bouton de reset */}
          <div className="pt-2 border-t border-dark-700">
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 text-dark-300 rounded text-sm hover:bg-dark-600 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestingConfig;