// ==========================================
// NEPSE Intelligence AI - Master Type System
// ==========================================

export type Sector =
  | "Commercial Banks"
  | "Development Banks"
  | "Finance"
  | "Hotels And Tourism"
  | "Hydro Power"
  | "Investment"
  | "Life Insurance"
  | "Manufacturing And Processing"
  | "Microfinance"
  | "Non Life Insurance"
  | "Others"
  | "Tradings"
  | "Mutual Fund";

export interface Company {
  symbol: string;
  name: string;
  sector: Sector;
  listedShares: number;
  paidUpCapital: number; // in NPR
  eps: number;
  bookValue: number;
  pe: number;
  pb: number;
  roe: number;
  roa: number;
  dividendYield: number;
  high52: number;
  low52: number;
}

export interface MarketPrice {
  symbol: string;
  name: string;
  sector: Sector;
  ltp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  turnover: number;
  transactions: number;
  marketCap: number; // in NPR Crores
  high52: number;
  low52: number;
  timestamp: string;
  status: "OPEN" | "CLOSED" | "PRE_OPEN";
}

export interface MarketIndex {
  name: string;
  current: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  turnover: number;
}

export interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
  totalTurnover: number;
  totalTradedShares: number;
  totalTransactions: number;
  asOf: string;
}

// ------------------------------------------
// Portfolio & Transactions
// ------------------------------------------

export type TransactionType =
  | "BUY"
  | "SELL"
  | "IPO"
  | "RIGHTS"
  | "BONUS"
  | "DIVIDEND"
  | "AUCTION"
  | "TRANSFER";

export interface Transaction {
  id: string;
  portfolioId: string;
  symbol: string;
  companyName: string;
  type: TransactionType;
  date: string;
  quantity: number;
  price: number; // Gross price per share
  grossAmount: number;
  brokerCommission: number;
  sebonFee: number;
  dpFee: number;
  cgtRate?: number; // 0.05 or 0.075 for sales
  capitalGainsTax?: number;
  totalCharges: number;
  netAmount: number; // Total Paid (BUY) or Net Received (SELL)
  waccAtTime?: number;
  realizedPL?: number;
  notes?: string;
  createdAt: string;
}

