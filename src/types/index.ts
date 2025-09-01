export interface User {
  id: string;
  address: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  totalValue: number;
  activePositions: number;
}

export interface HedgePosition {
  id: string;
  userId: string;
  symbol: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  fundingEarned: number;
  status: "active" | "closed" | "liquidated";
  createdAt: Date;
  updatedAt: Date;
  perpSide: "long" | "short";
  spotAmount: number;
}

export interface FundingRate {
  id: string;
  symbol: string;
  fundingRate: number;
  nextFunding: string;
  markPrice: number;
  volume24h: number;
  openInterest: number;
  indexPrice: number;
  fundingTime: number;
  perpIndex: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  fundingRate: number;
  openInterest: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

export interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
  icon?: React.ReactNode;
}

export interface PositionMetrics {
  totalValue: number;
  totalPnl: number;
  totalFundingEarned: number;
  activePositions: number;
  avgYield: number;
}

export interface RiskMetrics {
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  beta: number;
}

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

export interface OrderResponse {
  oid: string;
  status: "pending" | "filled" | "cancelled" | "rejected";
  filled?: boolean;
  size?: number;
  price?: number;
}

export interface HedgePositionResponse {
  success: boolean;
  spotOrder?: OrderResponse;
  perpOrder?: OrderResponse;
  message?: string;
}

export interface HedgePositionSummary {
  symbol: string;
  spotBalance: number;
  perpPosition: number;
  leverage: number;
  margin: number;
  perpValueUSD: number;
}

export interface HyperliquidConfig {
  isTestnet: boolean;
  subAccountAddress?: string;
  apiWalletPrivateKey?: string;
}