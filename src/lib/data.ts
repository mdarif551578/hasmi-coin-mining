import type { Transaction, MiningPlan, NftPlan, User, Task } from './types';

export const user: User = {
    name: "Hasmi",
    referralCode: "HASMI-A1B2C3",
    walletBalance: 1234.56,
};

export const transactions: Transaction[] = [
  { id: '1', type: 'deposit', amount: 500, status: 'completed', date: '2024-07-20' },
  { id: '2', type: 'mining', amount: 10.5, status: 'completed', date: '2024-07-20' },
  { id: '3', type: 'withdraw', amount: 100, status: 'pending', date: '2024-07-19' },
  { id: '4', type: 'task', amount: 5, status: 'completed', date: '2024-07-19' },
  { id: '5', type: 'marketplace-sell', amount: 50, status: 'completed', date: '2024-07-18' },
  { id: '6', type: 'referral', amount: 20, status: 'completed', date: '2024-07-17' },
];

export const paidPlans: MiningPlan[] = [
    { id: 'p1', name: 'Starter Miner', rate: '0.5 HC/hr', duration: '30 days', price: 10 },
    { id: 'p2', name: 'Pro Miner', rate: '2 HC/hr', duration: '30 days', price: 35 },
    { id: 'p3', name: 'Mega Miner', rate: '10 HC/hr', duration: '60 days', price: 150 },
];

export const nftPlans: NftPlan[] = [
    { id: 'n1', name: 'Bronze NFT', cost: 5, profit: 7.5, duration: '30 days' },
    { id: 'n2', name: 'Silver NFT', cost: 20, profit: 35, duration: '45 days' },
    { id: 'n3', name: 'Gold NFT', cost: 100, profit: 200, duration: '60 days' },
];

export const tasks: Task[] = [
  { id: 1, description: "Follow us on Twitter", reward: 5 },
  { id: 2, description: "Join our Telegram channel", reward: 5 },
  { id: 3, description: "Watch a tutorial video", reward: 2 },
];