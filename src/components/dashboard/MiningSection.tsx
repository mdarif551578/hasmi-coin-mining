"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { paidPlans, nftPlans } from "@/lib/data";
import { Zap, Gem, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export function MiningSection() {
    const [timeRemaining, setTimeRemaining] = useState(TWENTY_FOUR_HOURS_IN_SECONDS);
    const { toast } = useToast();

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);
    
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleClaim = () => {
        toast({
            title: "Claim Successful!",
            description: "You've received 10 Hasmi Coins.",
        });
        setTimeRemaining(TWENTY_FOUR_HOURS_IN_SECONDS);
    };

    const progress = ((TWENTY_FOUR_HOURS_IN_SECONDS - timeRemaining) / TWENTY_FOUR_HOURS_IN_SECONDS) * 100;
    const canClaim = timeRemaining === 0;

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
                                <CardDescription>Claim your free Hasmi Coins every 24 hours.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-center">Next claim available in:</p>
                                <div className='relative w-[180px] h-[180px] mx-auto flex items-center justify-center'>
                                     <svg className="absolute w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            className="stroke-current text-secondary"
                                            fill="none"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
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
                                <Button className="w-full h-10" disabled={!canClaim} onClick={handleClaim}>Claim 10 HC</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="paid" className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {paidPlans.map(plan => (
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
                                        <Button className="w-full h-10">Subscribe</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="nft" className="mt-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {nftPlans.map(plan => (
                                <Card key={plan.id} className="flex flex-col bg-card-foreground/5 rounded-xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">{plan.name}</CardTitle>
                                        <CardDescription>{plan.duration}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1 text-sm">
                                        <p>Cost: <span className="font-bold">${plan.cost}</span></p>
                                        <p>Return: <span className="font-bold text-primary">${plan.profit}</span></p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-10">Purchase</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
