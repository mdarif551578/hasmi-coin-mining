
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Repeat, Store } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useUserData } from "@/hooks/use-user-data";
import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExchangePage() {
    const { toast } = useToast();
    const [usdAmount, setUsdAmount] = useState("");
    const { userData, loading: userLoading } = useUserData();
    const { settings, loading: settingsLoading } = useSettings();

    const isLoading = userLoading || settingsLoading;
    const usdToHcRate = settings?.usd_to_hc || 0;

    const hcToReceive = usdAmount ? (parseFloat(usdAmount) * usdToHcRate).toLocaleString() : "0";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData) return;
        
        const amount = parseFloat(usdAmount);
        if (amount > userData.usd_balance) {
             toast({
                title: "Insufficient Funds",
                description: "You do not have enough USD to complete this exchange.",
                variant: "destructive",
            });
            return;
        }

        // TODO: Implement actual exchange logic here (update user balances in Firestore)
        toast({
            title: "Exchange Successful",
            description: `You have exchanged $${usdAmount} for ${hcToReceive} HC.`,
        });
        setUsdAmount("");
    };

    const hcBalance = userData?.wallet_balance ?? 0;
    const usdBalance = userData?.usd_balance ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <h1 className="text-xl font-bold">Exchange</h1>
         <Button asChild variant="outline" size="sm">
            <Link href="/marketplace">
                <Store className="mr-2"/>
                P2P Market
            </Link>
        </Button>
       </div>
       <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Your Balances</CardTitle>
          <CardDescription>Your available funds for exchange.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div>
                 {isLoading ? (
                    <Skeleton className="h-8 w-32 mb-1" />
                ) : (
                    <div className="text-2xl font-bold">${usdBalance.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">USD</span></div>
                )}
                <p className="text-xs text-muted-foreground">USD Balance</p>
            </div>
            <Separator />
            <div>
                 {isLoading ? (
                    <Skeleton className="h-8 w-40 mb-1" />
                ) : (
                    <div className="text-2xl font-bold">{hcBalance.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">HC</span></div>
                 )}
                <p className="text-xs text-muted-foreground">Hasmi Coin Balance</p>
            </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Exchange USD to HC</CardTitle>
          <CardDescription>
            Convert your USD balance into Hasmi Coin (HC). The exchange rate is fixed.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-3 my-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm">Exchange Rate</p>
                {isLoading ? (
                    <Skeleton className="h-7 w-32 mx-auto" />
                ) : (
                     <p className="font-bold text-lg">1 USD = {usdToHcRate} HC</p>
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="usd-amount">Amount (USD)</Label>
                <Input 
                    id="usd-amount" 
                    placeholder="e.g. 10" 
                    type="number" 
                    value={usdAmount} 
                    onChange={(e) => setUsdAmount(e.target.value)} 
                    required 
                    min="1"
                    disabled={isLoading || !userData}
                />
            </div>

            <div className="text-center text-sm text-muted-foreground">
                You will receive
                <p className="font-bold text-xl text-primary">{hcToReceive} HC</p>
            </div>

            <Button type="submit" className="w-full h-10" disabled={isLoading || !userData || !usdAmount}>
                <Repeat className="mr-2"/>
                Confirm Exchange
            </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
