
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { Transaction } from '@/lib/types';

const TRANSACTIONS_PER_PAGE = 20; // Fetch a decent number of items from each source

function formatTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    return new Date(timestamp).toISOString();
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
    }

    setLoading(true);

    const collectionsToQuery = [
        { name: 'deposits', config: { type: 'deposit', amountField: 'amount', currency: 'USD' }},
        { name: 'withdrawals', config: { type: 'withdraw', amountField: 'amount', currency: 'USD' }},
        { name: 'exchange_requests', config: { type: 'exchange', amountField: 'hcAmount', currency: 'HC' }},
        { name: 'task_submissions', config: { type: 'task', amountField: 'reward', currency: 'HC', statusField: 'status', statusValue: 'approved' }},
        { name: 'mining_claims', config: { type: 'mining', amountField: 'amount', currency: 'HC' }},
    ];

    const unsubscribers: (() => void)[] = [];
    let allTransactions: Transaction[] = [];

    const processAndSetTransactions = () => {
        // Sort all collected transactions by date and take the most recent ones
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(allTransactions.slice(0, TRANSACTIONS_PER_PAGE * 2)); // Keep a reasonable total
        setLoading(false);
    };

    collectionsToQuery.forEach(({ name, config }) => {
        const constraints = [where('userId', '==', user.uid)];
        if (config.statusField) {
            constraints.push(where(config.statusField, '==', config.statusValue));
        }
        
        const q = query(collection(db, name), ...constraints, orderBy('createdAt', 'desc'), limit(TRANSACTIONS_PER_PAGE));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => {
                 const data = doc.data();
                 return {
                    id: `${config.type}-${doc.id}`,
                    type: config.type as Transaction['type'],
                    amount: data[config.amountField],
                    status: data.status,
                    date: formatTimestamp(data.createdAt),
                    currency: config.currency as 'USD' | 'HC',
                 }
            });
            
            // Remove old entries from this source and add new ones
            allTransactions = allTransactions.filter(tx => !tx.id.startsWith(config.type));
            allTransactions.push(...fetchedTransactions);
            processAndSetTransactions();
        });
        unsubscribers.push(unsubscribe);
    });

    // Handle P2P Marketplace transactions (a bit more complex)
    const handleP2PTransactions = () => {
        const buyerQuery = query(
            collection(db, 'buy_requests'),
            where('buyerId', '==', user.uid),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'),
            limit(TRANSACTIONS_PER_PAGE)
        );

        const sellerQuery = query(
            collection(db, 'buy_requests'),
            where('sellerId', '==', user.uid),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'),
            limit(TRANSACTIONS_PER_PAGE)
        );

        const unsubBuyer = onSnapshot(buyerQuery, (snapshot) => {
            const buyerTransactions: Transaction[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: `marketplace-buy-${doc.id}`,
                    type: 'marketplace-buy',
                    amount: data.amount, // User received HC
                    status: 'completed',
                    date: formatTimestamp(data.createdAt),
                    currency: 'HC'
                };
            });
            allTransactions = allTransactions.filter(tx => !tx.id.startsWith('marketplace-buy'));
            allTransactions.push(...buyerTransactions);
            processAndSetTransactions();
        });

        const unsubSeller = onSnapshot(sellerQuery, (snapshot) => {
            const sellerTransactions: Transaction[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: `marketplace-sell-${doc.id}`,
                    type: 'marketplace-sell',
                    amount: data.totalPrice, // User received USD
                    status: 'completed',
                    date: formatTimestamp(data.createdAt),
                    currency: 'USD'
                };
            });
            allTransactions = allTransactions.filter(tx => !tx.id.startsWith('marketplace-sell'));
            allTransactions.push(...sellerTransactions);
            processAndSetTransactions();
        });
        
        unsubscribers.push(unsubBuyer, unsubSeller);
    };

    handleP2PTransactions();

    return () => unsubscribers.forEach(unsub => unsub());

  }, [user]);

  // hasMore and loadMore are no longer needed with real-time listeners and simplified logic
  return { transactions, loading, loadMore: () => {}, hasMore: false };
}
