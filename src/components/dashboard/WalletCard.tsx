"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { user } from "@/lib/data";
import { Wallet, Plus, ArrowUpRight } from "lucide-react";

export function WalletCard({ className }: { className?: string }) {
    return (
        <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl md:text-4xl font-bold font-headline">{user.walletBalance.toLocaleString()} HC</div>
                <p className="text-xs text-muted-foreground">Hasmi Coin</p>
            </CardContent>
            <CardFooter className="gap-2 flex-col sm:flex-row">
                <Button className="w-full h-11 md:h-12">
                    <Plus className="mr-2" />
                    Deposit
                </Button>
                <Button variant="secondary" className="w-full h-11 md:h-12">
                    <ArrowUpRight className="mr-2" />
                    Withdraw
                </Button>
            </CardFooter>
        </Card>
    );
}
