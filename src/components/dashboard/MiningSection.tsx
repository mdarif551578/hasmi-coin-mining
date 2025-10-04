
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, Gem, ShoppingCart, Loader2, BadgeHelp, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { useUserData } from '@/hooks/use-user-data';
import { collection, serverTimestamp, updateDoc, addDoc, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import type { PlanPurchaseRequest } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


export function MiningSection() {
    const { toast } = useToast();
    const { settings, loading: settingsLoading } = useSettings();
    const { userData, loading: userLoading } = useUserData();
    const { user } = useAuth();
    const [isClaiming, setIsClaiming] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [pendingPlanPurchases, setPendingPlanPurchases] = useState<PlanPurchaseRequest[]>([]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'plan_purchases'), where('userId', '==', user.uid), where('status', '==', 'pending'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const purchases: PlanPurchaseRequest[] = [];
            snapshot.forEach(doc => {
                purchases.push({ id: doc.id, ...doc.data() } as PlanPurchaseRequest);
            });
            setPendingPlanPurchases(purchases);
        });
        return () => unsubscribe();
    }, [user]);

    const claimIntervalHours = settings?.mining?.claim_interval_hours || 2;
    const claimIntervalSeconds = claimIntervalHours * 60 * 60;
    const freeClaimReward = settings?.mining?.free_claim_reward || 0.5;

    const lastClaimTime = userData?.last_claim?.toDate()?.getTime() || 0;
    const now = new Date().getTime();
    const timeSinceLastClaim = Math.floor((now - lastClaimTime) / 1000);
    const timeUntilNextClaim = Math.max(0, claimIntervalSeconds - timeSinceLastClaim);

    const [timeRemaining, setTimeRemaining] = useState(timeUntilNextClaim);

    useEffect(() => {
        setTimeRemaining(timeUntilNextClaim);
        const timer = setInterval(() => {
            setTimeRemaining(prevTime => Math.max(0, prevTime - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeUntilNextClaim]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleClaim = async () => {
        if (!user || !userData) return;
        setIsClaiming(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                wallet_balance: (userData.wallet_balance || 0) + freeClaimReward,
                last_claim: serverTimestamp(),
            });

            toast({
                title: "Claim Successful!",
                description: `You've received ${freeClaimReward} Hasmi Coins.`,
            });
        } catch (error) {
            console.error("Error claiming reward:", error);
            toast({ variant: 'destructive', title: "Claim Failed", description: "Could not claim your reward." });
        } finally {
            setIsClaiming(false);
        }
    };
    
    const handlePurchase = async (plan: any, type: 'paid' | 'nft') => {
        if (!user || !userData) return;

        const cost = type === 'paid' ? plan.price : plan.cost;

        if (userData.usd_balance < cost) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Funds',
                description: `You need $${cost.toFixed(2)} to purchase this plan.`,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'plan_purchases'), {
                userId: user.uid,
                planId: plan.id,
                planName: plan.name,
                planType: type,
                cost: cost,
                profit: plan.profit,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            toast({
                title: 'Request Submitted',
                description: `Your request to purchase ${plan.name} is pending approval.`,
            });
        } catch (error) {
            console.error('Error purchasing plan:', error);
            toast({ variant: 'destructive', title: 'Request Failed', description: 'Could not submit your purchase request.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
     const cancelPurchase = async (purchaseId: string) => {
        setIsSubmitting(true);
        try {
            await deleteDoc(doc(db, 'plan_purchases', purchaseId));
            toast({ title: 'Request Cancelled', description: 'Your purchase request has been cancelled.' });
        } catch (error) {
            console.error('Error cancelling purchase:', error);
            toast({ variant: 'destructive', title: 'Cancellation Failed', description: 'Could not cancel your request.' });
        } finally {
            setIsSubmitting(false);
        }
    };


    const progress = ((claimIntervalSeconds - timeRemaining) / claimIntervalSeconds) * 100;
    const canClaim = timeRemaining === 0;
    const isLoading = settingsLoading || userLoading;

    return (
        <Card className="rounded-2xl w-full">
            <CardHeader>
                <CardTitle>Mining Plans</CardTitle>
                <CardDescription>Claim rewards and upgrade your mining capabilities.</CardDescription>
            </CardHeader>
            <CardContent>
                 {pendingPlanPurchases.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">My Pending Requests</h3>
                        <div className="space-y-2">
                            {pendingPlanPurchases.map(req => (
                                <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-sm">{req.planName}</p>
                                        <p className="text-xs text-muted-foreground">Cost: ${req.cost.toFixed(2)}</p>
                                    </div>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to cancel your purchase request for the {req.planName}?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Back</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => cancelPurchase(req.id)} className="bg-destructive hover:bg-destructive/90">Cancel Request</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <Tabs defaultValue="free" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger value="free" className="py-2 gap-1 text-xs"><Zap className="size-4" />Free</TabsTrigger>
                        <TabsTrigger value="paid" className="py-2 gap-1 text-xs"><ShoppingCart className="size-4" />Paid</TabsTrigger>
                        <TabsTrigger value="nft" className="py-2 gap-1 text-xs"><Gem className="size-4" />NFT</TabsTrigger>
                    </TabsList>
                    <TabsContent value="free" className="mt-4">
                        <Card className="bg-card-foreground/5 rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-base">Free Claim</CardTitle>
                                {isLoading ? <Skeleton className="h-5 w-48 mt-1" /> : <CardDescription>Claim your free Hasmi Coins every {claimIntervalHours} hours.</CardDescription>}
                            </CardHeader>
                             {isLoading ? (
                                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                             ) : (
                                <>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-center">Next claim available in:</p>
                                    <div className='relative w-[180px] h-[180px] mx-auto flex items-center justify-center'>
                                        <svg className="absolute w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                className="stroke-current text-secondary"
                                                fill="none"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                className="stroke-current text-primary transition-all duration-1000 ease-linear"
                                                fill="none"
                                                strokeWidth="2"
                                                strokeDasharray={`${progress}, 100`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <p className="text-3xl font-bold font-mono whitespace-nowrap">{formatTime(timeRemaining)}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full h-10" disabled={!canClaim || isClaiming} onClick={handleClaim}>
                                        {isClaiming ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2" />}
                                        Claim {freeClaimReward} HC
                                    </Button>
                                </CardFooter>
                                </>
                             )}
                        </Card>
                    </TabsContent>
                    <TabsContent value="paid" className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {isLoading ? Array.from({length: 2}).map((_,i) => <Skeleton key={i} className="h-48 w-full"/>) : settings?.mining?.paidPlans?.map((plan: any) => {
                                const isPending = pendingPlanPurchases.some(p => p.planId === plan.id);
                                const isCurrentPlan = userData?.mining_plan === plan.name;
                                return (
                                <Card key={plan.id} className="flex flex-col bg-card-foreground/5 rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">{plan.name}</CardTitle>
                                        <CardDescription>{plan.duration}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1">
                                        <p className="font-bold text-sm">{plan.rate}</p>
                                        <p className="text-lg font-bold text-primary">${plan.price}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-10" onClick={() => handlePurchase(plan, 'paid')} disabled={isSubmitting || isPending || isCurrentPlan}>
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : isPending ? 'Pending Approval' : isCurrentPlan ? 'Active Plan' : 'Subscribe'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                             )})}
                        </div>
                         {!isLoading && (!settings?.mining?.paidPlans || settings.mining.paidPlans.length === 0) && <p className="text-center text-muted-foreground py-8">No paid plans available.</p>}
                    </TabsContent>
                    <TabsContent value="nft" className="mt-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {isLoading ? Array.from({length: 2}).map((_,i) => <Skeleton key={i} className="h-48 w-full"/>) : settings?.mining?.nftPlans?.map((plan: any) => {
                                const isPending = pendingPlanPurchases.some(p => p.planId === plan.id);
                                return (
                                <Card key={plan.id} className="flex flex-col bg-card-foreground/5 rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">{plan.name}</CardTitle>
                                        <CardDescription>{plan.duration}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1 text-sm">
                                        <p>Cost: <span className="font-bold">${plan.cost}</span></p>
                                        <p>Return: <span className="font-bold text-primary">${(plan.cost + plan.profit).toFixed(2)}</span></p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-10" onClick={() => handlePurchase(plan, 'nft')} disabled={isSubmitting || isPending}>
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : isPending ? 'Pending Approval' : 'Purchase'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )})}
                        </div>
                        {!isLoading && (!settings?.mining?.nftPlans || settings.mining.nftPlans.length === 0) && <p className="text-center text-muted-foreground py-8">No NFT plans available.</p>}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
