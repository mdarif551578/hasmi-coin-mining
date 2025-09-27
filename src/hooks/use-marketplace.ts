
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy, doc, updateDoc, limit, getDocs, startAfter, DocumentData, runTransaction, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import type { MarketListing, BuyRequest } from '@/lib/types';
import { useToast } from './use-toast';

const LISTINGS_PER_PAGE = 15;

export function useMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [userBuyRequests, setUserBuyRequests] = useState<BuyRequest[]>([]);
  const [allPendingBuyRequests, setAllPendingBuyRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [lastListing, setLastListing] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Query for all listings
    const listingsQuery = query(
      collection(db, 'market_listings'),
      orderBy('createdAt', 'desc'),
      limit(LISTINGS_PER_PAGE)
    );

    const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
      const fetchedListings: MarketListing[] = [];
      snapshot.forEach((doc) => {
        fetchedListings.push({ id: doc.id, ...doc.data() } as MarketListing);
      });
      setListings(fetchedListings);
      
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastListing(lastVisible);
      setHasMore(snapshot.docs.length === LISTINGS_PER_PAGE);

      setLoading(false);
    }, (error) => {
      console.error("Error fetching market listings:", error);
      setLoading(false);
    });
    
    // Query for all pending buy requests globally
    const allBuyRequestsQuery = query(
        collection(db, 'buy_requests'),
        where('status', '==', 'pending')
    );
    const unsubscribeAllBuyRequests = onSnapshot(allBuyRequestsQuery, (snapshot) => {
        const fetchedRequests: BuyRequest[] = [];
        snapshot.forEach((doc) => {
            fetchedRequests.push({ id: doc.id, ...doc.data()} as BuyRequest);
        });
        setAllPendingBuyRequests(fetchedRequests);
    });
    
    let unsubscribeUserBuyRequests = () => {};
    if (user) {
        // Query for the current user's buy requests
        const userBuyRequestsQuery = query(
            collection(db, 'buy_requests'),
            where('buyerId', '==', user.uid)
        );
        unsubscribeUserBuyRequests = onSnapshot(userBuyRequestsQuery, (snapshot) => {
            const fetchedRequests: BuyRequest[] = [];
            snapshot.forEach((doc) => {
                fetchedRequests.push({ id: doc.id, ...doc.data()} as BuyRequest);
            });
            fetchedRequests.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setUserBuyRequests(fetchedRequests);
        });
    }


    return () => {
        unsubscribeListings();
        unsubscribeUserBuyRequests();
        unsubscribeAllBuyRequests();
    };
  }, [user]);

  const loadMoreListings = useCallback(async () => {
    if (!lastListing || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextQuery = query(
        collection(db, 'market_listings'),
        orderBy('createdAt', 'desc'),
        startAfter(lastListing),
        limit(LISTINGS_PER_PAGE)
      );

      const snapshot = await getDocs(nextQuery);
      const newDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketListing));
      
      setListings(prev => [...prev, ...newDocs]);
      
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastListing(lastVisible);
      setHasMore(snapshot.docs.length === LISTINGS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more listings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch more offers.' });
    } finally {
      setLoadingMore(false);
    }
  }, [lastListing, hasMore, toast]);

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
  
  const buyOffer = async (listing: MarketListing, buyerUsdBalance: number) => {
     if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to buy an offer.' });
      return;
    }

    const totalPrice = listing.amount * listing.rate;
    if (totalPrice > buyerUsdBalance) {
        toast({ variant: 'destructive', title: 'Insufficient USD Balance', description: `You need $${totalPrice.toFixed(2)} to buy this offer.` });
        return;
    }
    
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, 'buy_requests'), {
            listingId: listing.id,
            buyerId: user.uid,
            sellerId: listing.sellerId,
            amount: listing.amount,
            rate: listing.rate,
            totalPrice: totalPrice,
            status: 'pending',
            createdAt: serverTimestamp(),
        });

        toast({ title: 'Buy Request Submitted', description: 'Your request to buy this offer is pending admin approval.' });

    } catch (error) {
        console.error("Error creating buy request:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your buy request.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  const cancelOffer = async (listingId: string) => {
    setIsSubmitting(true);
    try {
        await deleteDoc(doc(db, 'market_listings', listingId));
        toast({ title: 'Offer Cancelled', description: 'Your sell offer has been cancelled.' });
    } catch (error) {
        console.error("Error cancelling offer:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not cancel your offer.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const cancelBuyRequest = async (request: BuyRequest) => {
    setIsSubmitting(true);
    try {
        const requestDocRef = doc(db, 'buy_requests', request.id);
        await deleteDoc(requestDocRef);
        toast({ title: 'Buy Request Cancelled', description: 'Your buy request has been successfully cancelled.' });
    } catch (error) {
        console.error("Error cancelling buy request:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not cancel your buy request.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return { listings, userBuyRequests, allPendingBuyRequests, loading, createOffer, isSubmitting, buyOffer, hasMore, loadMoreListings, loadingMore, cancelOffer, cancelBuyRequest };
}
