import { HedgePositionSummary } from '../types';

export interface HedgeCalculation {
  hedgeValue: number;
  leverage: number;
  spotAmount: number;
  shortMargin: number;
  shortNotional: number;
  liquidationPrice: number;
  positionSize: number;
  annualizedReturn: number;
}

export interface HedgePositionBreakdown {
  totalValue: number;
  spotValue: number;
  perpValue: number;
  spotBalance: number;
  perpPosition: number;
  margin: number;
  leverage: number;
  liquidationPrice: number;
}

/**
 * Calculate hedge position breakdown from allocation percentage and portfolio value
 */
export const calculateHedgePositionFromAllocation = (
  allocationPercentage: number,
  totalPortfolioValue: number,
  currentPrice: number,
  leverage: number = 1
): HedgePositionBreakdown => {
  const totalValue = (allocationPercentage / 100) * totalPortfolioValue;
  
  // Répartition: Spot + Short (comme dans HedgeForm)
  // Spot = une partie du hedge value
  // Short = le reste avec levier pour couvrir la même valeur
  const spotValue = totalValue * (leverage / (leverage + 1));
  const shortMargin = totalValue - spotValue;
  const shortNotional = shortMargin * leverage;
  
  // Calcul des balances
  const spotBalance = spotValue / currentPrice;
  const perpPosition = -(shortNotional / currentPrice); // Négatif car c'est un short

  // Prix de liquidation pour position short : prix auquel la marge est épuisée
  // Formule: prix_liquidation = prix_entrée * (1 + (marge / notional))
  // Pour un short: prix_liquidation = prix_entrée * (1 + (shortMargin / shortNotional))
  const liquidationPrice = currentPrice * (1 + (shortMargin / shortNotional));

  return {
    totalValue,
    spotValue,
    perpValue: shortNotional,
    spotBalance,
    perpPosition,
    margin: shortMargin,
    leverage,
    liquidationPrice,
  };
};

/**
 * Calculate current position value from spot and perp components
 */
export const calculatePositionValueRequied = (
  spotBalance: number,
  perpPosition: number,
  perpValueUSD: number,
  margin: number
): number => {
  const spotValue = spotBalance * (perpValueUSD / Math.abs(perpPosition) || 0);
  return margin + spotValue;
};

export const calculatePositionValue = (
  spotBalance: number,
  perpPosition: number,
  perpValueUSD: number,
): number => {
  const spotValue = spotBalance * (perpValueUSD / Math.abs(perpPosition) || 0);
  return perpValueUSD + spotValue;
};

/**
 * Calculate hedge strategy breakdown for HedgeForm
 */
export const calculateHedgeStrategy = (
  hedgeValue: number,
  leverage: number,
  currentPrice: number,
  fundingRate: number = 0
): HedgeCalculation => {
  // Répartition: Spot + Short
  const spotAmount = hedgeValue * (leverage / (leverage + 1));
  const shortMargin = hedgeValue - spotAmount;
  const shortNotional = shortMargin * leverage;

  // Taille de la position short en tokens
  const positionSize = shortNotional / currentPrice;

  // Prix de liquidation pour position short
  // Formule: prix_liquidation = prix_entrée * (1 + (marge / notional))
  const liquidationPrice = currentPrice * (1 + (shortMargin / shortNotional));

  // Rendement annualisé basé sur le funding rate
  const annualizedReturn = fundingRate * 24 * 365 * 100;

  return {
    hedgeValue,
    leverage,
    spotAmount,
    shortMargin,
    shortNotional,
    liquidationPrice,
    positionSize,
    annualizedReturn,
  };
};

/**
 * Get current market price from position data
 */
export const getCurrentPrice = (
  perpValueUSD: number,
  perpPosition: number
): number => {
  return Math.abs(perpPosition) > 0 ? Math.abs(perpValueUSD / perpPosition) : 0;
};

/**
 * Calculate position adjustment needed to reach target allocation
 */
