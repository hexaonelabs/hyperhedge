import React from "react";
import {
  TrendingUp,
  PieChart,
  Activity,
  DollarSign,
  BarChart3,
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

  // Handle allocation changes
  const handleAllocationChange = (symbol: string, percentage: number) => {
    console.log(`Allocation change for ${symbol}: ${percentage}%`);
    // Here you can implement the logic to update position allocations
    // This might involve API calls to adjust position sizes
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
          <div className="flex items-center justify-between mb-4">
            <div>
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
          </div>

          {/* USDC Reserves */}
          <USDCReservesCard
            spotUSDC={usdcReserves.spotUSDC}
            perpUSDC={usdcReserves.perpUSDC}
          />

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
