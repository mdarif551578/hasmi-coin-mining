export type Transaction = {
  id: string;
  type: 'deposit' | 'withdraw' | 'mining' | 'task' | 'marketplace-sell' | 'marketplace-buy' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
};

export type MiningPlan = {
  id: string;
  name: string;
  rate: string; // e.g., "2 tokens/min"
  duration: string; // e.g., "10 days"
  price: number;
};

export type NftPlan = {
  id: string;
  name: string;
  cost: number;
  profit: number;
  duration: string; // e.g., "30 days"
};

export type User = {
    name: string;
    referralCode: string;
    walletBalance: number;
}
