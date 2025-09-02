import React, { useEffect, useState } from "react";
import { TrendingUp, PieChart, BarChart3, Activity } from "lucide-react";
import { fetchAccountFundingRatesHistory, loadHedgePosition } from "../services/hl-api.sevice";
import { useHyperliquidConfig } from "../hooks/useHyperliquidConfig";
import { useAccount } from "wagmi";
import { HedgePositionSummary } from "../types";
import FundingsChart from "../components/FundingsChart";

interface CachedPositionsData {
  data: HedgePositionSummary[];
  timestamp: number;
  address: string;
  isTestnet: boolean;
}

interface CachedFundingData {
  data: Array<{ time: number; funding: number }>;
  totalDays: number;
  apyPercentage: number;
  initialAmountUSD: number;
  timestamp: number;
  address: string;
  isTestnet: boolean;
}

// Cache configuration
const CACHE_KEY = "positions_cache";
const FUNDING_CACHE_KEY = "funding_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const FUNDING_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache utility functions
const getCachedData = (address: string, isTestnet: boolean): HedgePositionSummary[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsedCache: CachedPositionsData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid and for the same address/network
    if (
      now - parsedCache.timestamp < CACHE_DURATION &&
      parsedCache.address === address &&
      parsedCache.isTestnet === isTestnet
    ) {
      console.log("Using cached positions data");
      return parsedCache.data;
    } else {
      // Cache expired or different config, remove it
      localStorage.removeItem(CACHE_KEY);
      console.log("Cache expired or config changed, removed from localStorage");
      return null;
    }
  } catch (error) {
    console.error("Error reading positions cache:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedData = (data: HedgePositionSummary[], address: string, isTestnet: boolean): void => {
  try {
    const cacheData: CachedPositionsData = {
      data,
      timestamp: Date.now(),
      address,
      isTestnet,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("Positions data cached successfully");
  } catch (error) {
    console.error("Error caching positions data:", error);
  }
};

// Funding cache utility functions
const getCachedFundingData = (address: string, isTestnet: boolean): CachedFundingData | null => {
  try {
    const cached = localStorage.getItem(FUNDING_CACHE_KEY);
    if (!cached) return null;

    const parsedCache: CachedFundingData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid and for the same address/network
    if (
      now - parsedCache.timestamp < FUNDING_CACHE_DURATION &&
      parsedCache.address === address &&
      parsedCache.isTestnet === isTestnet
    ) {
      console.log("Using cached funding data");
      return parsedCache;
    } else {
      // Cache expired or different config, remove it
      localStorage.removeItem(FUNDING_CACHE_KEY);
      console.log("Funding cache expired or config changed, removed from localStorage");
      return null;
    }
  } catch (error) {
    console.error("Error reading funding cache:", error);
    localStorage.removeItem(FUNDING_CACHE_KEY);
    return null;
  }
};

const setCachedFundingData = (
  data: Array<{ time: number; funding: number }>,
  totalDays: number,
  apyPercentage: number,
  initialAmountUSD: number,
  address: string,
  isTestnet: boolean
): void => {
  try {
    const cacheData: CachedFundingData = {
      data,
      totalDays,
      apyPercentage,
      initialAmountUSD,
      timestamp: Date.now(),
      address,
      isTestnet,
    };
    localStorage.setItem(FUNDING_CACHE_KEY, JSON.stringify(cacheData));
    console.log("Funding data cached successfully");
  } catch (error) {
    console.error("Error caching funding data:", error);
  }
};

const PositionsPage: React.FC = () => {
  const { address } = useAccount();
  const [positions, setPositions] = useState<HedgePositionSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fundingData, setFundingData] = useState<{
    data: Array<{ time: number; funding: number }>;
    totalDays: number;
    apyPercentage: number;
    initialAmountUSD: number;
  } | null>(null);
  const { config } = useHyperliquidConfig();
  const addressToCheck = (config?.subAccountAddress || address) as `0x${string}`;
  
  // Calculate statistics from positions
  const stats = React.useMemo(() => {
    if (!positions || positions.length === 0) {
      return {
        totalValue: 0,
        activePositions: 0,
        totalMargin: 0,
        averageLeverage: 0
      };
    }
    const totalValue = positions.reduce((sum, pos) => sum + pos.perpValueUSD, 0);
    const totalMargin = positions.reduce((sum, pos) => sum + pos.margin, 0);
    const averageLeverage = positions.reduce((sum, pos) => sum + pos.leverage, 0) / positions.length;

    return {
      totalValue,
      activePositions: positions.length,
      totalMargin,
      averageLeverage
    };
  }, [positions]);
  
  useEffect(() => {
    const fetchPositions = async () => {
      if (!addressToCheck) return;
      
      setLoading(true);
      try {
        const isTestnet = config?.isTestnet ?? false;
        
        // Try to get cached positions data first
        const cachedPositions = getCachedData(addressToCheck, isTestnet);
        // Try to get cached funding data
        const cachedFunding = getCachedFundingData(addressToCheck, isTestnet);

        if (cachedPositions) {
          setPositions(cachedPositions);
        } else {
          // Fetch fresh positions data from API
          console.log("Fetching fresh positions data from API for address:", addressToCheck);
          const fetchedPositions = await loadHedgePosition(addressToCheck, isTestnet);
          console.log("Fetched Positions:", fetchedPositions);

          // Cache the fresh positions data
          setCachedData(fetchedPositions, addressToCheck, isTestnet);
          setPositions(fetchedPositions);
        }

        if (cachedFunding) {
          setFundingData({
            data: cachedFunding.data,
            totalDays: cachedFunding.totalDays,
            apyPercentage: cachedFunding.apyPercentage,
            initialAmountUSD: cachedFunding.initialAmountUSD,
          });
        } else {
          // Fetch fresh funding data from API
          console.log("Fetching fresh funding data from API for address:", addressToCheck);
          const currentPositions = cachedPositions || await loadHedgePosition(addressToCheck, isTestnet);
          const totalAmountUSD = currentPositions.reduce((sum, pos) => sum + (pos.perpValueUSD + pos.margin), 0);
          
          if (totalAmountUSD > 0) {
            const fundings = await fetchAccountFundingRatesHistory(addressToCheck, totalAmountUSD, isTestnet);
            console.log("Fetched Funding Rates:", fundings);

            // Store funding data in state
            setFundingData({
              data: fundings.data,
              totalDays: fundings.totalDays,
              apyPercentage: fundings.apyPercentage,
              initialAmountUSD: fundings.initialAmountUSD,
            });

            // Cache the fresh funding data
            setCachedFundingData(
              fundings.data,
              fundings.totalDays,
              fundings.apyPercentage,
              fundings.initialAmountUSD,
              addressToCheck,
              isTestnet
            );
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching positions:", error);
        setLoading(false);
      }
    };

    fetchPositions();
  }, [addressToCheck, config?.isTestnet]);

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
              To access your positions and fundings stats, 
              connect your wallet and unlock all features.
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
            <button className="w-full btn-primary font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
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
          <p className="text-2xl font-bold text-white">${stats.totalValue.toFixed(2)}</p>
        </div>
        
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-dark-400 text-sm">Active</span>
          </div>
          <h3 className="text-white font-semibold">Open Positions</h3>
          <p className="text-2xl font-bold text-white">{stats.activePositions}</p>
        </div>
        
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-dark-400 text-sm">USD</span>
          </div>
          <h3 className="text-white font-semibold">Total Margin</h3>
          <p className="text-2xl font-bold text-white">${stats.totalMargin.toFixed(2)}</p>
        </div>
        
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-green-400 text-sm">Avg</span>
          </div>
          <h3 className="text-white font-semibold">Avg Leverage</h3>
          <p className="text-2xl font-bold text-white">{stats.averageLeverage.toFixed(2)}x</p>
        </div>
      </div>
      
      {/* Funding Rates Chart */}
      {fundingData && (
        <FundingsChart
          data={fundingData.data}
          totalDays={fundingData.totalDays}
          apyPercentage={fundingData.apyPercentage}
          initialAmountUSD={fundingData.initialAmountUSD}
          className="mb-6"
        />
      )}
      
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Position Details</h2>
        {positions && positions.length > 0 ? (
          <div className="space-y-4">
            {positions.map((position, index) => (
              <div key={index} className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{position.symbol}</h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    position.perpPosition > 0 ? 'bg-green-500/20 text-green-400' : 
                    position.perpPosition < 0 ? 'bg-red-500/20 text-red-400' : 
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {position.perpPosition > 0 ? 'LONG' : position.perpPosition < 0 ? 'SHORT' : 'NEUTRAL'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-dark-400">Spot Balance</p>
                    <p className="text-white font-medium">{position.spotBalance.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-dark-400">Perp Position</p>
                    <p className="text-white font-medium">{position.perpPosition.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-dark-400">Leverage</p>
                    <p className="text-white font-medium">{position.leverage.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-dark-400">Margin</p>
                    <p className="text-white font-medium">${position.margin.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-400 mb-2">No Positions Yet</h3>
            <p className="text-dark-500 mb-6">
              You don't have any open positions at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionsPage;
