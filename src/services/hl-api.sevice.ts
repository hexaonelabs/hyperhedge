/* eslint-disable @typescript-eslint/no-explicit-any */
import { createWalletClient, http } from "viem";

import { privateKeyToAccount } from "viem/accounts";
import * as hl from "@nktkas/hyperliquid";
import { arbitrum } from "viem/chains";
import { FundingRate, HedgeCalculation, HedgePositionSummary } from "../types";

const openHedgePosition = async (
  walletAddress: `0x${string}`,
  privateKey: `0x${string}`,
  ops: {
    calculations: HedgeCalculation;
    marketAsset: string;
    subAccountAddress?: `0x${string}`;
  },
  isTestnet: boolean = true
) => {
  const client = createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: arbitrum,
    transport: http(),
  });
  // HL clients
  const exchangeClient = new hl.ExchangeClient({
    wallet: client,
    transport: new hl.HttpTransport({
      isTestnet,
    }),
    isTestnet,
    defaultVaultAddress: ops?.subAccountAddress || undefined,
  });
  const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport({
      isTestnet,
    }),
  });

  // User info perps
  const clearinghouseState = await infoClient.clearinghouseState({
    user: ops?.subAccountAddress || walletAddress,
  });
  const perpsUSDC = Number(clearinghouseState.withdrawable);
  console.log("Clearinghouse state:", clearinghouseState, perpsUSDC);

  // User info Spot
  const spotMarketState = await infoClient.spotClearinghouseState({
    user: ops?.subAccountAddress || walletAddress,
  });
  const spotUSDC = Number(
    spotMarketState.balances.find((b) => b.coin === "USDC")?.total || 0
  );
  console.log("Spot market state:", spotMarketState, spotUSDC);

  // check if user has enough USDC in both markets
  if (perpsUSDC < ops.calculations.shortMargin) {
    throw new Error("Insufficient USDC in perpetual market");
  }
  if (spotUSDC < ops.calculations.spotAmount) {
    throw new Error("Insufficient USDC in spot market");
  }

  // find SPOT asset ID
  const spotAssets = await infoClient.spotMeta();
  const spotAssetIndex = spotAssets.tokens.findIndex((a) =>
    a.name.includes(ops.marketAsset)
  );
  console.log("Spot index:", spotAssetIndex);
  if (spotAssetIndex === -1) {
    throw new Error("Spot token not found");
  }
  const spotCtx = await infoClient.spotMetaAndAssetCtxs();
  const allMids = await infoClient.allMids();

  const spotTokensList = spotCtx[0].tokens
    .map((token) => {
      const universeItem = spotCtx[0].universe.find(
        (item) => item.tokens[0] === token.index
      );
      if (universeItem) {
        const internalName = `${token.name}-SPOT`;
        const szDecimals = token.szDecimals;
        const index = universeItem.index + 10_000;
        const mid =
          allMids[
            token.name === "PURR" ? `PURR/USDC` : `@${universeItem.index}`
          ];
        return { ...universeItem, name: internalName, index, mid, szDecimals };
      }
    })
    .filter(Boolean);
  const spotToken = spotTokensList.find(
    (t) =>
      t!.name.split("-")[0] === ops.marketAsset ||
      t!.name.split("-")[0] === `U${ops.marketAsset}`
  );
  if (!spotToken) {
    throw new Error("Spot token context not found");
  }

  // find PERPS asset ID
  const perpsAssets = await infoClient.metaAndAssetCtxs();
  const perpsAssetIndex = perpsAssets[0].universe.findIndex((a) =>
    a.name.includes(ops.marketAsset)
  );
  if (perpsAssetIndex === -1) {
    throw new Error("Perpetual token not found");
  }
  const perpToken = {
    szDecimals: perpsAssets[0].universe[perpsAssetIndex].szDecimals,
    midPx: perpsAssets[1][perpsAssetIndex].midPx,
    markPx: perpsAssets[1][perpsAssetIndex].markPx,
  };
  const decimals = perpToken.markPx.toString().split(".")[1]?.length || 0;
  console.log("tokens:", { spotToken, perpToken, ops, decimals });

  const removeTrailingZeros = (value: number | string): string => {
    const strValue = typeof value === "number" ? value.toString() : value;
    if (strValue.includes(".")) {
      return strValue.replace(/\.?0+$/, "");
    }
    return strValue;
  };

  // open Spot position
  const assetIndex = spotToken.index; // Example mapping, adjust as needed
  const size = ops.calculations.positionSize;
  const spotPx = Number(spotToken.mid) * (1 + 0.05);
  const spotOrder = await exchangeClient.order({
    orders: [
      {
        a: assetIndex, // Asset index
        b: true, // Buy order
        p: spotPx.toFixed(Math.max(0, decimals - 1)) || "", // Price
        s: removeTrailingZeros(
          size.toFixed(Math.max(0, spotToken.szDecimals - 1))
        ), // Size
        r: false, // Not reduce-only
        t: {
          limit: {
            tif: "Gtc", // Good-til-cancelled
          },
        },
        // c: "0x...", // Client Order ID (optional)
      },
    ],
    grouping: "na", // No grouping
  });
  const orderStatus = spotOrder.response.data?.statuses[0];
  const spotOrderId =
    (orderStatus as any)?.resting?.oid ||
    (orderStatus as any)?.filled?.oid ||
    null;
  console.log("Spot order response:", spotOrder, spotOrderId);

  // PERPS leverage ajusment
  await exchangeClient.updateLeverage({
    asset: perpsAssetIndex,
    isCross: false,
    leverage: ops.calculations.leverage,
  });

  // open PERPS position
  const perpPx = Number(perpToken.markPx) * (1 - 0.05);
  const perpsOrder = await exchangeClient.order({
    orders: [
      {
        a: perpsAssetIndex, // Asset index
        b: false, // Buy order
        p: perpPx.toFixed(Math.max(0, decimals - 1)) || "", // Price
        s: removeTrailingZeros(
          size.toFixed(Math.max(0, spotToken.szDecimals - 1))
        ), // Size
        r: false, // Not Reduce-only
        t: {
          limit: {
            tif: "Gtc", // Good-til-cancelled
          },
        },
        // c: "0x...", // Client Order ID (optional)
      },
    ],
    grouping: "na", // No grouping
  });
  const perpsOrderStatus = perpsOrder.response.data?.statuses[0];
  const perpsOrderId =
    (perpsOrderStatus as any)?.resting?.oid ||
    (perpsOrderStatus as any)?.filled?.oid ||
    null;
  console.log("Perps order response:", perpsOrder, perpsOrderId);

  // cancel spot order if perps order failed
  if (!perpsOrderId) {
    await exchangeClient.cancelByCloid({
      cancels: [
        {
          asset: spotAssetIndex + 10000,
          cloid: spotOrderId,
        },
      ],
    });
    throw new Error("Perps order failed, spot order cancelled");
  } else {
    return {
      spotOrder,
      perpsOrder,
    };
  }
};

