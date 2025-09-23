
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, startAfter, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { Transaction } from '@/lib/types';

const TRANSACTIONS_PER_PAGE = 10;

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
  const [hasMore, setHasMore] = useState(true);
  const [lastDocs, setLastDocs] = useState<Record<string, DocumentData | null>>({});

  const fetchTransactions = useCallback(async (isInitialLoad = false) => {
    if (!user) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);

    const collectionsToQuery = [
      { name: 'deposits', config: { type: 'deposit', amountField: 'amount', currency: 'USD', userIdField: 'userId' } },
      { name: 'withdrawals', config: { type: 'withdraw', amountField: 'amount', currency: 'USD', userIdField: 'userId' } },
      { name: 'exchange_requests', config: { type: 'exchange', amountField: 'hcAmount', currency: 'HC', userIdField: 'userId' } },
      { name: 'referral_bonuses_referrer', config: { type: 'referral', amountField: 'referrerBonus', currency: 'HC', userIdField: 'referrerId' } },
      { name: 'referral_bonuses_referee', config: { type: 'referral', amountField: 'refereeBonus', currency: 'HC', userIdField: 'refereeId' } },
    ];

    let newTransactions: Transaction[] = isInitialLoad ? [] : [...transactions];
    const newLastDocs = { ...lastDocs };
    let anyMore = false;

    for (const { name, config } of collectionsToQuery) {
      const collName = name.split('_')[0]; // Handle referral_bonuses_*
      
      let q = query(
        collection(db, collName),
        where(config.userIdField, '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(TRANSACTIONS_PER_PAGE)
      );

      if (!isInitialLoad && lastDocs[name]) {
        q = query(q, startAfter(lastDocs[name]));
      }

      const snapshot = await new Promise<QuerySnapshot<DocumentData>>((resolve, reject) => {
        const unsubscribe = onSnapshot(q, resolve, reject);
        // We only want the first result, not continuous updates for pagination
        // This is a simplified approach. For full realtime, this hook would be more complex.
      });

      if (snapshot.docs.length > 0) {
        snapshot.forEach(doc => {
          const data = doc.data();
          const transaction: Transaction = {
            id: `${config.type}-${doc.id}`,
            type: config.type,
            amount: data[config.amountField],
            status: data.status,
            date: formatTimestamp(data.createdAt),
            currency: config.currency,
          };
          // Avoid duplicates
          if (!newTransactions.some(t => t.id === transaction.id)) {
            newTransactions.push(transaction);
          }
        });

        newLastDocs[name] = snapshot.docs[snapshot.docs.length - 1];
        if (snapshot.docs.length === TRANSACTIONS_PER_PAGE) {
          anyMore = true;
        }
      }
    }
    
    // Sort all transactions together by date
    newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTransactions(newTransactions);
    setLastDocs(newLastDocs);
    setHasMore(anyMore);
    setLoading(false);
  }, [user, transactions, lastDocs]);

  useEffect(() => {
    // Initial fetch
    if (user) {
        fetchTransactions(true);
    } else {
        setTransactions([]);
        setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchTransactions(false);
    }
  };

  return { transactions, loading, loadMore, hasMore };
}