export interface Holding {
  symbol: string;
  companyName: string;
  sector: Sector;
  quantity: number;
  wacc: number; // Weighted Average Cost per share
  totalInvested: number;
  currentLtp: number;
  currentMarketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  realizedPL: number;
  breakEvenPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  allocationPercent: number;
  aiSuggestedAction: SignalType;
  aiConfidence: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PortfolioSummary {
  portfolioId: string;
  portfolioName: string;
  totalInvested: number;
  currentMarketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  realizedPL: number;
  totalDividends: number;
  totalExpenses: number;
  netReturn: number;
  netReturnPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  cashBalance: number;
  holdingsCount: number;
  topGainer?: { symbol: string; gainPercent: number };
  topLoser?: { symbol: string; lossPercent: number };
}

// ------------------------------------------
// Calculator Types
// ------------------------------------------

export interface BuyCalculation {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  grossAmount: number;
  brokerCommission: number;
  brokerCommissionRate: number;
  sebonFee: number;
  dpFee: number;
  totalCharges: number;
  totalPayable: number;
  effectiveCostPerShare: number;
}

export interface SellCalculation {
  symbol: string;
  quantity: number;
  sellingPrice: number;
  purchaseWacc: number;
  holdingDays: number;
  isIndividual: boolean;
  grossAmount: number;
  brokerCommission: number;
  brokerCommissionRate: number;
  sebonFee: number;
  dpFee: number;
  capitalGain: number;
  cgtRate: number;
  cgtAmount: number;
  totalCharges: number;
  netReceivable: number;
  netProfitLoss: number;
  returnPercent: number;
}

// ------------------------------------------
// Technical & Quantitative Scanners
// ------------------------------------------

export type ScannerType =
  | "CONSOLIDATING_UP_BREAKOUT"
  | "CONSOLIDATING_DOWN_BREAKOUT"
  | "INSIDE_BAR_UP"
  | "INSIDE_BAR_DOWN"
  | "TRENDING_STOCKS"
  | "MOMENTUM_SIGNAL"
  | "TREND_RELAY"
  | "REVERSAL_SIGNAL"
  | "INTELLIGENT_AVERAGING";

export interface ScannerResult {
  id: string;
  symbol: string;
  companyName: string;
  sector: Sector;
  scannerType: ScannerType;
  scannerTitle: string;
  ltp: number;
  changePercent: number;
  signalConfidence: number; // 0-100%
  entryZone: { min: number; max: number };
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: number;
  volumeRatio: number; // vs 20-day SMA
  timeframe: "Daily" | "Weekly";
  reasons: string[];
  invalidationLevel: number;
  detectedAt: string;
}

// ------------------------------------------
// AI Recommendation Engine
// ------------------------------------------

export type SignalType =
  | "STRONG_BUY"
  | "BUY"
  | "ACCUMULATE"
  | "HOLD"
  | "REDUCE"
  | "SELL"
  | "AVOID"
  | "WATCHLIST"
  | "AVERAGE_DOWN"
  | "AVERAGE_UP"
  | "NO_TRADE";

export interface AIRecommendation {
  symbol: string;
  companyName: string;
  sector: Sector;
  currentPrice: number;
  signal: SignalType;
  horizon: "Short-term (1-4 weeks)" | "Medium-term (1-3 months)" | "Long-term (6-12 months)";
  confidenceScore: number; // 0 - 100
  entryRange: { min: number; max: number };
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  technicalThesis: string;
  fundamentalThesis: string;
  marketRegime: "Strong Bullish" | "Weak Bullish" | "Sideways" | "Bearish" | "High Volatility Compression";
  positiveFactors: string[];
  negativeFactors: string[];
  invalidationConditions: string[];
  timestamp: string;
  modelVersion: string;
}

// ------------------------------------------
// Trading Journal
// ------------------------------------------

export interface JournalEntry {
  id: string;
  symbol: string;
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  strategy: string;
  setupType: string;
  emotionAtEntry: "Disciplined" | "FOMO" | "Excited" | "Anxious" | "Revenge";
  emotionAtExit?: "Disciplined" | "Panic Sold" | "Greedy" | "Satisfied" | "Frustrated";
  confidenceRating: number; // 1-5
  lessonsLearned?: string;
  pl?: number;
  plPercent?: number;
  isClosed: boolean;
}

// ------------------------------------------
// Sentiment & News
// ------------------------------------------

export interface MarketSentiment {
  score: number; // 0 (Extreme Fear) to 100 (Extreme Greed)
  status: "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  bullishPercent: number;
  bearishPercent: number;
  buyingPressureRatio: number;
  volumeImbalance: number;
  unusualActivityCount: number;
  lastUpdated: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: "ShareSansar" | "Bizmandu" | "NEPSE Alpha" | "MeroLagani" | "NEPSE Disclosure";
  url: string;
  publishedAt: string;
  sentiment: "Bullish" | "Neutral" | "Bearish";
  impactScore: number; // 1 - 5
  relatedSymbols: string[];
  sector?: Sector;
  isVerified: boolean;
}

// ------------------------------------------
// Watchlist & Alerts
// ------------------------------------------

export interface WatchlistItem {
  id: string;
  symbol: string;
  targetPrice?: number;
  stopLossPrice?: number;
  rsiAlertUpper?: number;
  rsiAlertLower?: number;
  notes?: string;
  addedAt: string;
}

// ------------------------------------------
// Admin & RBAC
// ------------------------------------------

export type UserRole = "Super Admin" | "Admin" | "Financial Analyst" | "Trader" | "Free User";

export interface FeeSchedule {
  effectiveDate: string;
  sebonFeeRate: number; // 0.00015
  dpFee: number; // 25
  slabs: Array<{
    maxAmount: number;
    rate: number;
  }>;
  cgtShortTermRate: number; // 0.075
  cgtLongTermRate: number; // 0.05
}
