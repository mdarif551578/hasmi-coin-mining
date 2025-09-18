"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { paidPlans, nftPlans } from "@/lib/data";
import { Zap, Gem, ShoppingCart } from 'lucide-react';

export function MiningSection() {
    const [progress, setProgress] = useState(13);

    useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Mining Center</CardTitle>
                <CardDescription>Claim rewards and upgrade your mining capabilities.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="free">
                    <TabsList className="grid w-full grid-cols-3 text-xs h-auto">
                        <TabsTrigger value="free" className="py-2"><Zap className="mr-1 md:mr-2 size-4" />Free</TabsTrigger>
                        <TabsTrigger value="paid" className="py-2"><ShoppingCart className="mr-1 md:mr-2 size-4" />Paid Plans</TabsTrigger>
                        <TabsTrigger value="nft" className="py-2"><Gem className="mr-1 md:mr-2 size-4" />NFT Plans</TabsTrigger>
                    </TabsList>
                    <TabsContent value="free" className="mt-4">
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle>Free Claim</CardTitle>
                                <CardDescription>Claim your free Hasmi Coins every 24 hours.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>Next claim available in:</p>
                                <Progress value={progress} className="w-full" />
                                <p className="text-sm text-center text-muted-foreground">15h 47m 12s</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full h-12" disabled>Claim 10 HC</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="paid" className="mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paidPlans.map(plan => (
                                <Card key={plan.id} className="flex flex-col bg-card/50">
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>{plan.duration}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1">
                                        <p className="font-bold text-lg">{plan.rate}</p>
                                        <p className="text-2xl font-bold font-headline text-primary">${plan.price}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-12">Subscribe</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="nft" className="mt-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {nftPlans.map(plan => (
                                <Card key={plan.id} className="flex flex-col bg-card/50">
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>{plan.duration}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 flex-1">
                                        <p>Cost: <span className="font-bold">${plan.cost}</span></p>
                                        <p>Return: <span className="font-bold text-primary">${plan.profit}</span></p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full h-12">Purchase</Button>
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