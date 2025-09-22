
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Copy } from "lucide-react";
import { useUserData } from "@/hooks/use-user-data";
import { Skeleton } from "../ui/skeleton";

export function ReferralCard({ className }: { className?: string }) {
    const { toast } = useToast();
    const { userData, loading } = useUserData();
    const referralCode = userData?.referral_code || '';

    const copyToClipboard = () => {
        if (navigator.clipboard && referralCode) {
            navigator.clipboard.writeText(referralCode);
            toast({
                title: "Copied!",
                description: "Referral code copied to clipboard.",
            });
        }
    };

    return (
        <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Referral Code</CardTitle>
                <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">Share this code to earn bonuses!</p>
                <div className="flex items-center space-x-2 mt-2">
                    {loading ? (
                        <Skeleton className="h-9 w-full" />
                    ) : (
                         <Input value={referralCode} readOnly className="font-mono text-sm h-9" />
                    )}
                    <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={copyToClipboard} disabled={loading || !referralCode}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
