export type WalletType = 'freighter' | 'xbull' | 'albedo' | null;

export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Plan {
  id: string;
  merchant: string;
  title: string;
  description: string;
  priceXlm: number;
  intervalSecs: number;
  maxSubscribers: number;
  subscribersCount: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  subscriber: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  planTitle?: string;
  planPriceXlm?: number;
  merchant?: string;
}

export interface TransactionRecord {
  hash: string;
  amount: number;
  type: 'create_plan' | 'subscribe' | 'cancel' | 'withdraw';
  status: TransactionStatus;
  timestamp: number;
  sender: string;
  recipient?: string;
  planId?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: WalletType;
  balanceXlm: number;
  isConnecting: boolean;
  error: string | null;
}

export interface ContractConfig {
  network: string;
  sorobanRpcUrl: string;
  horizonUrl: string;
  subscriptionContractId: string;
  treasuryContractId: string;
}
