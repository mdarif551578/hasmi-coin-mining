

import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  type: 'deposit' | 'withdraw' | 'mining' | 'task' | 'marketplace-sell' | 'marketplace-buy' | 'referral' | 'nft-reward' | 'exchange';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'approved' | 'rejected' | 'sold';
  date: string;
  currency?: 'USD' | 'HC';
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

export type AppTask = {
  id: string;
  title: string;
  reward: number;
  link: string;
  isActive: boolean;
  createdAt: Timestamp;
  description?: string;
  imageUrls?: string[];
};

export type TaskSubmission = {
    id: string;
    userId: string;
    taskId: string;
    screenshotUrls: string[];
    submissionText: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
    taskTitle?: string;
    taskReward?: number;
    user?: {
      displayName: string;
      email: string;
    }
};


export type MarketListing = {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number; // HC
  rate: number; // USD per HC
  status: 'pending' | 'open' | 'sold' | 'cancelled';
  createdAt: any;
  totalPrice?: number;
  fee?: number;
};

export type BuyRequest = {
    id: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    rate: number;
    totalPrice: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}

export type DepositRequest = {
  id: string;
  userId: string;
  amount: number; // USD amount
  method: 'bkash' | 'nagad';
  phoneNumber: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
};

export type WithdrawalRequest = {
  id: string;
  userId: string;
  amount: number;
  method: 'bkash' | 'nagad';
  accountInfo: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  createdAt?: any;
};

export type ExchangeRequest = {
    id: string;
    userId: string;
    usdAmount: number;
    hcAmount: number;
    rate: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}

export type Message = {
    id: string;
    text: string;
    senderId: string; // 'admin' or user's UID
    timestamp: any;
    isRead: boolean;
    userId?: string;
}

export type ReferralBonus = {
    id?: string;
    referrerId: string;
    refereeId: string;
    referrerBonus: number;
    refereeBonus: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}

export type MiningClaim = {
  id?: string;
  userId: string;
  amount: number;
  createdAt: any;
}
