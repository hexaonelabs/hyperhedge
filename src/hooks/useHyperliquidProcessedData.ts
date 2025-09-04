import { useMemo } from "react";
import { useHyperliquidData } from "./useHyperliquidData";
import {
  processFundingRates,
  processHedgePositions,
  processAccountFundingHistory,
  processFundingHistory,
} from "../services/hl-data-processor.service";

/**
 * Hook personnalisé pour récupérer et traiter les données Hyperliquid
 */
export const useHyperliquidProcessedData = () => {
  const {
    isLoading,
    error,
    allMids,
    spotMetaAndAssetCtxs,
    metaAndAssetCtxs,

    // account data
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
  } = useHyperliquidData();

  const fundingRates = useMemo(() => {
    if (!spotMetaAndAssetCtxs || !metaAndAssetCtxs || !allMids) {
      return [];
    }
    return processFundingRates(spotMetaAndAssetCtxs, metaAndAssetCtxs, allMids);
  }, [spotMetaAndAssetCtxs, metaAndAssetCtxs, allMids]);

  const hedgePositions = useMemo(() => {
    if (!spotClearinghouseState || !clearinghouseState || !openOrders) {
      return [];
    }
    return processHedgePositions(
      spotClearinghouseState,
      clearinghouseState,
      openOrders
    );
  }, [spotClearinghouseState, clearinghouseState, openOrders]);

  const totalAccountValueUSD = useMemo(() => {
    // const spotTotalUSD = spotClearinghouseState?.balances.reduce((acc, b) => {
    //   const universeItem = spotMetaAndAssetCtxs?.[0].universe.find(
    //       (item) => item.tokens[0] === b.token
    //   );
    //   const index = universeItem?.index === 0 && b.coin === 'PURR'
    //     ?'PURR/USDC'
    //     : `@${universeItem?.index}`;
    //   const mid = b.coin === 'USDC' ? 1 : (Number(allMids?.[index] || 0));
    //   // console.log(`Calculating USD for ${b.coin}:`, {b, universeItem, allMids, mid});
    //   return acc + (Number(b.total) * mid);
    // }, 0) || 0;
    // const perpTotalUSD = Number(clearinghouseState?.marginSummary.accountValue || 0);
    // // console.log({spotTotalUSD, perpTotalUSD, allMids});
    // return spotTotalUSD + perpTotalUSD;
    return Number(
      portfolioMetrics?.[0][1].accountValueHistory.at(-1)?.[1] || 0
    );
  }, [portfolioMetrics]);

  const accountPnl = useMemo(() => {
    if (!portfolioMetrics) {
      return 0;
    }
    return Number(portfolioMetrics[3][1].pnlHistory.at(-1)?.[1] || 0);
  }, [portfolioMetrics]);

  const accountFundingHistory = useMemo(() => {
    if (!userFunding || userFunding.length === 0) {
      return null;
    }
    return processAccountFundingHistory(userFunding, totalAccountValueUSD);
  }, [userFunding, totalAccountValueUSD]);

  const processedFundingHistory = useMemo(() => {
    if (!fundingHistory) {
      return [];
    }
    return processFundingHistory(fundingHistory);
  }, [fundingHistory]);

  // Indicateurs de disponibilité des données
  const hasMarketData = Boolean(
    spotMetaAndAssetCtxs && metaAndAssetCtxs && allMids
  );
  const hasUserData = Boolean(spotClearinghouseState && clearinghouseState);

  return {
    // États
    isLoading,
    error,
    hasMarketData,
    hasUserData,

    // Données brutes (si nécessaire pour des cas d'usage spécifiques)
    raw: {
      allMids,
      spotMetaAndAssetCtxs,
      metaAndAssetCtxs,
      portfolioMetrics,
      userFunding,
      spotClearinghouseState,
      clearinghouseState,
      openOrders,
      fundingHistory,
      infoClient,
    },

    // Données traitées
    accountPnl,
    totalAccountValueUSD,
    fundingRates,
    hedgePositions,
    accountFundingHistory,
    fundingHistory: processedFundingHistory,

    // Méthodes de rafraîchissement
    refreshMarketData,
    refreshUserData,
    refreshFundingHistory,
    refreshAllData,
  };
};
