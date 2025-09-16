import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import * as hl from "@nktkas/hyperliquid";
import { useWallet } from "../hooks/useWallet";
import { useHyperliquidConfig } from "../hooks/useHyperliquidConfig";
import { useWatchMode } from "../hooks/useWatchMode";
import { processFundingRates } from "../services/hl-data-processor.service";

// Types for Hyperliquid data using library types
export interface HyperliquidDataContextType {
  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Market data
  allMids: Record<string, string> | null;
  spotMeta: hl.SpotMeta | null;
  spotMetaAndAssetCtxs: hl.SpotMetaAndAssetCtxs | null;
  metaAndAssetCtxs: hl.PerpsMetaAndAssetCtxs | null;

  // User data
  portfolioMetrics: hl.PortfolioPeriods | null;
  userFunding: hl.UserFundingUpdate[] | null;
  spotClearinghouseState: hl.SpotClearinghouseState | null;
  clearinghouseState: hl.PerpsClearinghouseState | null;
  openOrders: hl.Order[] | null;

  // Historical data
  fundingHistory: Record<string, hl.FundingHistory[]> | null;

  // Refresh methods
  refreshMarketData: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshFundingHistory: (coins?: string[]) => Promise<void>;
  refreshAllData: () => Promise<void>;

  // Info Client for custom calls
  infoClient: hl.InfoClient | null;
}

const HyperliquidDataContext = createContext<
  HyperliquidDataContextType | undefined
>(undefined);

interface HyperliquidDataProviderProps {
  children: ReactNode;
}

export const HyperliquidDataProvider: React.FC<
  HyperliquidDataProviderProps
