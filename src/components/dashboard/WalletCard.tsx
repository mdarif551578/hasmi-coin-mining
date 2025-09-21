
"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Repeat, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { useUserData } from "@/hooks/use-user-data";
import { Skeleton } from "../ui/skeleton";

export function WalletCard({ className }: { className?: string }) {
    const { userData, loading } = useUserData();

    const hcBalance = userData?.wallet_balance ?? 0;
    const usdBalance = userData?.usd_balance ?? 0;

    return (
        <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wallets</CardTitle>
                <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                     {loading ? (
                        <Skeleton className="h-9 w-40" />
                    ) : (
                        <div className="text-2xl md:text-3xl font-bold">{hcBalance.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">HC</span></div>
                    )}
                    <p className="text-xs text-muted-foreground">Hasmi Coin Balance</p>
                </div>
                <Separator />
                <div>
                    {loading ? (
                         <Skeleton className="h-9 w-28" />
                    ) : (
                        <div className="text-2xl md:text-3xl font-bold">${usdBalance.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">USD</span></div>
                    )}
                    <p className="text-xs text-muted-foreground">USD Balance</p>
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button size="sm" className="w-full h-9" asChild>
                    <Link href="/deposit">
                        <Plus className="mr-2" />
                        Deposit
                    </Link>
                </Button>
                 <Button variant="secondary" size="sm" className="w-full h-9" asChild>
                    <Link href="/withdraw">
                        <ArrowUpRight className="mr-2" />
                        Withdraw
                    </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full h-9" asChild>
                    <Link href="/exchange">
                        <Repeat className="mr-2" />
                        Exchange
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
