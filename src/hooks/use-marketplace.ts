
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { MarketListing } from '@/lib/types';
import { useToast } from './use-toast';

export function useMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'market_listings'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedListings: MarketListing[] = [];
      snapshot.forEach((doc) => {
        fetchedListings.push({ id: doc.id, ...doc.data() } as MarketListing);
      });
      setListings(fetchedListings);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching market listings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createOffer = async ({ amount, rate, userBalance, userDisplayName }: { amount: number, rate: number, userBalance: number, userDisplayName: string }) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to create an offer.' });
      return;
    }

    if (amount > userBalance) {
      toast({ variant: 'destructive', title: 'Insufficient HC Balance', description: `You only have ${userBalance.toLocaleString()} HC available.` });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'market_listings'), {
        sellerId: user.uid,
        sellerName: userDisplayName,
        amount,
        rate,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Offer Submitted', description: 'Your sell offer is pending admin approval.' });
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create your offer. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const buyOffer = async (listing: MarketListing) => {
     // Placeholder for buy logic
     console.log("Attempting to buy:", listing);
     toast({ title: 'Coming Soon!', description: 'The ability to buy offers is under development.' });
  }

  return { listings, loading, createOffer, isSubmitting, buyOffer };
}