> = ({ children }) => {
  const { address, isConnected } = useWallet();
  const { config, isLoading: isConfigLoading } = useHyperliquidConfig();
  const { isWatchMode, watchAddress } = useWatchMode();
  console.log("Hyperliquid Config:", config, isConfigLoading);
  // States
  const [isLoading, setIsLoading] = useState(isConfigLoading);
  const [error, setError] = useState<string | null>(null);

  // Market data
  const [allMids, setAllMids] = useState<Record<string, string> | null>(null);
  const [spotMeta, setSpotMeta] = useState<hl.SpotMeta | null>(null);
  const [spotMetaAndAssetCtxs, setSpotMetaAndAssetCtxs] =
    useState<hl.SpotMetaAndAssetCtxs | null>(null);
  const [metaAndAssetCtxs, setMetaAndAssetCtxs] =
    useState<hl.PerpsMetaAndAssetCtxs | null>(null);

  // User data
  const [portfolioMetrics, setPortfolioMetrics] =
    useState<hl.PortfolioPeriods | null>(null);
  const [userFunding, setUserFunding] = useState<hl.UserFundingUpdate[] | null>(
    null
  );
  const [spotClearinghouseState, setSpotClearinghouseState] =
    useState<hl.SpotClearinghouseState | null>(null);
  const [clearinghouseState, setClearinghouseState] =
    useState<hl.PerpsClearinghouseState | null>(null);
  const [openOrders, setOpenOrders] = useState<hl.Order[] | null>(null);

  // Historical data
  const [fundingHistory, setFundingHistory] = useState<Record<
    string,
    hl.FundingHistory[]
  > | null>(null);

  // Info Client
  const [infoClient, setInfoClient] = useState<hl.InfoClient | null>(null);

  // Initialize Info client
  useEffect(() => {
    const client = new hl.InfoClient({
      transport: new hl.HttpTransport({
        isTestnet: config.isTestnet,
      }),
    });
    setInfoClient(client);
  }, [config.isTestnet]);

  // Method to refresh market data
  const refreshMarketData = useCallback(async () => {
    if (!infoClient) return;

    try {
      setIsLoading(true);
      setError(null);

      const [midsData, spotMetaData, spotCtxData, metaCtxData] =
        await Promise.all([
          infoClient.allMids(),
          infoClient.spotMeta(),
          infoClient.spotMetaAndAssetCtxs(),
          infoClient.metaAndAssetCtxs(),
        ]);

      setAllMids(midsData);
      setSpotMeta(spotMetaData);
      setSpotMetaAndAssetCtxs(spotCtxData);
      setMetaAndAssetCtxs(metaCtxData);
    } catch (err) {
      console.error(
        "Error refreshing market data:",
        err
      );
      setError("Unable to load market data");
    } finally {
      setIsLoading(false);
    }
  }, [infoClient]);

  // Method to fetch all user funding with pagination
  const fetchAllUserFunding = useCallback(async (addressToCheck: string): Promise<hl.UserFundingUpdate[]> => {
    if (!infoClient) return [];
    
    const allFunding: hl.UserFundingUpdate[] = [];
    let startTime = new Date("2024-01-01").getTime(); // Beginning of year to fetch more history
    const currentEndTime = Date.now();
    const maxIterations = 50; // Protection against infinite loops
    let iterations = 0;
    
    while (iterations < maxIterations) {
      try {
        const batch = await infoClient.userFunding({
          user: addressToCheck as `0x${string}`,
          startTime,
          endTime: currentEndTime,
        });
        
        console.log(`Batch ${iterations + 1}: retrieved ${batch.length} total entries`);
        
        if (batch.length === 0) {
          break; // No more data to fetch
        }
        
        // Add all batch data (not just funding) to maintain chronological order
        // Filtering will be done after retrieving everything
        allFunding.push(...batch);
        
        // If we have less than 500 entries, we probably retrieved everything
        if (batch.length < 500) {
          break;
        }
        
        // Update endTime for next iteration
        // Use timestamp of last element in this batch as endTime for next one
        startTime = batch[batch.length - 1].time - 1;
        iterations++;
        
        // Small pause to avoid overloading the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`Error retrieving batch ${iterations + 1}:`, err);
        break;
      }
    }
    
    // Sort by timestamp (oldest to newest) and filter only funding
    const sortedAndFilteredFunding = allFunding
      .filter((item) => item.delta.type === "funding")
      .sort((a, b) => a.time - b.time);
    
    console.log(`Total retrieved: ${allFunding.length} entries, including ${sortedAndFilteredFunding.length} funding over ${iterations} batches`);
    console.log(`Period covered: ${new Date(sortedAndFilteredFunding[0]?.time || 0).toLocaleDateString()} - ${new Date(sortedAndFilteredFunding[sortedAndFilteredFunding.length - 1]?.time || 0).toLocaleDateString()}`);
    
    return sortedAndFilteredFunding;
  }, [infoClient]);

  // Method to refresh user data
  const refreshUserData = useCallback(async () => {
    // In watch mode, use watch mode address, otherwise use configured or connected address
    const addressToCheck = isWatchMode ? watchAddress : (config?.subAccountAddress || address);
    
    if (!infoClient || !addressToCheck) return;
    
    // In watch mode, we don't need to be connected
    if (!isWatchMode && !isConnected) return;

    try {
      setIsLoading(true);
      setError(null);

      const [portfolioMetrics, spotState, clearingState, orders, funding] =
        await Promise.all([
          infoClient.portfolio({ user: addressToCheck as `0x${string}` }),
          infoClient.spotClearinghouseState({ user: addressToCheck as `0x${string}` }),
          infoClient.clearinghouseState({ user: addressToCheck as `0x${string}` }),
          infoClient.openOrders({ user: addressToCheck as `0x${string}` }),
          fetchAllUserFunding(addressToCheck),
        ]);

      setPortfolioMetrics(portfolioMetrics);
      setSpotClearinghouseState(spotState);
      setClearinghouseState(clearingState);
      setOpenOrders(orders);
      setUserFunding(funding);
    } catch (err) {
      console.error(
        "Error refreshing user data:",
        err
      );
      setError("Unable to load user data");
    } finally {
      setIsLoading(false);
    }
  }, [infoClient, address, isConnected, config?.subAccountAddress, isWatchMode, watchAddress, fetchAllUserFunding]);

  // Method to refresh funding history
  const refreshFundingHistory = useCallback(
    async (coins?: string[]) => {
      if (!infoClient) return;

      try {
        setIsLoading(true);
        setError(null);

        // If no coin list provided, use current metadata
        if (!coins && metaAndAssetCtxs && spotMetaAndAssetCtxs && allMids) {
          const enabledCoins = processFundingRates(
            spotMetaAndAssetCtxs,
            metaAndAssetCtxs,
            allMids
          );
          coins = enabledCoins.map((coin) => coin.symbol);
        }

        if (!coins || coins.length === 0) return;

        const historyPromises = coins.map(async (coin) => {
          try {
            const history = await infoClient.fundingHistory({
              coin,
              startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            return { coin, history };
          } catch (err) {
            console.warn(
              `Unable to retrieve history for ${coin}:`,
              err
            );
            return { coin, history: [] };
          }
        });

        const results = await Promise.all(historyPromises);
        const historyMap = results.reduce((acc, { coin, history }) => {
          acc[coin] = history;
          return acc;
        }, {} as Record<string, hl.FundingHistory[]>);

        setFundingHistory(historyMap);
      } catch (err) {
        console.error(
          "Error refreshing funding history:",
          err
        );
        setError("Unable to load funding history");
      } finally {
        setIsLoading(false);
      }
    },
    [infoClient, metaAndAssetCtxs, spotMetaAndAssetCtxs, allMids]
  );

  // Method to refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refreshMarketData(),
      refreshUserData(),
      refreshFundingHistory(),
    ]);
  }, [refreshMarketData, refreshUserData, refreshFundingHistory]);

  // Refresh market data on load and when client changes
  useEffect(() => {
    refreshMarketData();
  }, [refreshMarketData]);

  // Refresh user data when user connects
  useEffect(() => {
    if (isConnected && address) {
      refreshUserData();
    } else {
      // Reset user data when disconnected
      setPortfolioMetrics(null);
      setUserFunding(null);
      setSpotClearinghouseState(null);
      setClearinghouseState(null);
      setOpenOrders(null);
    }
  }, [refreshUserData, isConnected, address]);

  // Refresh funding history when metadata is available
  useEffect(() => {
    if (metaAndAssetCtxs) {
      refreshFundingHistory();
    }
  }, [refreshFundingHistory, metaAndAssetCtxs]);

  const contextValue: HyperliquidDataContextType = {
    isLoading,
    error,
    allMids,
    spotMeta,
    spotMetaAndAssetCtxs,
    metaAndAssetCtxs,

    // account datas
    portfolioMetrics,
    userFunding,
    spotClearinghouseState,
    clearinghouseState,
    openOrders,
    fundingHistory,

    // methods
    refreshMarketData,
    refreshUserData,
    refreshFundingHistory,
    refreshAllData,
    infoClient,
  };

  return (
    <HyperliquidDataContext.Provider value={contextValue}>
      {children}
    </HyperliquidDataContext.Provider>
  );
};

export default HyperliquidDataContext;
