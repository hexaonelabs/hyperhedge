import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Save,
  X,
  AlertCircle,
  Activity,
} from "lucide-react";
import HedgedPositionCard from "./HedgedPositionCard";
import UnhedgedPositionCard from "./UnhedgedPositionCard";
import USDCReservesCard from "./USDCReservesCard";
import { HedgePositionSummary } from "../types";
import * as hl from "@nktkas/hyperliquid";

// interface UnhedgedPosition {
//   symbol: string;
//   balance: number;
//   valueUSD: number;
//   type: "spot" | "perp";
//   perpPosition?: number;
//   leverage?: number;
//   margin?: number;
// }

interface PositionsWidgetProps {
  hedgePositions: HedgePositionSummary[] | null;
  spotClearinghouseState: hl.SpotClearinghouseState | null;
  clearinghouseState: hl.PerpsClearinghouseState | null;
  totalAccountValueUSD: number;
  isWatchMode: boolean;
}

export const PositionsWidget: React.FC<PositionsWidgetProps> = ({
  hedgePositions,
  spotClearinghouseState,
  clearinghouseState,
  totalAccountValueUSD,
  isWatchMode,
}) => {
  // State pour gérer les changements d'allocation
  const [allocationChanges, setAllocationChanges] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  // Calculer les réserves USDC
  const usdcReserves = useMemo(() => {
    const spotUSDC =
      spotClearinghouseState?.balances.find((b) => b.coin === "USDC")?.total || "0";
    const perpUSDC = clearinghouseState?.marginSummary.accountValue || "0";

    return {
      spotUSDC: Number(spotUSDC),
      perpUSDC:
        Number(perpUSDC) -
        (hedgePositions?.reduce((sum, pos) => sum + pos.margin, 0) || 0),
    };
  }, [spotClearinghouseState, clearinghouseState, hedgePositions]);

  // Séparer les positions hedge et non-hedge
  const { hedgedPositions, unhedgedPositions } = useMemo(() => {
    if (!spotClearinghouseState || !clearinghouseState) {
      return { hedgedPositions: [], unhedgedPositions: [] };
    }

    const spotPositions = spotClearinghouseState.balances.filter(
      (b) => b.coin !== "USDC" && Number(b.total) > 0
    );
    const perpPositions = clearinghouseState.assetPositions.filter(
      (p) => Number(p.position.szi) !== 0
    );

    const hedgedSymbols = hedgePositions?.map((hp) => hp.symbol) || [];

    // Positions spot non hedgées
    const unhedgedSpot = spotPositions
      .filter((spot) => !hedgedSymbols.includes(spot.coin))
      .map((spot) => ({
        symbol: spot.coin,
        balance: Number(spot.total),
        valueUSD: Number(spot.total) * 1, // Vous pourriez avoir besoin de calculer le prix réel ici
        type: "spot" as const,
      }));

    // Positions perp non hedgées
    const unhedgedPerp = perpPositions
      .filter((perp) => !hedgedSymbols.includes(perp.position.coin))
      .map((perp) => ({
        symbol: perp.position.coin,
        balance: Number(perp.position.szi),
        valueUSD: Number(perp.position.positionValue),
        type: "perp" as const,
        perpPosition: Number(perp.position.szi),
        leverage: Number(perp.position.leverage?.value || 1),
        margin: Number(perp.position.marginUsed),
      }));

    return {
      hedgedPositions: hedgePositions || [],
      unhedgedPositions: [...unhedgedSpot, ...unhedgedPerp],
    };
  }, [spotClearinghouseState, clearinghouseState, hedgePositions]);

  // Fonction utilitaire pour obtenir la valeur d'une position
  const getPositionValue = (position: { valueUSD?: number; margin?: number }): number => {
    return position.valueUSD || position.margin || 0;
  };

  // Gérer les changements d'allocation
  const handleAllocationChange = (symbol: string, percentage: number) => {
    if (isResetting) return;

    console.log(`Allocation change for ${symbol}: ${percentage}%`);

    // Trouver la position et calculer l'allocation initiale
    const position =
      hedgedPositions.find((p) => p.symbol === symbol) ||
      unhedgedPositions.find((p) => p.symbol === symbol);

    const positionValue = position ? getPositionValue(position) : 0;
    const initialAllocation =
      totalAccountValueUSD > 0 ? (positionValue / totalAccountValueUSD) * 100 : 0;

    // Mettre à jour les changements
    const newChanges = { ...allocationChanges, [symbol]: percentage };
    setAllocationChanges(newChanges);

    // Vérifier si une allocation diffère de l'initiale
    const hasChanges = Math.abs(percentage - initialAllocation) > 1; // Seuil de 1%
    setHasUnsavedChanges(hasChanges);
  };

  // Calculer l'allocation totale pour les positions uniquement (excluant les réserves USDC)
  const getTotalPositionsAllocation = () => {
    if (totalAccountValueUSD <= 0) return 0;

    let totalAllocated = 0;

    // Positions hedgées
    hedgedPositions.forEach((position) => {
      const symbol = position.symbol;
      const currentAlloc = allocationChanges[symbol];

      if (currentAlloc !== undefined) {
        totalAllocated += currentAlloc;
      } else {
        const positionValue =
          position.margin +
          position.spotBalance *
            (position.perpValueUSD / Math.abs(position.perpPosition) || 0);
        const currentAllocation = (positionValue / totalAccountValueUSD) * 100;
        totalAllocated += currentAllocation;
      }
    });

    // Positions non hedgées
    unhedgedPositions.forEach((position) => {
      const symbol = position.symbol;
      const currentAlloc = allocationChanges[symbol];

      if (currentAlloc !== undefined) {
        totalAllocated += currentAlloc;
      } else {
        const positionValue = position.valueUSD;
        const currentAllocation = (positionValue / totalAccountValueUSD) * 100;
        totalAllocated += currentAllocation;
      }
    });

    return totalAllocated;
  };

  // Calculer la valeur totale du portefeuille
  const getTotalPortfolioValue = () => {
    if (totalAccountValueUSD <= 0) return 0;
    return totalAccountValueUSD;
  };

  const totalAllocation = getTotalPositionsAllocation();
  const isOverAllocated = totalAllocation > 100;

  // Mettre à jour la stratégie
  const handleUpdateStrategy = async () => {
    console.log("Updating strategy with changes:", allocationChanges);
    // Ici vous implémenteriez les appels API réels pour mettre à jour les positions
    // Pour l'instant, on remet juste à zéro les changements
    setAllocationChanges({});
    setHasUnsavedChanges(false);
    // Vous pourriez afficher une notification de succès ici
  };

  // Annuler les changements
  const handleCancelChanges = () => {
    setIsResetting(true);
    setAllocationChanges({});
    setHasUnsavedChanges(false);
    setResetTrigger((prev) => prev + 1);

    // Remettre le flag après un court délai pour permettre aux composants de se mettre à jour
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className={`bg-dark-900 border border-dark-800 rounded-xl p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Positions Management
              </h3>
            </div>
            <p className="text-dark-400 text-sm">
              Manage your open positions effectively.
            </p>
          </div>

          {/* Total Allocation Indicator */}
          <div className="lg:text-right">
            <div className="flex items-center gap-2 mb-1 justify-start lg:justify-end">
              <span className="text-dark-400 text-sm">
                Positions Allocation:
              </span>
              <span
                className={`font-bold text-lg ${
                  isOverAllocated
                    ? "text-red-400"
                    : totalAllocation > 98.5
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {totalAllocation.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-dark-500 mb-2 text-left lg:text-right">
              Hedged + Unhedged positions only
            </div>
            <div
              className={`w-full lg:w-32 h-2 bg-dark-600 rounded-full overflow-hidden lg:ml-auto`}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  isOverAllocated
                    ? "bg-red-500"
                    : totalAllocation > 98.5
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(totalAllocation, 100)}%` }}
              />
              {isOverAllocated && (
                <div
                  className="h-full bg-red-600 opacity-50"
                  style={{
                    width: `${totalAllocation - 100}%`,
                    marginLeft: "100%",
                    marginTop: "-8px",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* USDC Reserves */}
        <USDCReservesCard
          spotUSDC={usdcReserves.spotUSDC}
          perpUSDC={usdcReserves.perpUSDC}
          totalPortfolioValue={getTotalPortfolioValue()}
        />

        {/* Strategy Changes Notification - Only show if not in watch mode */}
        {hasUnsavedChanges && !isWatchMode && (
          <div
            className={`mt-6 ${
              isOverAllocated
                ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20"
                : "bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20"
            } border rounded-xl p-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 ${
                    isOverAllocated ? "bg-red-500/20" : "bg-orange-500/20"
                  } rounded-lg`}
                >
                  <AlertCircle
                    className={`w-5 h-5 ${
                      isOverAllocated ? "text-red-400" : "text-orange-400"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">
                    {isOverAllocated
                      ? "Invalid Allocation"
                      : "Strategy Changes Detected"}
                  </h4>
                  {isOverAllocated ? (
                    <p className="text-red-200 text-sm">
                      Positions allocation ({totalAllocation.toFixed(1)}%)
                      exceeds 100%. Please adjust your positions.
                    </p>
                  ) : (
                    <p className="text-orange-200 text-sm">
                      You have modified your portfolio allocation. Review and
                      apply changes below.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelChanges}
                  className="px-4 py-2 text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500/50 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStrategy}
                  disabled={isOverAllocated}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isOverAllocated
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Update Strategy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          {/* Hedged Positions */}
          {hedgedPositions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Hedged Positions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {hedgedPositions.map((position, index) => (
                  <HedgedPositionCard
                    key={`hedged-${position.symbol}-${index}`}
                    position={position}
                    totalPortfolioValue={totalAccountValueUSD}
                    onAllocationChange={handleAllocationChange}
                    currentAllocation={allocationChanges[position.symbol]}
                    resetTrigger={resetTrigger}
                    totalAllocation={totalAllocation}
                    disabled={isWatchMode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-8">
          {/* Unhedged Positions */}
          {unhedgedPositions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Unhedged Positions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {unhedgedPositions.map((position, index) => (
                  <UnhedgedPositionCard
                    key={`unhedged-${position.symbol}-${index}`}
                    symbol={position.symbol}
                    balance={position.balance}
                    valueUSD={position.valueUSD}
                    type={position.type}
                    totalPortfolioValue={totalAccountValueUSD}
                    onAllocationChange={handleAllocationChange}
                    currentAllocation={allocationChanges[position.symbol]}
                    resetTrigger={resetTrigger}
                    totalAllocation={totalAllocation}
                    disabled={isWatchMode}
                    perpPosition={
                      "perpPosition" in position
                        ? position.perpPosition
                        : undefined
                    }
                    leverage={
                      "leverage" in position ? position.leverage : undefined
                    }
                    margin={
                      "margin" in position ? position.margin : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {hedgedPositions.length === 0 && unhedgedPositions.length === 0 && (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-12 text-center">
            <Activity className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-400 mb-2">
              No Positions Yet
            </h3>
            <p className="text-dark-500 mb-6">
              You don't have any open positions at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
