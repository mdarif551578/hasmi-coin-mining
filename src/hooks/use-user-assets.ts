
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { PlanPurchaseRequest } from '@/lib/types';
import { useToast } from './use-toast';

export function useUserAssets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nfts, setNfts] = useState<PlanPurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const assetsQuery = query(
      collection(db, 'plan_purchases'),
      where('userId', '==', user.uid),
      where('planType', '==', 'nft'),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(assetsQuery, (snapshot) => {
      const fetchedNfts: PlanPurchaseRequest[] = [];
      snapshot.forEach((doc) => {
        fetchedNfts.push({ id: doc.id, ...doc.data() } as PlanPurchaseRequest);
      });
      setNfts(fetchedNfts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user NFT assets:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your NFT assets.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  return { nfts, loading };
}
