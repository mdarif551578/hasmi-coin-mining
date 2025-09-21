
export type Transaction = {
  id: string;
  type: 'deposit' | 'withdraw' | 'mining' | 'task' | 'marketplace-sell' | 'marketplace-buy' | 'referral' | 'nft-reward';
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
    walletBalance: number; // This will represent HC
    usdBalance: number; // This will represent USD
    totalReferrals: number;
    miningStatus: 'Active' | 'Inactive';
    isPro: boolean;
}

export type Task = {
  id: number;
  description: string;
  reward: number;
};

export type MarketListing = {
  id: string;
  seller: string;
  amount: number;
  rate: number;
  status: 'open' | 'sold' | 'pending';
}

export type WithdrawalRequest = {
  id: string;
  userId: string;
  amount: number;
  method: 'bkash' | 'nagad';
  accountInfo: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
};
