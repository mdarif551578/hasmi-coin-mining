
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, Gem, ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { useUserData } from '@/hooks/use-user-data';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '../ui/skeleton';

export function MiningSection() {
    const { toast } = useToast();
    const { settings, loading: settingsLoading } = useSettings();
    const { userData, loading: userLoading } = useUserData();
    const { user } = useAuth();
    const [isClaiming, setIsClaiming] = useState(false);

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
             // The onSnapshot listener for userData will update the timer automatically
        } catch (error) {
            console.error("Error claiming reward:", error);
            toast({ variant: 'destructive', title: "Claim Failed", description: "Could not claim your reward." });
        } finally {
            setIsClaiming(false);
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
                                        {isClaiming && <Loader2 className="animate-spin mr-2"/>}
                                        Claim {freeClaimReward} HC
                                    </Button>
                                </CardFooter>
                                </>
                             )}
                        </Card>
                    </TabsContent>
                    <TabsContent value="paid" className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {isLoading ? Array.from({length: 2}).map((_,i) => <Skeleton key={i} className="h-48 w-full"/>) : settings?.mining?.paidPlans?.map((plan: any) => (
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
                                        <Button className="w-full h-10" disabled>Subscribe</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                         {!isLoading && !settings?.mining?.paidPlans?.length && <p className="text-center text-muted-foreground py-8">No paid plans available.</p>}
                    </TabsContent>
                    <TabsContent value="nft" className="mt-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {isLoading ? Array.from({length: 2}).map((_,i) => <Skeleton key={i} className="h-48 w-full"/>) : settings?.mining?.nftPlans?.map((plan: any) => (
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
                                        <Button className="w-full h-10" disabled>Purchase</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        {!isLoading && !settings?.mining?.nftPlans?.length && <p className="text-center text-muted-foreground py-8">No NFT plans available.</p>}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

    