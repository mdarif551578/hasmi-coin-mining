
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, runTransaction, writeBatch, getDoc, collection, query, where, getDocs, increment } from 'firebase/firestore';
import { useToast } from '../use-toast';
import type { BuyRequest, MarketListing } from '@/lib/types';

export function useAdminActions() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleRequest = async (collectionName: string, docId: string, action: 'approved' | 'rejected', updateData?: Record<string, any>) => {
        setLoading(true);
        try {
            const docRef = doc(db, collectionName, docId);
            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(docRef);
                if (!docSnap.exists()) {
                    throw new Error("Document does not exist!");
                }
                const data = docSnap.data();

                // Base update
                transaction.update(docRef, { status: action });

                if (action === 'approved' && updateData) {
                    const userRef = doc(db, 'users', data.userId);
                    transaction.update(userRef, updateData);
                }
            });
            toast({ title: 'Success', description: `Request has been ${action}.` });
        } catch (error: any) {
            console.error(`Error handling request:`, error);
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleMarketListing = async (listingId: string, action: 'open' | 'rejected') => {
        setLoading(true);
        try {
            const listingRef = doc(db, 'market_listings', listingId);
            await runTransaction(db, async (transaction) => {
                 const listingDoc = await transaction.get(listingRef);
                 if (!listingDoc.exists()) throw new Error("Listing not found.");

                if (action === 'rejected') {
                     transaction.update(listingRef, { status: 'cancelled' });
                } else {
                     transaction.update(listingRef, { status: 'open' });
                }
            });
             toast({ title: 'Success', description: `Listing status updated to ${action}.` });
        } catch (error: any) {
             console.error(`Error handling market listing:`, error);
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }
    
    const handleBuyRequest = async (request: BuyRequest, action: 'approved' | 'rejected') => {
        setLoading(true);
        try {
            const requestRef = doc(db, 'buy_requests', request.id);
            const listingRef = doc(db, 'market_listings', request.listingId);
            const sellerRef = doc(db, 'users', request.sellerId);
            const buyerRef = doc(db, 'users', request.buyerId);
            
            await runTransaction(db, async (transaction) => {
                const [reqDoc, listingDoc, sellerDoc, buyerDoc] = await Promise.all([
                    transaction.get(requestRef),
                    transaction.get(listingRef),
                    transaction.get(sellerRef),
                    transaction.get(buyerRef),
                ]);

                if (!reqDoc.exists() || !listingDoc.exists() || !sellerDoc.exists() || !buyerDoc.exists()) {
                    throw new Error("One or more required documents could not be found.");
                }

                if (action === 'rejected') {
                    transaction.update(requestRef, { status: 'rejected' });
                } else { // Approved
                    const sellerData = sellerDoc.data();
                    const buyerData = buyerDoc.data();
                    
                    if (buyerData.usd_balance < request.totalPrice) {
                        throw new Error("Buyer has insufficient USD balance.");
                    }
                     if (sellerData.wallet_balance < request.amount) {
                        throw new Error("Seller has insufficient HC balance.");
                    }

                    // Update balances
                    transaction.update(buyerRef, { 
                        usd_balance: increment(-request.totalPrice),
                        wallet_balance: increment(request.amount)
                    });
                    transaction.update(sellerRef, {
                        usd_balance: increment(request.totalPrice),
                        wallet_balance: increment(-request.amount)
                    });

                    // Update statuses
                    transaction.update(requestRef, { status: 'approved' });
                    transaction.update(listingRef, { status: 'sold' });
                }
            });
            toast({ title: 'Success', description: `Buy request has been ${action}.` });
        } catch (error: any) {
             console.error(`Error handling buy request:`, error);
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    const handleTaskSubmission = async (submissionId: string, action: 'approved' | 'rejected') => {
        setLoading(true);
        try {
             const submissionRef = doc(db, 'task_submissions', submissionId);

             await runTransaction(db, async (transaction) => {
                const submissionDoc = await transaction.get(submissionRef);
                if (!submissionDoc.exists()) throw new Error("Submission not found.");

                const submissionData = submissionDoc.data();
                transaction.update(submissionRef, { status: action });
                
                if (action === 'approved') {
                    const taskRef = doc(db, 'tasks', submissionData.taskId);
                    const taskDoc = await transaction.get(taskRef);
                    if (!taskDoc.exists()) throw new Error("Task not found.");
                    
                    const userRef = doc(db, 'users', submissionData.userId);
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists()) throw new Error("User not found.");

                    const reward = taskDoc.data().reward;
                    transaction.update(userRef, { wallet_balance: increment(reward) });
                }
             });

            toast({ title: 'Success', description: `Submission has been ${action}.` });
        } catch (error: any) {
            console.error(`Error handling task submission:`, error);
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };


    return { loading, handleRequest, handleMarketListing, handleBuyRequest, handleTaskSubmission };
}
