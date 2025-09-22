
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

function formatTimestamp(timestamp: any): string {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'yyyy-MM-dd');
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);

    const collectionsToQuery = {
      deposits: { type: 'deposit', amountField: 'amount', currency: 'USD' },
      withdrawals: { type: 'withdraw', amountField: 'amount', currency: 'USD' },
      exchange_requests: { type: 'exchange', amountField: 'hcAmount', currency: 'HC' },
      referral_bonuses_referrer: { type: 'referral', amountField: 'referrerBonus', currency: 'HC', userIdField: 'referrerId' },
      referral_bonuses_referee: { type: 'referral', amountField: 'refereeBonus', currency: 'HC', userIdField: 'refereeId' },
    };

    const unsubscribes = Object.entries(collectionsToQuery).map(([collectionName, config]) => {
      const collName = collectionName.split('_')[0]; // 'referral_bonuses' for both
      const userIdField = config.userIdField || 'userId';

      const q = query(
        collection(db, collName),
        where(userIdField, '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const fetchedTransactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: config.type,
            amount: data[config.amountField],
            status: data.status,
            date: formatTimestamp(data.createdAt),
            currency: config.currency,
          } as Transaction;
        });
        
        setTransactions(prev => {
            // Filter out old transactions from this source
            const otherTransactions = prev.filter(t => t.type !== config.type);
            // Combine with new ones
            const all = [...otherTransactions, ...fetchedTransactions];
            // Sort all transactions by date
            all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return all;
        });

      }, (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
      });
    });

    const initialLoadTimer = setTimeout(() => setLoading(false), 2000); // Give time for queries to run

    return () => {
        unsubscribes.forEach(unsub => unsub());
        clearTimeout(initialLoadTimer);
    };

  }, [user]);

  return { transactions, loading };
}
