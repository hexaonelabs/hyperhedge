import React from "react";
import { X, AlertCircle, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { PositionAdjustment } from "../utils/hedgeCalculations";

interface ConfirmationModalProps {
  isOpen: boolean;
  adjustments: PositionAdjustment[];
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  adjustments,
  isSubmitting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* En-tête de la modal */}
        <div className="flex-shrink-0 p-6 border-b border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Confirm Strategy Update
                </h3>
                <p className="text-dark-400 text-sm mt-1">
                  Review the following adjustments before execution
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-dark-400" />
            </button>
          </div>
        </div>

        {/* Contenu de la modal */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            <div className="space-y-4">
            {adjustments.map((adjustment, index) => (
              <div
                key={`${adjustment.symbol}-${index}`}
                className="bg-dark-800 border border-dark-700 rounded-lg p-3"
              >
                {/* En-tête de l'ajustement */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold text-white">
                      {adjustment.symbol}
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                      adjustment.adjustmentType === 'increase' 
                        ? 'bg-green-500/20 text-green-400'
                        : adjustment.adjustmentType === 'decrease'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {adjustment.adjustmentType.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Détails des positions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Position Spot */}
                  {adjustment.spotAdjustment !== 0 && (
                    <div className="bg-dark-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-primary-400">
                          Spot Position
                        </div>
                        {adjustment.spotAdjustment > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {/* <div className="flex items-center justify-between">
                          <span className="text-dark-400 text-sm">Current:</span>
                          <span className="text-white text-sm">
                            {adjustment.currentSpotBalance.toFixed(4)}
                          </span>
                        </div> */}
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400 text-sm">Target Size:</span>
                          <span className="text-white text-sm">
                            {adjustment.targetSpotBalance.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-700">
                          <span className="text-dark-400 text-sm">Adjustment Size:</span>
                          <span className={`font-medium text-sm ${
                            adjustment.spotAdjustment > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {adjustment.spotAdjustment > 0 ? '+' : ''}
                            {adjustment.spotAdjustment.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Position Perp */}
                  {adjustment.perpAdjustment !== 0 && (
                    <div className="bg-dark-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-orange-400">
                          Perp Position
                        </div>
                        {adjustment.perpAdjustment > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {/* <div className="flex items-center justify-between">
                          <span className="text-dark-400 text-sm">Current:</span>
                          <span className="text-white text-sm">
                            {adjustment.currentPerpPosition.toFixed(4)}
                          </span>
                        </div> */}
                        <div className="flex items-center justify-between">
                          <span className="text-dark-400 text-sm">Target Size:</span>
                          <span className="text-white text-sm">
                            {adjustment.targetPerpPosition.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-700">
                          <span className="text-dark-400 text-sm">Adjustment Size:</span>
                          <span className={`font-medium text-sm ${
                            adjustment.perpAdjustment > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {adjustment.perpAdjustment > 0 ? '+' : ''}
                            {adjustment.perpAdjustment.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations additionnelles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {/* <div className="bg-dark-900 rounded p-2">
                    <div className="text-dark-400 text-xs mb-1">Current Value</div>
                    <div className="text-white font-medium">
                      ${adjustment.currentValueUSD.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-dark-900 rounded p-2">
                    <div className="text-dark-400 text-xs mb-1">Target Value</div>
                    <div className="text-white font-medium">
                      ${adjustment.targetValueUSD.toFixed(2)}
                    </div>
                  </div> */}
                  {adjustment.targetPerpLeverage > 0 && (
                    <div className="bg-dark-900 rounded p-2">
                      <div className="text-dark-400 text-xs mb-1">Target Leverage</div>
                      <div className="text-white font-medium">
                        {adjustment.targetPerpLeverage.toFixed(1)}x
                      </div>
                    </div>
                  )}
                  {adjustment.liquidationPrice > 0 && (
                    <div className="bg-dark-900 rounded p-2">
                      <div className="text-dark-400 text-xs mb-1">Liq. Price</div>
                      <div className="text-white font-medium">
                        ${adjustment.liquidationPrice.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Actions de la modal */}
        <div className="flex-shrink-0 p-6 border-t border-dark-700 bg-dark-900">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-sm text-dark-400">
              {adjustments.length} position{adjustments.length > 1 ? 's' : ''} will be adjusted
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-dark-600 hover:border-dark-500 text-dark-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Execute Adjustments
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};