const fetchFundingRates = async (
  isTestNet: boolean
): Promise<FundingRate[]> => {
  try {
    const infoClient = new hl.InfoClient({
      transport: new hl.HttpTransport({
        isTestnet: isTestNet ?? false,
      }),
    });

    const spotCtx = await infoClient.spotMetaAndAssetCtxs();
    const allMids = await infoClient.allMids();

    const spotTokensList = spotCtx[0].tokens
      .map((token) => {
        const universeItem = spotCtx[0].universe.find(
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

    const [{ universe: perpsUniverse }, assetContexts] =
      await infoClient.metaAndAssetCtxs();

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
          fundingTime: Date.now() + 1 * 60 * 60 * 1000, // Next funding time in milliseconds
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
  } catch (error) {
    console.error("Error fetching funding rates:", error);
    throw new Error("Failed to fetch funding rates from Hyperliquid API");
  }
};

const fetchFundingRatesHistory = async (isTestNet: boolean): Promise<{
    coin: string;
    fundings: number[][];
}[]> => {
  const currentFundings = await fetchFundingRates(isTestNet);
  const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport({
      isTestnet: isTestNet ?? false,
    }),
  });

  const result = [];
  for (const funding of currentFundings) {
    const coin = funding.symbol;
    const fundingHistory = await infoClient.fundingHistory({
      coin,
      startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    });
    result.push({
      coin,
      fundings: fundingHistory.map((f) => [f.time, Number(f.fundingRate)]),
    });
  }
  console.log({ result });
  return result;
}

const fetchAccountFundingRatesHistory = async (address: `0x${string}`, initialAmountUSD: number,isTestNet: boolean) => {
  const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport({
      isTestnet: isTestNet ?? false,
    }),
  });

  const startTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
  const response = await infoClient.userFunding({
    user: address,
    startTime,
  });
  const data = response.filter((item) => item.delta.type === "funding")
  // reduce to create cumulative data
  .reduce((acc, item) => {
    const lastFunding = acc.length > 0 ? acc[acc.length - 1].funding : 0;
    acc.push({
      time: item.time,
      funding: lastFunding + Number(item.delta.usdc),
    });
    return acc;
  }, [] as { time: number; funding: number }[]);
  const totalDays = (Date.now() - (data[0]?.time || 0)) / (1000 * 60 * 60 * 24);
  const totalGainByDayUSD = (data[data.length - 1]?.funding || 0) / (totalDays || 1);
  const apyPercentage = (Math.pow(1 + (totalGainByDayUSD / initialAmountUSD), 365) - 1) * 100;

  return {
    data,
    startTime,
    apyPercentage,
    totalDays,
    initialAmountUSD,
  }
};

const loadHedgePosition = async (
  address: `0x${string}`,
  isTestNet: boolean
): Promise<HedgePositionSummary[]> => {
  const infoClient = new hl.InfoClient({
    transport: new hl.HttpTransport({
      isTestnet: isTestNet ?? false,
    }),
  });
  const { balances: spotTokens } = await infoClient.spotClearinghouseState({
    user: address,
  });
  const { assetPositions: perpTokens } = await infoClient.clearinghouseState({
    user: address,
  });
  const pendingOrders = await infoClient.openOrders({ user: address });

  const positions = [
    ...spotTokens.map((t) => ({ ...t, status: "active" })),
    ...pendingOrders.map((o) => ({ ...o, total: o.sz, status: "pending" })),
  ]
    .filter((spotToken) => spotToken.coin !== "USDC")
    .map((spotToken) => {
      const perpToken = perpTokens.find(
        ({ position: p }) => p.coin === spotToken.coin || `U${p.coin}` === spotToken.coin
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
        status: spotToken.status,
      };
    })
    .filter(Boolean) as HedgePositionSummary[];

  return positions;
};

export {
  // info Endpoint
  fetchFundingRates,
  fetchFundingRatesHistory,
  loadHedgePosition,
  fetchAccountFundingRatesHistory,
  // Exchange Endpoint
  openHedgePosition,
};
