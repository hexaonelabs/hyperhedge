import React, { useState, useMemo } from "react";
import {
  X,
  TrendingDown,
  Shield,
  Calculator,
  AlertTriangle,
  DollarSign,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { FundingRate, HedgeCalculation } from "../types";
import { openHedgePosition } from "../services/hl-api.sevice";
import { useWallet } from "../hooks/useWallet";
import { useNotification } from "../hooks/useNotification";
import { useHyperliquidConfig } from "../hooks/useHyperliquidConfig";

interface HedgeFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMarket: FundingRate | null;
}

const HedgeForm: React.FC<HedgeFormProps> = ({
  isOpen,
  onClose,
  selectedMarket,
}) => {
  const [hedgeValue, setHedgeValue] = useState<string>("1000");
  const [leverage, setLeverage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiquidationAnalysisOpen, setIsLiquidationAnalysisOpen] = useState(false);
  const { address, isConnected } = useWallet();
  const { showLoading, showSuccess, showError } = useNotification();
  const { config } = useHyperliquidConfig();

  const calculations = useMemo((): HedgeCalculation => {
    const hedgeAmount = parseFloat(hedgeValue) || 0;
    const currentPrice = selectedMarket?.markPrice || 0;

    // Répartition: Spot + Short
    // Spot = une partie du hedge value
    // Short = le reste avec levier pour couvrir la même valeur
    const spotAmount = hedgeAmount * (leverage / (leverage + 1));
    const shortMargin = hedgeAmount - spotAmount;
    const shortNotional = shortMargin * leverage;

    // Taille de la position short en tokens
    const positionSize = shortNotional / currentPrice;

    // Prix de liquidation approximatif (simplifié)
    // Pour une position short, liquidation = prix d'entrée * (1 + 1/leverage * 0.9)
    const liquidationPrice = currentPrice * (1 + (1 / leverage) * 0.9);

    // Rendement annualisé basé sur le funding rate
    const fundingRate = selectedMarket?.fundingRate || 0;
    const annualizedReturn = fundingRate * 24 * 365 * 100; // 24 fois par jour (toutes les heures), 365 jours

    return {
      hedgeValue: hedgeAmount,
      leverage,
      spotAmount,
      shortMargin,
      shortNotional,
      liquidationPrice,
      positionSize,
      annualizedReturn,
    };
  }, [hedgeValue, leverage, selectedMarket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!config) {
      showError("Configuration is not set");
      return;
    }

    if (!isConnected) {
      showError("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    showLoading();

    try {
      console.log("Creating hedge position:", {
        market: selectedMarket?.symbol,
        calculations,
      });

      const result = await openHedgePosition(
        address as `0x${string}`,
        config.apiWalletPrivateKey as `0x${string}`,
        {
          calculations,
          marketAsset: selectedMarket?.symbol || "",
          subAccountAddress: config?.subAccountAddress as `0x${string}` || undefined,
        },
        config.isTestnet || false
      );

      // Analyser la réponse pour déterminer le statut des ordres
      const orders = [];

      // Vérifier l'ordre spot
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spotStatus = result.spotOrder?.response.data.statuses?.[0] as any;
      if (spotStatus) {
        orders.push({
          oid: spotStatus?.filled?.oid || spotStatus?.resting?.oid,
          // check if object has `filled` property existing
          filled: Object.keys(spotStatus).includes("filled") ? true : false,
          type: "spot" as const,
        });
      }

      // Vérifier l'ordre perp
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const perpsOrder = result.perpsOrder?.response.data.statuses?.[0] as any;
      if (perpsOrder) {
        orders.push({
          oid: perpsOrder?.filled?.oid || perpsOrder?.resting?.oid || "N/A",
          filled: Object.keys(perpsOrder).includes("filled") ? true : false,
          type: "perp" as const,
        });
      }

      // Vérifier si tous les ordres ont des OIDs
      const hasAllOrders = orders.length === 2;

      if (hasAllOrders) {
        showSuccess(
          orders,
          "Hedge position created successfully! You can now close this window."
        );
        // close modal
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error("Some orders failed to execute properly");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error creating hedge position:", error);

      // Messages d'erreur spécifiques
      let errorMessage = "Failed to create hedge position";

      if (error.message?.includes("insufficient")) {
        errorMessage = "Insufficient balance for this hedge amount";
      } else if (error.message?.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again";
      } else if (error.message?.includes("signature")) {
        errorMessage = "Transaction signature failed. Please try again";
      } else if (error.message?.includes("liquidation")) {
        errorMessage = "Leverage too high for current market conditions";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !selectedMarket) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-dark-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600/20 rounded-lg">
                <Shield className="text-primary-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Create Hedge Position
                </h2>
                <p className="text-dark-300">for {selectedMarket.symbol}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <X className="text-dark-400" size={20} />
            </button>
          </div>

          {/* Market Info */}
          <div className="p-6 bg-dark-800/50 border-b border-dark-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-dark-400 text-sm">Mark Price</div>
                <div className="text-white font-semibold text-lg">
                  ${selectedMarket.markPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-dark-400 text-sm">Funding Rate (1h)</div>
                <div
                  className={`font-semibold text-lg ${
                    selectedMarket.fundingRate >= 0
                      ? "text-success-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedMarket.fundingRate >= 0 ? "+" : ""}
                  {(selectedMarket.fundingRate * 100).toFixed(4)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-dark-400 text-sm">Annualized Return</div>
                <div
                  className={`font-semibold text-lg ${
                    calculations.annualizedReturn >= 0
                      ? "text-success-400"
                      : "text-red-400"
                  }`}
                >
                  {calculations.annualizedReturn >= 0 ? "+" : ""}
                  {calculations.annualizedReturn.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Hedge Value Input */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Total Hedge Amount (USD)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400"
                  size={18}
                />
                <input
                  type="number"
                  value={hedgeValue}
                  onChange={(e) => setHedgeValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1000"
                  min="1"
                  step="1"
                />
              </div>
              <div className="mt-2 p-2 bg-dark-900/50 rounded text-xs text-dark-300">
                <strong>Strategy:</strong> This amount will be split into spot
                purchase + short margin to create a market-neutral hedge
              </div>
            </div>

            {/* Leverage Slider */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Leverage: {leverage}x
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-dark-400">
                  <span>1x (Safe)</span>
                  <span>25x</span>
                  <span>50x (Risky)</span>
                </div>
              </div>
              <p className="text-xs text-dark-400 mt-1">
                Higher leverage reduces margin but increases liquidation risk
              </p>
            </div>

            {/* Calculations Display */}
            <div className="bg-dark-800/50 rounded-lg p-4 space-y-6">
              <div className="flex items-center gap-2 text-primary-400 font-medium">
                <Calculator size={16} />
                Hedge Strategy Breakdown
              </div>

              {/* Strategy Explanation */}
              <div className="bg-gradient-to-r from-primary-600/10 to-success-600/10 border border-primary-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="text-primary-400" size={18} />
                  <span className="text-white font-medium">
                    What will happen:
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-success-500/20 rounded-full flex items-center justify-center text-success-400 font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-success-400 font-medium">
                        Buy Spot
                      </div>
                      <div className="text-dark-300">
                        $
                        {calculations.spotAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold">
                      2
                    </div>
                    <div>
                      <div className="text-red-400 font-medium">Open Short</div>
                      <div className="text-dark-300">
                        $
                        {calculations.shortNotional.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ($
                        {calculations.shortMargin.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        margin)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-dark-900/50 rounded text-xs text-dark-300">
                  <strong>Result:</strong> Price movements cancel out, you earn
                  funding fees on the short position
                </div>
              </div>

              {/* Detailed Calculations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-900/50 rounded-lg p-3 border-l-4 border-success-500">
                  <div className="text-success-400 text-sm font-medium mb-1">
                    💰 Spot Purchase
                  </div>
                  <div className="text-white font-semibold text-lg">
                    $
                    {calculations.spotAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-dark-400 mt-1">
                    {(
                      (calculations.spotAmount / calculations.hedgeValue) *
                      100
                    ).toFixed(1)}
                    % of total hedge value
                  </div>
                  <div className="text-xs text-success-300 mt-1">
                    ≈{" "}
                    {(
                      calculations.spotAmount / (selectedMarket?.markPrice || 1)
                    ).toFixed(4)}{" "}
                    {selectedMarket.symbol.replace("-USD", "")}
                  </div>
                </div>

                <div className="bg-dark-900/50 rounded-lg p-3 border-l-4 border-red-500">
                  <div className="text-red-400 text-sm font-medium mb-1">
                    📉 Short Position
                  </div>
                  <div className="text-white font-semibold text-lg">
                    $
                    {calculations.shortMargin.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-dark-400 mt-1">
                    Margin required ({leverage}x leverage)
                  </div>
                  <div className="text-xs text-red-300 mt-1">
                    Controls $
                    {calculations.shortNotional.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    notional
                  </div>
                </div>

                <div className="bg-dark-900/50 rounded-lg p-3">
                  <div className="text-dark-400 text-sm">
                    Short Position Size
                  </div>
                  <div className="text-white font-semibold">
                    {calculations.positionSize.toFixed(6)}{" "}
                    {selectedMarket.symbol.replace("-USD", "")}
                  </div>
                  <div className="text-xs text-dark-400">Tokens to short</div>
                </div>

                <div className="bg-dark-900/50 rounded-lg p-3">
                  <div className="text-dark-400 text-sm">Liquidation Price</div>
                  <div className="text-red-400 font-semibold">
                    $
                    {calculations.liquidationPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-dark-400">
                    Short position risk level
                  </div>
                </div>
              </div>

<div className="border border-red-500/20 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsLiquidationAnalysisOpen(!isLiquidationAnalysisOpen)}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/15 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-400" size={16} />
                    <span className="text-red-400 font-medium text-sm">
                      Liquidation Cost Analysis
                    </span>
                  </div>
                  {isLiquidationAnalysisOpen ? (
                    <ChevronUp className="text-red-400" size={16} />
                  ) : (
                    <ChevronDown className="text-red-400" size={16} />
                  )}
                </button>
                
                {isLiquidationAnalysisOpen && (
                  <div className="p-4 bg-red-500/5 border-t border-red-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-red-400 text-sm">
                          Short Margin Lost
                        </div>
                        <div className="text-red-300 font-semibold text-lg">
                          -$
                          {calculations.shortMargin.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-dark-400 mt-1">
                          100% of margin
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-success-400 text-sm">
                          Spot Value at Liquidation
                        </div>
                        <div className="text-success-300 font-semibold text-lg">
                          $
                          {((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-dark-400 mt-1">
                          Initial: $
                          {calculations.spotAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-success-400 text-sm">
                          Spot Gain
                        </div>
                        <div className="text-success-300 font-semibold text-lg">
                          +$
                          {(((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-success-300 mt-1">
                          {(((calculations.liquidationPrice - selectedMarket.markPrice) / selectedMarket.markPrice) * 100).toFixed(1)}% gain
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 text-sm">
                          Net Loss
                        </div>
                        <div className={`font-bold text-lg ${
                          (calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)) > 0 
                            ? "text-red-400" 
                            : "text-success-400"
                        }`}>
                          {(calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)) > 0 ? "-" : "+"}$
                          {Math.abs(calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-red-300 mt-1">
                          {(Math.abs(calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)) / calculations.hedgeValue * 100).toFixed(1)}% of hedge
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-dark-900/50 rounded text-xs text-dark-300">
                      <strong>Scenario:</strong> If liquidated at $
                      {calculations.liquidationPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      , you lose the short margin ($
                      {calculations.shortMargin.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}) but your spot position gains $
                      {(((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} from the price increase. This results in a net loss of $
                      {Math.abs(calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}.
                    </div>
                  </div>
                )}
              </div>

              {/* <div className="md:col-span-2">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="text-red-400" size={16} />
                      <span className="text-red-400 font-medium text-sm">
                        Liquidation Cost Analysis
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-red-400 text-sm">
                          Short Margin Lost
                        </div>
                        <div className="text-red-300 font-semibold text-lg">
                          -$
                          {calculations.shortMargin.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-dark-400 mt-1">
                          100% of margin
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-success-400 text-sm">
                          Spot Value at Liquidation
                        </div>
                        <div className="text-success-300 font-semibold text-lg">
                          $
                          {((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-dark-400 mt-1">
                          Initial: $
                          {calculations.spotAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-success-400 text-sm">
                          Spot Gain
                        </div>
                        <div className="text-success-300 font-semibold text-lg">
                          +$
                          {(((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-success-300 mt-1">
                          {(((calculations.liquidationPrice - selectedMarket.markPrice) / selectedMarket.markPrice) * 100).toFixed(1)}% gain
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 text-sm">
                          Net Loss
                        </div>
                        <div className={`font-bold text-lg ${
                          (calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)) > 0 
                            ? "text-red-400" 
                            : "text-success-400"
                        }`}>
                          {(calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)) > 0 ? "-" : "+"}$
                          {Math.abs(calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-red-300 mt-1">
                          {(Math.abs(calculations.shortMargin - (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount)) / calculations.hedgeValue * 100).toFixed(1)}% of hedge
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-dark-900/50 rounded text-xs text-dark-300">
                      <strong>Scenario:</strong> If liquidated at $
                      {calculations.liquidationPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      , you lose the short margin ($
                      {calculations.shortMargin.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}) but your spot position gains $
                      {(((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} from the price increase. This will result in a net lost of $
                      {(
                        (((calculations.spotAmount / selectedMarket.markPrice) * calculations.liquidationPrice) - calculations.spotAmount) -
                        calculations.shortMargin
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}.
                    </div>
                  </div>
                </div> */}

              {/* Return Calculation */}
              <div className="bg-gradient-to-r from-success-600/10 to-primary-600/10 border border-success-500/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-dark-400 text-sm">
                      Expected Annual Return
                    </div>
                    <div
                      className={`font-bold text-2xl ${
                        calculations.annualizedReturn >= 0
                          ? "text-success-400"
                          : "text-red-400"
                      }`}
                    >
                      {calculations.annualizedReturn >= 0 ? "+" : ""}
                      {calculations.annualizedReturn.toFixed(2)}%
                    </div>
                    <div className="text-xs text-dark-400 mt-1">
                      Based on current funding rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-dark-400 text-sm">
                      Amount After 1 Year
                    </div>
                    <div className="text-white font-bold text-2xl">
                      $
                      {(
                        calculations.hedgeValue *
                        (1 + calculations.annualizedReturn / 100)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-success-300 mt-1">
                      +$
                      {(
                        (calculations.hedgeValue *
                          calculations.annualizedReturn) /
                        100
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      profit
                    </div>
                  </div>
                </div>
                <div className="text-xs text-dark-400 mt-3 text-center">
                  Applied to short notional value • Assumes constant funding
                  rate
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="text-yellow-400 flex-shrink-0 mt-0.5"
                  size={18}
                />
                <div>
                  <div className="text-yellow-400 font-medium text-sm">
                    Strategy Risks
                  </div>
                  <div className="text-yellow-300/80 text-xs mt-1">
                    • <strong>Liquidation risk:</strong> Short position can be
                    liquidated if price rises too much
                    <br />• <strong>Funding rate changes:</strong> Rates can
                    turn negative, reducing returns
                    <br />• <strong>Imperfect hedge:</strong> Small price
                    differences between spot and perpetual
                    <br />• <strong>Capital efficiency:</strong> Higher leverage
                    = higher returns but higher risk
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-black rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Position...
                  </>
                ) : (
                  <>
                    <TrendingDown size={18} />
                    Create Hedge Position
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default HedgeForm;
