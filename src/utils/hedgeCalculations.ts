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
  
  return {
    totalValue,
    spotValue,
    perpValue: shortNotional,
    spotBalance,
    perpPosition,
    margin: shortMargin,
    leverage
  };
};

/**
 * Calculate current position value from spot and perp components
 */
export const calculatePositionValue = (
  spotBalance: number,
  perpPosition: number,
  perpValueUSD: number,
  margin: number
): number => {
  const spotValue = spotBalance * (perpValueUSD / Math.abs(perpPosition) || 0);
  return margin + spotValue;
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

  // Prix de liquidation approximatif (simplifié)
  const liquidationPrice = currentPrice * (1 + (1 / leverage) * 0.9);

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
