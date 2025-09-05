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

// Types pour les données Hyperliquid utilisant les types de la bibliothèque
export interface HyperliquidDataContextType {
  // États de chargement et d'erreur
  isLoading: boolean;
  error: string | null;

  // Données de marché
  allMids: Record<string, string> | null;
  spotMeta: hl.SpotMeta | null;
  spotMetaAndAssetCtxs: hl.SpotMetaAndAssetCtxs | null;
  metaAndAssetCtxs: hl.PerpsMetaAndAssetCtxs | null;

  // Données utilisateur
  portfolioMetrics: hl.PortfolioPeriods | null;
  userFunding: hl.UserFundingUpdate[] | null;
  spotClearinghouseState: hl.SpotClearinghouseState | null;
  clearinghouseState: hl.PerpsClearinghouseState | null;
  openOrders: hl.Order[] | null;

  // Données historiques
  fundingHistory: Record<string, hl.FundingHistory[]> | null;

  // Méthodes de rafraîchissement
  refreshMarketData: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshFundingHistory: (coins?: string[]) => Promise<void>;
  refreshAllData: () => Promise<void>;

  // Client Info pour les appels personnalisés
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
  console.log("Config Hyperliquid:", config, isConfigLoading);
  // États
  const [isLoading, setIsLoading] = useState(isConfigLoading);
  const [error, setError] = useState<string | null>(null);

  // Données de marché
  const [allMids, setAllMids] = useState<Record<string, string> | null>(null);
  const [spotMeta, setSpotMeta] = useState<hl.SpotMeta | null>(null);
  const [spotMetaAndAssetCtxs, setSpotMetaAndAssetCtxs] =
    useState<hl.SpotMetaAndAssetCtxs | null>(null);
  const [metaAndAssetCtxs, setMetaAndAssetCtxs] =
    useState<hl.PerpsMetaAndAssetCtxs | null>(null);

  // Données utilisateur
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

  // Données historiques
  const [fundingHistory, setFundingHistory] = useState<Record<
    string,
    hl.FundingHistory[]
  > | null>(null);

  // Client Info
  const [infoClient, setInfoClient] = useState<hl.InfoClient | null>(null);

  // Initialiser le client Info
  useEffect(() => {
    const client = new hl.InfoClient({
      transport: new hl.HttpTransport({
        isTestnet: config.isTestnet,
      }),
    });
    setInfoClient(client);
  }, [config.isTestnet]);

  // Méthode pour rafraîchir les données de marché
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
        "Erreur lors du rafraîchissement des données de marché:",
        err
      );
      setError("Impossible de charger les données de marché");
    } finally {
      setIsLoading(false);
    }
  }, [infoClient]);

  // Méthode pour rafraîchir les données utilisateur
  const refreshUserData = useCallback(async () => {
    // En mode watch, utiliser l'adresse du watch mode, sinon utiliser l'adresse configurée ou connectée
    const addressToCheck = isWatchMode ? watchAddress : (config?.subAccountAddress || address);
    
    if (!infoClient || !addressToCheck) return;
    
    // En mode watch, on n'a pas besoin d'être connecté
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
          infoClient
            .userFunding({
              user: addressToCheck as `0x${string}`,
              startTime: new Date("2025-09-01").getTime(),
            })
            .then((result) =>
              result.filter((item) => item.delta.type === "funding")
            ),
        ]);

      setPortfolioMetrics(portfolioMetrics);
      setSpotClearinghouseState(spotState);
      setClearinghouseState(clearingState);
      setOpenOrders(orders);
      setUserFunding(funding);
    } catch (err) {
      console.error(
        "Erreur lors du rafraîchissement des données utilisateur:",
        err
      );
      setError("Impossible de charger les données utilisateur");
    } finally {
      setIsLoading(false);
    }
  }, [infoClient, address, isConnected, config?.subAccountAddress, isWatchMode, watchAddress]);

  // Méthode pour rafraîchir l'historique des funding
  const refreshFundingHistory = useCallback(
    async (coins?: string[]) => {
      if (!infoClient) return;

      try {
        setIsLoading(true);
        setError(null);

        // Si aucune liste de coins fournie, utiliser les métadonnées actuelles
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
              startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 jours
            });
            return { coin, history };
          } catch (err) {
            console.warn(
              `Impossible de récupérer l'historique pour ${coin}:`,
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
          "Erreur lors du rafraîchissement de l'historique des funding:",
          err
        );
        setError("Impossible de charger l'historique des funding");
      } finally {
        setIsLoading(false);
      }
    },
    [infoClient, metaAndAssetCtxs, spotMetaAndAssetCtxs, allMids]
  );

  // Méthode pour rafraîchir toutes les données
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refreshMarketData(),
      refreshUserData(),
      refreshFundingHistory(),
    ]);
  }, [refreshMarketData, refreshUserData, refreshFundingHistory]);

  // Rafraîchir les données de marché au chargement et quand le client change
  useEffect(() => {
    refreshMarketData();
  }, [refreshMarketData]);

  // Rafraîchir les données utilisateur quand l'utilisateur se connecte
  useEffect(() => {
    if (isConnected && address) {
      refreshUserData();
    } else {
      // Réinitialiser les données utilisateur quand déconnecté
      setPortfolioMetrics(null);
      setUserFunding(null);
      setSpotClearinghouseState(null);
      setClearinghouseState(null);
      setOpenOrders(null);
    }
  }, [refreshUserData, isConnected, address]);

  // Rafraîchir l'historique des funding quand les métadonnées sont disponibles
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
