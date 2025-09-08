export interface User {
  id: string;
  address: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  totalValue: number;
  activePositions: number;
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
  liquidationPx: number;
  perpValueUSD: number;
  status?: string;
}

export interface HyperliquidConfig {
  isTestnet: boolean;
  subAccountAddress?: `0x${string}`;
  apiWalletPrivateKey?: string;
}

// Types Hyperliquid API
export interface HLSpotToken {
  name: string;
  index: number;
  isCanonical: boolean;
  szDecimals: number;
}

export interface HLSpotUniverse {
  tokens: number[];
  index: number;
  isCanonical: boolean;
}

export interface HLSpotMeta {
  tokens: HLSpotToken[];
  universe: HLSpotUniverse[];
}

export interface HLSpotMetaAndAssetCtxs {
  0: HLSpotMeta;
}

export interface HLAssetContext {
  dayNtlVlm: string;
  funding: string;
  markPx: string;
  midPx?: string;
  oraclePx: string;
  openInterest: string;
  prevDayPx: string;
}

export interface HLPerpsUniverse {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated: boolean;
  isDelisted?: boolean;
}

export interface HLMetaAndAssetCtxs {
  0: { universe: HLPerpsUniverse[] };
  1: HLAssetContext[];
}

export interface HLUserFunding {
  time: number;
  coin: string;
  usdc: string;
  szi: string;
  delta: {
    type: string;
    usdc: string;
  };
}

export interface HLBalance {
  coin: string;
  hold: string;
  total: string;
}

export interface HLSpotClearinghouseState {
  balances: HLBalance[];
}

export interface HLPosition {
  coin: string;
  szi: string;
  positionValue: string;
  returnOnEquity: string;
  leverage: {
    type: string;
    value: string;
  };
  maxTradeSzs: string[];
  marginUsed: string;
  unrealizedPnl: string;
  cumFunding: {
    allTime: string;
    sinceOpen: string;
  };
}

export interface HLClearinghouseState {
  assetPositions: Array<{
    position: HLPosition;
    type: string;
  }>;
  crossMaintenanceMarginUsed: string;
  crossMarginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  marginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
  time: number;
  withdrawable: string;
}

export interface HLOpenOrder {
  coin: string;
  side: string;
  limitPx: string;
  sz: string;
  oid: number;
  timestamp: number;
  origSz: string;
  cloid?: string;
}

export interface HLFundingHistory {
  coin: string;
  fundingRate: string;
  premium: string;
  time: number;
}