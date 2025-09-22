
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { Transaction } from '@/lib/types';

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
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);

    const allTransactions = new Map<string, Transaction>();
    const unsubscribes: (() => void)[] = [];

    const setupSubscription = (collName: string, config: any) => {
      const q = query(collection(db, collName), where(config.userIdField, '==', user.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const transaction: Transaction = {
            id: `${config.type}-${doc.id}`,
            type: config.type,
            amount: data[config.amountField],
            status: data.status,
            date: formatTimestamp(data.createdAt),
            currency: config.currency,
          };
          allTransactions.set(transaction.id, transaction);
        });

        const sortedTransactions = Array.from(allTransactions.values())
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setTransactions(sortedTransactions);
        setLoading(false);
      }, (error) => {
        console.error(`Error fetching ${collName}:`, error);
        setLoading(false);
      });
      unsubscribes.push(unsub);
    };

    // Standard transactions
    setupSubscription('deposits', { type: 'deposit', amountField: 'amount', currency: 'USD', userIdField: 'userId' });
    setupSubscription('withdrawals', { type: 'withdraw', amountField: 'amount', currency: 'USD', userIdField: 'userId' });
    setupSubscription('exchange_requests', { type: 'exchange', amountField: 'hcAmount', currency: 'HC', userIdField: 'userId' });

    // Referral bonuses (as referrer)
    setupSubscription('referral_bonuses', { type: 'referral', amountField: 'referrerBonus', currency: 'HC', userIdField: 'referrerId' });

    // Referral bonuses (as referee)
    setupSubscription('referral_bonuses', { type: 'referral', amountField: 'refereeBonus', currency: 'HC', userIdField: 'refereeId' });


    return () => {
      unsubscribes.forEach(unsub => unsub());
    };

  }, [user]);

  return { transactions, loading };
}
