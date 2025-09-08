import * as hl from "@nktkas/hyperliquid";
import { FundingRate, HedgePositionSummary } from "../types";

export const processFundingRates = (
  spotMetaAndAssetCtxs: hl.SpotMetaAndAssetCtxs,
  metaAndAssetCtxs: hl.PerpsMetaAndAssetCtxs,
  allMids: Record<string, string>
): FundingRate[] => {
  const spotTokensList = spotMetaAndAssetCtxs[0].tokens
    .map((token) => {
      const universeItem = spotMetaAndAssetCtxs[0].universe.find(
        (item) => item.tokens[0] === token.index
      );
      if (universeItem) {
        const internalName = `${token.name}-SPOT`;
        const szDecimals = token.szDecimals;
        const index = universeItem.index + 10_000;
        const mid = allMids[`@${universeItem.index}`];
        return {
          ...universeItem,
          name: internalName,
          index,
          mid,
          szDecimals,
        };
      }
    })
    .filter(Boolean)!
    .sort((a, b) => a!.name!.localeCompare(b!.name)) as {
    name: string;
    index: number;
    mid: string;
    szDecimals: number;
    tokens: number[];
    isCanonical: boolean;
  }[];

  const [{ universe: perpsUniverse }, assetContexts] = metaAndAssetCtxs;

  // Combine universe data with asset contexts to get funding rates
  const tokensAvailable: FundingRate[] = perpsUniverse
    .map((asset, index) => {
      const context = assetContexts[index];
      if (!context || asset.isDelisted) return null;
      if (parseFloat(context.dayNtlVlm) < 100) return null;
      const currentRate = parseFloat(context.funding);
      return {
        id: asset.name,
        symbol: asset.name,
        fundingRate: currentRate,
        nextFunding: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        markPrice: parseFloat(context.markPx),
        volume24h: parseFloat(context.dayNtlVlm),
        openInterest: parseFloat(context.openInterest),
        indexPrice: parseFloat(context.oraclePx),
        fundingTime: Date.now() + 1 * 60 * 60 * 1000,
        perpIndex: index,
      };
    })
    .filter((item): item is FundingRate => item !== null);

  // only return funding rates for perpetual contracts that have Spot asset counterparts
  const fundingRates = tokensAvailable.filter((rate) => {
    return spotTokensList.some(
      (spotToken) =>
        spotToken.name.split("-")[0] === rate.symbol ||
        spotToken.name.split("-")[0] === `U${rate.symbol}`
    );
  });

  console.log({ tokensAvailable, fundingRates, spotTokensList, allMids });
  return fundingRates;
};

export const processHedgePositions = (
  spotClearinghouseState: hl.SpotClearinghouseState,
  clearinghouseState: hl.PerpsClearinghouseState,
  openOrders: hl.Order[]
): HedgePositionSummary[] => {
  const { balances: spotTokens } = spotClearinghouseState;
  const { assetPositions: perpTokens } = clearinghouseState;

  const positions = [
    ...spotTokens.map((t) => ({ ...t, status: "active" })),
    ...openOrders.map((o) => ({ ...o, total: o.sz, status: "pending" })),
  ]
    .filter((spotToken) => spotToken.coin !== "USDC")
    .map((spotToken) => {
      const perpToken = perpTokens.find(
        ({ position: p }) =>
          p.coin === spotToken.coin || `U${p.coin}` === spotToken.coin
      );
      if (!perpToken) {
        return null;
      }
      return {
        symbol: perpToken?.position?.coin || spotToken.coin,
        spotBalance: Number(spotToken.total),
        perpValueUSD: Number(perpToken?.position?.positionValue || 0),
        perpPosition: Number(perpToken?.position?.szi ?? 0),
        leverage: Number(perpToken?.position?.leverage?.value ?? 1),
        margin: Number(perpToken?.position?.marginUsed ?? 0),
        liquidationPx: Number(perpToken?.position?.liquidationPx ?? 0),
        status: spotToken.status,
      };
    })
    .filter(Boolean) as HedgePositionSummary[];

  return positions;
};

export const processAccountFundingHistory = (
  userFunding: hl.UserFundingUpdate[],
  initialAmountUSD: number
) => {
  const data = userFunding
    .filter((item) => item.delta.type === "funding")
    .reduce((acc, item) => {
      const lastFunding = acc.length > 0 ? acc[acc.length - 1].funding : 0;
      acc.push({
        time: item.time,
        funding: lastFunding + Number(item.delta.usdc),
      });
      return acc;
    }, [] as { time: number; funding: number }[]);

  const totalDays = (Date.now() - (data[0]?.time || 0)) / (1000 * 60 * 60 * 24);
  const totalGainByDayUSD =
    (data[data.length - 1]?.funding || 0) / (totalDays || 1);
  const apyPercentage =
    (Math.pow(1 + totalGainByDayUSD / initialAmountUSD, 365) - 1) * 100;

  return {
    data,
    startTime: data[0]?.time || Date.now(),
    apyPercentage,
    totalDays,
    initialAmountUSD,
  };
};

export const processFundingHistory = (
  fundingHistory: Record<string, hl.FundingHistory[]>
): { coin: string; fundings: number[][] }[] => {
  return Object.entries(fundingHistory).map(([coin, history]) => ({
    coin,
    fundings: history.map((f) => [f.time, Number(f.fundingRate)]),
  }));
};
