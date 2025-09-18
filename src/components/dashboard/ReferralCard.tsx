"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Copy } from "lucide-react";
import { user } from "@/lib/data";

export function ReferralCard({ className }: { className?: string }) {
    const { toast } = useToast();

    const copyToClipboard = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(user.referralCode);
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
                    <Input value={user.referralCode} readOnly className="font-mono text-sm h-9" />
                    <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
