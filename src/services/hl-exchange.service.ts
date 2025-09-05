/* eslint-disable @typescript-eslint/no-explicit-any */
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as hl from "@nktkas/hyperliquid";
import { arbitrum } from "viem/chains";
import { HedgeCalculation } from "../utils/hedgeCalculations";

const openHedgePosition = async (
  privateKey: `0x${string}`,
  ops: {
    calculations: HedgeCalculation;
    marketAsset: string;
    subAccountAddress?: `0x${string}`;
    isTestnet: boolean;
  },
  // Données préchargées du contexte
  contextData: {
    spotMetaAndAssetCtxs: hl.SpotMetaAndAssetCtxs;
    metaAndAssetCtxs: hl.PerpsMetaAndAssetCtxs;
    allMids: Record<string, string>;
    spotClearinghouseState: hl.SpotClearinghouseState;
    clearinghouseState: hl.PerpsClearinghouseState;
  }
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
      isTestnet: ops.isTestnet || false,
    }),
    isTestnet: ops.isTestnet || false,
    defaultVaultAddress: ops?.subAccountAddress || undefined,
  });

  // Utiliser les données du contexte
  const {
    spotClearinghouseState,
    clearinghouseState,
    spotMetaAndAssetCtxs,
    metaAndAssetCtxs,
    allMids,
  } = contextData;

  const perpsUSDC = Number(clearinghouseState.withdrawable);
  console.log("Clearinghouse state:", clearinghouseState, perpsUSDC);

  const spotUSDC = Number(
    spotClearinghouseState.balances.find((b) => b.coin === "USDC")?.total || 0
  );
  console.log("Spot market state:", spotClearinghouseState, spotUSDC);

  // check if user has enough USDC in both markets
  if (perpsUSDC < ops.calculations.shortMargin) {
    throw new Error("Insufficient USDC in perpetual market");
  }
  if (spotUSDC < ops.calculations.spotAmount) {
    throw new Error("Insufficient USDC in spot market");
  }

  // find SPOT asset ID en utilisant les données du contexte
  const spotAssets = spotMetaAndAssetCtxs[0];
  const spotAssetIndex = spotAssets.tokens.findIndex((a) =>
    a.name.includes(ops.marketAsset)
  );
  console.log("Spot index:", spotAssetIndex);
  if (spotAssetIndex === -1) {
    throw new Error("Spot token not found");
  }

  const spotTokensList = spotAssets.tokens
    .map((token) => {
      const universeItem = spotAssets.universe.find(
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

  // find PERPS asset ID en utilisant les données du contexte
  const perpsAssets = metaAndAssetCtxs;
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
  const assetIndex = spotToken.index;
  const size = ops.calculations.positionSize;
  const spotPx = Number(spotToken.mid) * (1 + 0.05);
  const spotOrder = await exchangeClient.order({
    orders: [
      {
        a: assetIndex,
        b: true,
        p: spotPx.toFixed(Math.max(0, decimals - 1)) || "",
        s: removeTrailingZeros(
          size.toFixed(Math.max(0, spotToken.szDecimals - 1))
        ),
        r: false,
        t: {
          limit: {
            tif: "Gtc",
          },
        },
      },
    ],
    grouping: "na",
  });

  const orderStatus = spotOrder.response.data?.statuses[0];
  const spotOrderId =
    (orderStatus as any)?.resting?.oid ||
    (orderStatus as any)?.filled?.oid ||
    null;
  console.log("Spot order response:", spotOrder, spotOrderId);

  // PERPS leverage adjustment
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
        a: perpsAssetIndex,
        b: false,
        p: perpPx.toFixed(Math.max(0, decimals - 1)) || "",
        s: removeTrailingZeros(
          size.toFixed(Math.max(0, spotToken.szDecimals - 1))
        ),
        r: false,
        t: {
          limit: {
            tif: "Gtc",
          },
        },
      },
    ],
    grouping: "na",
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

export { openHedgePosition };
