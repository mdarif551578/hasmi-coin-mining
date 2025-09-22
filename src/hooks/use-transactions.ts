
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

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

    const collectionsToQuery = {
      deposits: { type: 'deposit', amountField: 'amount', currency: 'USD' },
      withdrawals: { type: 'withdraw', amountField: 'amount', currency: 'USD' },
      exchange_requests: { type: 'exchange', amountField: 'hcAmount', currency: 'HC' },
      referral_bonuses_referrer: { type: 'referral', amountField: 'referrerBonus', currency: 'HC', userIdField: 'referrerId' },
      referral_bonuses_referee: { type: 'referral', amountField: 'refereeBonus', currency: 'HC', userIdField: 'refereeId' },
    };
    
    // Store all transactions in a single map to avoid duplicates and handle updates
    const allTransactions = new Map<string, Transaction>();

    const unsubscribes = Object.entries(collectionsToQuery).map(([collectionName, config]) => {
      const collName = collectionName.startsWith('referral_bonuses') ? 'referral_bonuses' : collectionName;
      const userIdField = config.userIdField || 'userId';

      // Query without server-side ordering to avoid composite index requirement
      const q = query(
        collection(db, collName),
        where(userIdField, '==', user.uid)
      );

      return onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const transaction: Transaction = {
            id: `${config.type}-${doc.id}`, // Create a unique ID for each transaction type
            type: config.type as Transaction['type'],
            amount: data[config.amountField],
            status: data.status,
            date: formatTimestamp(data.createdAt),
            currency: config.currency as Transaction['currency'],
          };
          allTransactions.set(transaction.id, transaction);
        });

        const sortedTransactions = Array.from(allTransactions.values())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setTransactions(sortedTransactions);

      }, (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
      });
    });

    const initialLoadTimer = setTimeout(() => setLoading(false), 2500); // Give time for queries to run

    return () => {
        unsubscribes.forEach(unsub => unsub());
        clearTimeout(initialLoadTimer);
    };

  }, [user]);

  return { transactions, loading };
}
