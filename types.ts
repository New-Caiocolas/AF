
export enum AssetCategory {
  CRYPTO = 'Crypto',
  FII = 'FII'
}

export type TransactionType = 'buy' | 'sell' | 'dividend';
export type TransactionSource = 'new_money' | 'reinvestment';

export interface Transaction {
  id: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  date: string;
  source: TransactionSource;
}

export interface Asset {
  id: string;
  ticker: string;
  category: AssetCategory;
  sector: string;
  averagePrice: number;
  totalQuantity: number;
  targetAllocation?: number;
  transactions: Transaction[];
  // View specific properties (fetched from live APIs)
  currentPrice: number;
  dailyChange: number;
  provDividend?: number;
  // Market metrics from simulated/real-time sources
  dy?: number;
  pvp?: number;
  vacancy?: number;
}

export interface MarketResponse {
  assets: Asset[];
  errorOccurred: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  riskProfile: 'conservador' | 'moderado' | 'arrojado';
  preferredCurrency: 'BRL' | 'USD';
  wallet: Asset[];
}

export type DataSource = 'simulated' | 'realtime';
