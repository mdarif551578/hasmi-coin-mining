
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

    fetchCounts();

    // Setup listeners for real-time updates
    const unsubscribes = [
      onSnapshot(query(collection(db, 'deposits'), where('status', '==', 'pending')), () => fetchCounts()),
      onSnapshot(query(collection(db, 'withdrawals'), where('status', '==', 'pending')), () => fetchCounts()),
      onSnapshot(query(collection(db, 'exchange_requests'), where('status', '==', 'pending')), () => fetchCounts()),
      onSnapshot(query(collection(db, 'market_listings'), where('status', '==', 'pending')), () => fetchCounts()),
      onSnapshot(query(collection(db, 'buy_requests'), where('status', '==', 'pending')), () => fetchCounts()),
      onSnapshot(query(collection(db, 'task_submissions'), where('status', '==', 'pending')), () => fetchCounts()),
      onSnapshot(collection(db, 'users'), () => fetchCounts()),
    ];

    return () => unsubscribes.forEach(unsub => unsub());

  }, []);

  return { counts, loading };
}
