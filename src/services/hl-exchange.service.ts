/* eslint-disable @typescript-eslint/no-explicit-any */
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as hl from "@nktkas/hyperliquid";
import { arbitrum } from "viem/chains";
import {
  HedgeCalculation,
  PositionAdjustment,
} from "../utils/hedgeCalculations";

const transferUSDC = async (
  hlClient: hl.ExchangeClient,
  to: "spot" | "perp",
  amount: number
) => {
  // Implement the transfer logic here
  const result = await hlClient.usdClassTransfer({
    amount: amount.toString(),
    toPerp: to === "perp",
  });
  return result;
};

const checkAndTransferUSDC = async (
  exchangeClient: hl.ExchangeClient,
  balances: {
    perpsUSDC: number;
    spotUSDC: number;
  },
  requirements: {
    requiredPerpsUSDC: number;
    requiredSpotUSDC: number;
  }
) => {
  const { perpsUSDC, spotUSDC } = balances;
  const { requiredPerpsUSDC, requiredSpotUSDC } = requirements;

  const totalRequired = requiredPerpsUSDC + requiredSpotUSDC;
  const totalAvailable = perpsUSDC + spotUSDC;

  // Check if user has enough USDC in total
  if (totalAvailable < totalRequired) {
    const deficit = totalRequired - totalAvailable;
    throw new Error(
      `Insufficient USDC balance. Total required: ${totalRequired.toFixed(
        2
      )} USDC, ` +
        `Total available: ${totalAvailable.toFixed(2)} USDC, ` +
        `Deficit: ${deficit.toFixed(2)} USDC`
    );
  }

  // Calculate necessary transfers between markets
  const transfers: Array<{
    from: "spot" | "perp";
    to: "spot" | "perp";
    amount: number;
    reason: string;
  }> = [];

  // Check perpetual market
  if (perpsUSDC < requiredPerpsUSDC) {
    const neededForPerps = requiredPerpsUSDC - perpsUSDC;
    if (spotUSDC >= requiredSpotUSDC + neededForPerps) {
      transfers.push({
        from: "spot",
        to: "perp",
        amount: neededForPerps,
        reason: `Transfer to perpetual market to cover short margin (${neededForPerps.toFixed(
          2
        )} USDC needed)`,
      });
    }
  }

  // Check spot market after potential transfer to perps
  const adjustedSpotUSDC =
    spotUSDC - (transfers.find((t) => t.from === "spot")?.amount || 0);
  if (adjustedSpotUSDC < requiredSpotUSDC) {
    const neededForSpot = requiredSpotUSDC - adjustedSpotUSDC;
    const availableFromPerps =
      perpsUSDC +
      (transfers.find((t) => t.to === "perp")?.amount || 0) -
      requiredPerpsUSDC;

    if (availableFromPerps >= neededForSpot) {
      transfers.push({
        from: "perp",
        to: "spot",
        amount: neededForSpot,
        reason: `Transfer to spot market for purchase (${neededForSpot.toFixed(
          2
        )} USDC needed)`,
      });
    }
  }

  // Execute transfers if necessary
  if (transfers.length > 0) {
    console.log("Required USDC transfers:", transfers);

    for (const transfer of transfers) {
      try {
        console.log(
          `Transferring ${transfer.amount.toFixed(2)} USDC from ${
            transfer.from
          } to ${transfer.to}: ${transfer.reason}`
        );
        await transferUSDC(exchangeClient, transfer.to, transfer.amount);
      } catch (error) {
        throw new Error(
          `USDC transfer failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  }

  // Calculate final balances after transfers
  const finalPerpsBalance =
    perpsUSDC +
    (transfers.find((t) => t.to === "perp")?.amount || 0) -
    (transfers.find((t) => t.from === "perp")?.amount || 0);
  const finalSpotBalance =
    spotUSDC +
    (transfers.find((t) => t.to === "spot")?.amount || 0) -
    (transfers.find((t) => t.from === "spot")?.amount || 0);

  // Final verification after transfers
  if (finalPerpsBalance < requiredPerpsUSDC) {
    throw new Error(
      `Insufficient USDC on perpetual market after transfers. Required: ${requiredPerpsUSDC.toFixed(
        2
      )}, Available: ${finalPerpsBalance.toFixed(2)}`
    );
  }
  if (finalSpotBalance < requiredSpotUSDC) {
    throw new Error(
      `Insufficient USDC on spot market after transfers. Required: ${requiredSpotUSDC.toFixed(
        2
      )}, Available: ${finalSpotBalance.toFixed(2)}`
    );
  }

  return {
    transfers,
    finalBalances: {
      perpsUSDC: finalPerpsBalance,
      spotUSDC: finalSpotBalance,
    },
    transfersExecuted: transfers.length > 0,
  };
};

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
  try {
    await exchangeClient.setReferrer({
      code: import.meta.env.VITE_HL_BUILDERCODE,
    });
  } catch (error) {
    console.error("Error setting referrer:", error);
  }

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

  const requiredPerpsUSDC = ops.calculations.shortMargin;
  const requiredSpotUSDC = ops.calculations.spotAmount;

  // Check and transfer USDC between markets if needed
  const transferResult = await checkAndTransferUSDC(
    exchangeClient,
    { perpsUSDC, spotUSDC },
    { requiredPerpsUSDC, requiredSpotUSDC }
  );

  console.log("USDC balance check completed:", {
    transfersExecuted: transferResult.transfersExecuted,
    transfers: transferResult.transfers,
    finalBalances: transferResult.finalBalances,
  });

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
    // builder: {
    //   b: import.meta.env.VITE_HL_BUILDERADRESS,
    //   f: 1
    // }
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

const updateHedgePosition = async (
  privateKey: `0x${string}`,
  ops: {
    adjustments: PositionAdjustment[];
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
  try {
    await exchangeClient.setReferrer({
      code: import.meta.env.VITE_HL_BUILDERCODE,
    });
  } catch (error) {
    console.error("Error setting referrer:", error);
  }
  const {
    spotMetaAndAssetCtxs,
    metaAndAssetCtxs,
    allMids,
    spotClearinghouseState,
    clearinghouseState,
  } = contextData;

  // Get current USDC balances
  const perpsUSDC = Number(clearinghouseState.withdrawable);
  const spotUSDC = Number(
    spotClearinghouseState.balances.find((b) => b.coin === "USDC")?.total || 0
  );

  // Calculate total USDC requirements for all adjustments
  let totalRequiredSpotUSDC = 0;
  let totalRequiredPerpsUSDC = 0;

  // Pre-calculate USDC requirements for all adjustments
  for (const adjustment of ops.adjustments) {
    // For spot adjustments (buying requires USDC)
    if (adjustment.spotAdjustment > 0) {
      // Need to estimate USDC required for spot purchases
      // This is an approximation - in practice you'd need the current price
      const spotAssets = spotMetaAndAssetCtxs[0];
      const spotToken = spotAssets.tokens.find((token) =>
        token.name.includes(adjustment.symbol)
      );

      if (spotToken) {
        const universeItem = spotAssets.universe.find(
          (item) => item.tokens[0] === spotToken.index
        );
        if (universeItem) {
          const mid =
            allMids[
              spotToken.name === "PURR" ? `PURR/USDC` : `@${universeItem.index}`
            ];
          if (mid) {
            totalRequiredSpotUSDC += adjustment.spotAdjustment * Number(mid);
          }
        }
      }
    }

    // For perp adjustments (increasing short position requires margin)
    if (adjustment.perpAdjustment < 0) {
      // This is an approximation - you'd need to calculate actual margin requirements
      const perpAssets = metaAndAssetCtxs;
      const perpAssetIndex = perpAssets[0].universe.findIndex((a) =>
        a.name.includes(adjustment.symbol)
      );

      if (perpAssetIndex !== -1) {
        const markPx = Number(perpAssets[1][perpAssetIndex].markPx);
        const additionalMargin =
          Math.abs(adjustment.perpAdjustment) * markPx * 0.1; // Assuming 10x leverage
        totalRequiredPerpsUSDC += additionalMargin;
      }
    }
  }

  // Check and transfer USDC if needed for adjustments
  if (totalRequiredSpotUSDC > 0 || totalRequiredPerpsUSDC > 0) {
    const transferResult = await checkAndTransferUSDC(
      exchangeClient,
      { perpsUSDC, spotUSDC },
      {
        requiredPerpsUSDC: totalRequiredPerpsUSDC,
        requiredSpotUSDC: totalRequiredSpotUSDC,
      }
    );

    console.log("USDC balance check for adjustments completed:", {
      transfersExecuted: transferResult.transfersExecuted,
      transfers: transferResult.transfers,
      finalBalances: transferResult.finalBalances,
    });
  }

  const results = [];

  // Traiter chaque ajustement
  for (const adjustment of ops.adjustments) {
    try {
      // Trouver les indices des actifs
      const spotAssets = spotMetaAndAssetCtxs[0];
      const spotAssetIndex = spotAssets.tokens.findIndex((a) =>
        a.name.includes(adjustment.symbol)
      );

      if (spotAssetIndex === -1) {
        throw new Error(`Spot token not found for ${adjustment.symbol}`);
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
            return {
              ...universeItem,
              name: internalName,
              index,
              mid,
              szDecimals,
            };
          }
        })
        .filter(Boolean);

      const spotToken = spotTokensList.find(
        (t) =>
          t!.name.split("-")[0] === adjustment.symbol ||
          t!.name.split("-")[0] === `U${adjustment.symbol}`
      );

      if (!spotToken) {
        throw new Error(
          `Spot token context not found for ${adjustment.symbol}`
        );
      }

      const perpsAssets = metaAndAssetCtxs;
      const perpsAssetIndex = perpsAssets[0].universe.findIndex((a) =>
        a.name.includes(adjustment.symbol)
      );

      if (perpsAssetIndex === -1) {
        throw new Error(`Perpetual token not found for ${adjustment.symbol}`);
      }

      const perpToken = {
        szDecimals: perpsAssets[0].universe[perpsAssetIndex].szDecimals,
        midPx: perpsAssets[1][perpsAssetIndex].midPx,
        markPx: perpsAssets[1][perpsAssetIndex].markPx,
      };

      const decimals = perpToken.markPx.toString().split(".")[1]?.length || 0;

      const removeTrailingZeros = (value: number | string): string => {
        const strValue = typeof value === "number" ? value.toString() : value;
        if (strValue.includes(".")) {
          return strValue.replace(/\.?0+$/, "");
        }
        return strValue;
      };

      const orders = [];

      // Ajuster la position spot si nécessaire
      if (Math.abs(adjustment.spotAdjustment) > 0.001) {
        // Seuil minimum
        const isSpotBuy = adjustment.spotAdjustment > 0;
        const spotSize = Math.abs(adjustment.spotAdjustment);
        const spotPx = Number(spotToken.mid) * (isSpotBuy ? 1.05 : 0.95); // Slippage

        const spotOrder = await exchangeClient.order({
          orders: [
            {
              a: spotToken.index,
              b: isSpotBuy,
              p: spotPx.toFixed(Math.max(0, decimals - 1)) || "",
              s: removeTrailingZeros(
                spotSize.toFixed(Math.max(0, spotToken.szDecimals - 1))
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

        orders.push({
          type: "spot",
          action: isSpotBuy ? "buy" : "sell",
          size: spotSize,
          response: spotOrder,
        });
      }

      // Ajuster la position perpétuelle si nécessaire
      if (Math.abs(adjustment.perpAdjustment) > 0.001) {
        // Seuil minimum
        const isPerpIncrease = adjustment.perpAdjustment < 0; // Plus négatif = augmenter le short
        const perpSize = Math.abs(adjustment.perpAdjustment);
        const perpPx =
          Number(perpToken.markPx) * (isPerpIncrease ? 0.95 : 1.05); // Slippage

        const perpsOrder = await exchangeClient.order({
          orders: [
            {
              a: perpsAssetIndex,
              b: !isPerpIncrease, // false pour short, true pour réduire le short
              p: perpPx.toFixed(Math.max(0, decimals - 1)) || "",
              s: removeTrailingZeros(
                perpSize.toFixed(Math.max(0, spotToken.szDecimals - 1))
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

        orders.push({
          type: "perp",
          action: isPerpIncrease ? "increase_short" : "decrease_short",
          size: perpSize,
          response: perpsOrder,
        });
      }

      results.push({
        symbol: adjustment.symbol,
        adjustmentType: adjustment.adjustmentType,
        orders,
        success: true,
      });
    } catch (error) {
      console.error(`Error updating position for ${adjustment.symbol}:`, error);
      results.push({
        symbol: adjustment.symbol,
        adjustmentType: adjustment.adjustmentType,
        orders: [],
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    results,
    totalAdjustments: ops.adjustments.length,
    successfulAdjustments: results.filter((r) => r.success).length,
  };
};

export { openHedgePosition, updateHedgePosition };
