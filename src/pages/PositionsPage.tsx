import React from "react";
import {
  TrendingUp,
  PieChart,
  Activity,
  DollarSign,
  BarChart3,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { useHyperliquidConfig } from "../hooks/useHyperliquidConfig";
import FundingsChart from "../components/FundingsChart";
import { useHyperliquidProcessedData } from "../hooks/useHyperliquidProcessedData";
import PortfolioChart from "../components/PortfolioChat";
import { useWallet } from "../hooks/useWallet";
import HedgedPositionCard from "../components/HedgedPositionCard";
import UnhedgedPositionCard from "../components/UnhedgedPositionCard";
import USDCReservesCard from "../components/USDCReservesCard";

const PositionsPage: React.FC = () => {
  const { address, openConnectModal } = useWallet();
  const {
    accountFundingHistory,
    hedgePositions,
    isLoading: loading,
    totalAccountValueUSD,
    accountPnl,
    raw: { portfolioMetrics, spotClearinghouseState, clearinghouseState },
  } = useHyperliquidProcessedData();
  const { config } = useHyperliquidConfig();
  const addressToCheck = (config?.subAccountAddress ||
    address) as `0x${string}`;

  const portfolioData = React.useMemo(() => {
    if (!portfolioMetrics?.[3]?.[1]) return [];

    return portfolioMetrics[3][1].accountValueHistory.map((item) => ({
      time: item[0],
      portfolioValue: Number(item[1]),
    }));
  }, [portfolioMetrics]);

  // Process USDC reserves
  const usdcReserves = React.useMemo(() => {
    const spotUSDC =
      spotClearinghouseState?.balances.find((b) => b.coin === "USDC")?.total ||
      "0";
    const perpUSDC = clearinghouseState?.marginSummary.accountValue || "0";

    return {
      spotUSDC: Number(spotUSDC),
      perpUSDC:
        Number(perpUSDC) -
        (hedgePositions?.reduce((sum, pos) => sum + pos.margin, 0) || 0),
    };
  }, [spotClearinghouseState, clearinghouseState, hedgePositions]);

  // Separate hedged and unhedged positions
  const { hedgedPositions, unhedgedPositions } = React.useMemo(() => {
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

    // Unhedged spot positions
    const unhedgedSpot = spotPositions
      .filter((spot) => !hedgedSymbols.includes(spot.coin))
      .map((spot) => ({
        symbol: spot.coin,
        balance: Number(spot.total),
        valueUSD: Number(spot.total) * 1, // You might need to calculate actual price here
        type: "spot" as const,
      }));

    // Unhedged perp positions
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

  // Handle allocation changes and track modifications
  const [allocationChanges, setAllocationChanges] = React.useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [resetTrigger, setResetTrigger] = React.useState(0); // Trigger to force reset
  const [isResetting, setIsResetting] = React.useState(false); // Flag to prevent updates during reset

  const getPositionValue = (position: {valueUSD?: number; margin?: number}): number => {
    return position.valueUSD || position.margin || 0;
  };

  const handleAllocationChange = (symbol: string, percentage: number) => {
    // Don't process changes during reset
    if (isResetting) return;
    
    console.log(`Allocation change for ${symbol}: ${percentage}%`);
    
    // Find position and calculate initial allocation
    const position = hedgedPositions.find(p => p.symbol === symbol) || 
                    unhedgedPositions.find(p => p.symbol === symbol);
    
    const positionValue = position ? getPositionValue(position) : 0;
    const initialAllocation = totalAccountValueUSD > 0 ? (positionValue / totalAccountValueUSD * 100) : 0;
    
    // Update changes
    const newChanges = { ...allocationChanges, [symbol]: percentage };
    setAllocationChanges(newChanges);
    
    // Check if any allocation differs from initial
    const hasChanges = Math.abs(percentage - initialAllocation) > 1; // 1% threshold
    setHasUnsavedChanges(hasChanges);
  };

  // Calculate total allocation for positions only (excluding USDC reserves)
  const getTotalPositionsAllocation = () => {
    if (totalAccountValueUSD <= 0) return 0;
    
    let totalAllocated = 0;
    
    // Hedged positions
    hedgedPositions.forEach(position => {
      const symbol = position.symbol;
      const currentAlloc = allocationChanges[symbol];
      
      if (currentAlloc !== undefined) {
        // Use changed allocation
        totalAllocated += currentAlloc;
      } else {
        // Use current allocation based on position value
        const positionValue = position.margin + (position.spotBalance * (position.perpValueUSD / Math.abs(position.perpPosition) || 0));
        const currentAllocation = (positionValue / totalAccountValueUSD) * 100;
        totalAllocated += currentAllocation;
      }
    });
    
    // Unhedged positions
    unhedgedPositions.forEach(position => {
      const symbol = position.symbol;
      const currentAlloc = allocationChanges[symbol];
      
      if (currentAlloc !== undefined) {
        // Use changed allocation
        totalAllocated += currentAlloc;
      } else {
        // Use current allocation based on position value
        const positionValue = position.valueUSD;
        const currentAllocation = (positionValue / totalAccountValueUSD) * 100;
        totalAllocated += currentAllocation;
      }
    });
    
    return totalAllocated;
  };

  // Calculate total portfolio value including USDC reserves and all positions
  const getTotalPortfolioValue = () => {
    if (totalAccountValueUSD <= 0) return 0;
    return totalAccountValueUSD;
  };

  const totalAllocation = getTotalPositionsAllocation();
  const isOverAllocated = totalAllocation > 100;

  const handleUpdateStrategy = async () => {
    console.log('Updating strategy with changes:', allocationChanges);
    // Here you would implement the actual API calls to update positions
    // For now, just reset the changes
    setAllocationChanges({});
    setHasUnsavedChanges(false);
    // You could show a success notification here
  };

  const handleCancelChanges = () => {
    setIsResetting(true);
    setAllocationChanges({});
    setHasUnsavedChanges(false);
    setResetTrigger(prev => prev + 1); // Force reset of all sliders
    
    // Reset the flag after a short delay to allow components to update
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  };

  // Calculate statistics from positions
  const stats = React.useMemo(() => {
    if (!hedgePositions || hedgePositions.length === 0) {
      return {
        totalValue: 0,
        activePositions: 0,
        totalMargin: 0,
        averageLeverage: 0,
        pnl: 0,
      };
    }
    const totalValue = totalAccountValueUSD || 0;
    const totalMargin = hedgePositions.reduce(
      (sum, pos) => sum + pos.margin,
      0
    );
    const averageLeverage =
      hedgePositions.reduce((sum, pos) => sum + pos.leverage, 0) /
      hedgePositions.length;

    return {
      totalValue,
      activePositions: hedgePositions.length,
      totalMargin,
      averageLeverage,
      pnl: accountPnl,
    };
  }, [hedgePositions, totalAccountValueUSD, accountPnl]);

  if (!addressToCheck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-8 max-w-md text-center">
            <div className="p-4 bg-primary-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-dark-300 mb-6 leading-relaxed">
              To access your positions and fundings stats, connect your wallet
              and unlock all features.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-dark-400 text-sm">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                Real-time position tracking
              </div>
              <div className="flex items-center text-dark-400 text-sm">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                Advanced risk management
              </div>
              <div className="flex items-center text-dark-400 text-sm">
                <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                Detailed analytics
              </div>
            </div>
            <button
              onClick={() => openConnectModal()}
              className="w-full btn-primary font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Your Positions</h1>
          <p className="text-dark-300">
            Track and manage all your open positions across different markets.
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mb-4"></div>
            <p className="text-dark-300">Loading your positions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Your Positions</h1>
        <p className="text-dark-300">
          Track and manage all your open positions across different markets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <span className="text-dark-400 text-sm">USD</span>
          </div>
          <h3 className="text-white font-semibold">Total Value</h3>
          <p className="text-2xl font-bold text-white">
            ${stats.totalValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-dark-400 text-sm">Active</span>
          </div>
          <h3 className="text-white font-semibold">Open Positions</h3>
          <p className="text-2xl font-bold text-white">
            {stats.activePositions}
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-green-400 text-sm">Avg</span>
          </div>
          <h3 className="text-white font-semibold">Avg Leverage</h3>
          <p className="text-2xl font-bold text-white">
            {stats.averageLeverage.toFixed(2)}x
          </p>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-dark-400 text-sm">USD</span>
          </div>
          <h3 className="text-white font-semibold">Account PnL</h3>
          <p
            className={`text-2xl font-bold ${
              stats.pnl < 0 ? "text-red-400" : "text-green-400"
            }`}
          >
            ${stats.pnl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Portfolio Chart */}
      {portfolioData && portfolioData.length > 0 && (
        <PortfolioChart data={portfolioData} className="mb-6" />
      )}

      {/* Funding Rates Chart */}
      {accountFundingHistory && (
        <FundingsChart
          data={accountFundingHistory.data}
          totalDays={accountFundingHistory.totalDays}
          apyPercentage={accountFundingHistory.apyPercentage}
          initialAmountUSD={accountFundingHistory.initialAmountUSD}
          className="mb-6"
        />
      )}

      {/* Position Details with New UI */}
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
                <span className="text-dark-400 text-sm">Positions Allocation:</span>
                <span className={`font-bold text-lg ${
                  isOverAllocated ? 'text-red-400' : 
                  totalAllocation > 98.5 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {totalAllocation.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-dark-500 mb-2 text-left lg:text-right">
                Hedged + Unhedged positions only
              </div>
              <div className={`w-full lg:w-32 h-2 bg-dark-600 rounded-full overflow-hidden lg:ml-auto`}>
                <div 
                  className={`h-full transition-all duration-300 ${
                    isOverAllocated ? 'bg-red-500' : 
                    totalAllocation > 98.5 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                />
                {isOverAllocated && (
                  <div 
                    className="h-full bg-red-600 opacity-50"
                    style={{ width: `${totalAllocation - 100}%`, marginLeft: '100%', marginTop: '-8px' }}
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

          {/* Strategy Changes Notification */}
          {hasUnsavedChanges && (
            <div className={`mt-6 ${isOverAllocated ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20' : 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20'} border rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${isOverAllocated ? 'bg-red-500/20' : 'bg-orange-500/20'} rounded-lg`}>
                    <AlertCircle className={`w-5 h-5 ${isOverAllocated ? 'text-red-400' : 'text-orange-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      {isOverAllocated ? 'Invalid Allocation' : 'Strategy Changes Detected'}
                    </h4>
                    {isOverAllocated ? (
                      <p className="text-red-200 text-sm">
                        Positions allocation ({totalAllocation.toFixed(1)}%) exceeds 100%. Please adjust your positions.
                      </p>
                    ) : (
                      <p className="text-orange-200 text-sm">
                        You have modified your portfolio allocation. Review and apply changes below.
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
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white'
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
    </div>
  );
};

export default PositionsPage;
