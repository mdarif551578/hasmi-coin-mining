"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { paidPlans, nftPlans } from "@/lib/data";
import { Zap, Gem, ShoppingCart } from 'lucide-react';

export function MiningSection() {
    const [progress, setProgress] = useState(13);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Card className="rounded-2xl w-full">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Mining Center</CardTitle>
                <CardDescription>Claim rewards and upgrade your mining capabilities.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="free" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 text-xs h-auto">
                        <TabsTrigger value="free" className="py-2 gap-1 md:gap-2"><Zap className="size-4" />Free</TabsTrigger>
                        <TabsTrigger value="paid" className="py-2 gap-1 md:gap-2"><ShoppingCart className="size-4" />Paid</TabsTrigger>
                        <TabsTrigger value="nft" className="py-2 gap-1 md:gap-2"><Gem className="size-4" />NFT</TabsTrigger>
                    </TabsList>
                    <TabsContent value="free" className="mt-4">
                        <Card className="bg-card-foreground/5">
                            <CardHeader>
                                <CardTitle className="text-base md:text-lg">Free Claim</CardTitle>
                                <CardDescription>Claim your free Hasmi Coins every 24 hours.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm">Next claim available in:</p>
                                <div className='relative w-[120px] h-[120px] mx-auto flex items-center justify-center'>
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
                                            className="stroke-current text-primary"
                                            fill="none"
                                            strokeWidth="2"
                                            strokeDasharray={`${progress}, 100`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <p className="text-2xl md:text-3xl font-bold">15:47:12</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full h-11 md:h-12" disabled>Claim 10 HC</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="paid" className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            {paidPlans.map(plan => (
                                <Card key={plan.id} className="flex flex-col bg-card-foreground/5">
                                    <CardHeader>
                                        <CardTitle className="text-base md:text-lg">{plan.name}</CardTitle>
                                        <CardDescription>{plan.duration}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1">
                                        <p className="font-bold text-base md:text-lg">{plan.rate}</p>
                                        <p className="text-xl md:text-2xl font-bold font-headline text-primary">${plan.price}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-11 md:h-12">Subscribe</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="nft" className="mt-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            {nftPlans.map(plan => (
                                <Card key={plan.id} className="flex flex-col bg-card-foreground/5">
                                    <CardHeader>
                                        <CardTitle className="text-base md:text-lg">{plan.name}</CardTitle>
                                        <CardDescription>{plan.duration}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1 text-sm md:text-base">
                                        <p>Cost: <span className="font-bold">${plan.cost}</span></p>
                                        <p>Return: <span className="font-bold text-primary">${plan.profit}</span></p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-11 md:h-12">Purchase</Button>
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