export interface PositionAdjustment {
  symbol: string;
  spotAdjustment: number; // Positive = acheter, négatif = vendre
  perpAdjustment: number; // Positive = augmenter short, négatif = diminuer short
  targetPerpLeverage: number; // Nouvelle valeur de levier si ajustement de levier
  targetSpotBalance: number;
  targetPerpPosition: number;
  liquidationPrice: number;
  adjustmentType: 'increase' | 'decrease' | 'rebalance';
}

/**
 * Calculate spot position adjustment without perp hedge for unhedged positions
 */
export interface SpotPositionAdjustment {
  symbol: string;
  spotAdjustment: number; // Positive = acheter, négatif = vendre
  targetSpotBalance: number;
  currentSpotBalance: number;
  adjustmentType: 'increase' | 'decrease' | 'maintain';
  targetValueUSD: number;
  currentValueUSD: number;
}

export const calculateSpotPositionAdjustment = (
  symbol: string,
  currentSpotBalance: number,
  currentValueUSD: number,
  targetAllocationPercent: number,
  totalPortfolioValue: number,
  currentPrice: number
): SpotPositionAdjustment => {
  // Calculer la valeur cible en USD
  const targetValueUSD = (targetAllocationPercent / 100) * totalPortfolioValue;
  
  // Calculer la balance spot cible
  const targetSpotBalance = targetValueUSD / currentPrice;
  
  // Calculer l'ajustement nécessaire
  const spotAdjustment = targetSpotBalance - currentSpotBalance;
  
  // Déterminer le type d'ajustement
  let adjustmentType: 'increase' | 'decrease' | 'maintain';
  if (targetValueUSD > currentValueUSD * 1.05) {
    adjustmentType = 'increase';
  } else if (targetValueUSD < currentValueUSD * 0.95) {
    adjustmentType = 'decrease';
  } else {
    adjustmentType = 'maintain';
  }

  return {
    symbol,
    spotAdjustment,
    targetSpotBalance,
    currentSpotBalance,
    adjustmentType,
    targetValueUSD,
    currentValueUSD,
  };
};

export const calculatePositionAdjustment = (
  currentPosition: HedgePositionSummary,
  targetAllocationPercent: number,
  targetPerpLeverage: number,
  totalPortfolioValue: number,
  currentPrice: number
): PositionAdjustment => {
  // Calculer la valeur actuelle de la position
  const currentValue = calculatePositionValueRequied(
    currentPosition.spotBalance,
    currentPosition.perpPosition,
    currentPosition.perpValueUSD,
    currentPosition.margin
  );

  // Calculer la valeur cible
  const targetValue = (targetAllocationPercent / 100) * totalPortfolioValue;
  
  // Calculer la nouvelle répartition avec le même levier
  const leverage = targetPerpLeverage || currentPosition.leverage;
  const targetBreakdown = calculateHedgePositionFromAllocation(
    targetAllocationPercent,
    totalPortfolioValue,
    currentPrice,
    leverage
  );
console.log('Target Breakdown:', targetBreakdown);
  // Calculer les ajustements nécessaires
  const spotAdjustment = targetBreakdown.spotBalance - currentPosition.spotBalance;
  const perpAdjustment = targetBreakdown.perpPosition - currentPosition.perpPosition;

  // Déterminer le type d'ajustement
  let adjustmentType: 'increase' | 'decrease' | 'rebalance';
  if (targetValue > currentValue * 1.05) {
    adjustmentType = 'increase';
  } else if (targetValue < currentValue * 0.95) {
    adjustmentType = 'decrease';
  } else {
    adjustmentType = 'rebalance';
  }
  
  // Utiliser le prix de liquidation calculé dans targetBreakdown
  const liquidationPrice = targetBreakdown.liquidationPrice;

  return {
    symbol: currentPosition.symbol,
    spotAdjustment,
    perpAdjustment,
    targetSpotBalance: targetBreakdown.spotBalance,
    targetPerpPosition: targetBreakdown.perpPosition,
    adjustmentType,
    liquidationPrice,
    targetPerpLeverage: leverage,
  };
};
