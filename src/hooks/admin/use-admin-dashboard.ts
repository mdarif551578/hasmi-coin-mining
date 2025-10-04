
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useAdminDashboard() {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingExchanges: 0,
    pendingListings: 0,
    pendingBuyRequests: 0,
    pendingTaskSubmissions: 0,
    pendingPlanPurchases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const collectionsToCount = {
          totalUsers: collection(db, 'users'),
          pendingDeposits: query(collection(db, 'deposits'), where('status', '==', 'pending')),
          pendingWithdrawals: query(collection(db, 'withdrawals'), where('status', '==', 'pending')),
          pendingExchanges: query(collection(db, 'exchange_requests'), where('status', '==', 'pending')),
          pendingListings: query(collection(db, 'market_listings'), where('status', '==', 'pending')),
          pendingBuyRequests: query(collection(db, 'buy_requests'), where('status', '==', 'pending')),
          pendingTaskSubmissions: query(collection(db, 'task_submissions'), where('status', '==', 'pending')),
          pendingPlanPurchases: query(collection(db, 'plan_purchases'), where('status', '==', 'pending')),
        };

        const promises = Object.entries(collectionsToCount).map(async ([key, coll]) => {
          const snapshot = await getCountFromServer(coll);
          return { [key]: snapshot.data().count };
        });

        const results = await Promise.all(promises);
        const newCounts = results.reduce((acc, current) => ({ ...acc, ...current }), {});
        
        setCounts(newCounts as any);
      } catch (error) {
        console.error("Error fetching admin dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCounts();

    // Setup listeners for real-time updates on pending counts
    const createListener = (collectionName: string, stateKey: keyof typeof counts) => {
      const q = query(collection(db, collectionName), where('status', '==', 'pending'));
      return onSnapshot(q, (snapshot) => {
        setCounts(prev => ({ ...prev, [stateKey]: snapshot.size }));
      });
    };
    
    const unsubs = [
      createListener('deposits', 'pendingDeposits'),
      createListener('withdrawals', 'pendingWithdrawals'),
      createListener('exchange_requests', 'pendingExchanges'),
      createListener('market_listings', 'pendingListings'),
      createListener('buy_requests', 'pendingBuyRequests'),
      createListener('task_submissions', 'pendingTaskSubmissions'),
      createListener('plan_purchases', 'pendingPlanPurchases'),
      // For total users, a full recount is still best
      onSnapshot(collection(db, 'users'), () => {
         getCountFromServer(collection(db, 'users')).then(snap => {
           setCounts(prev => ({ ...prev, totalUsers: snap.data().count }));
         })
      }),
    ];

    return () => unsubs.forEach(unsub => unsub());

  }, []);

  return { counts, loading };
}
