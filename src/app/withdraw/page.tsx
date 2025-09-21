
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { user } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export default function WithdrawPage() {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("");
    const [accountInfo, setAccountInfo] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);
        if (withdrawAmount > user.usdBalance) {
            toast({
                title: "Insufficient USD Balance",
                description: "You do not have enough funds to complete this withdrawal.",
                variant: "destructive",
            });
            return;
        }

        // Here you would typically send the request to your backend to be stored in Firebase
        // with a 'pending' status for admin approval.
        toast({
            title: "Withdrawal Request Submitted",
            description: `Your request to withdraw $${amount} has been received and is pending approval.`,
        });
        setAmount("");
        setMethod("");
        setAccountInfo("");
    };

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Withdraw Funds</h1>
            </div>
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Your USD Balance</CardTitle>
                    <CardDescription>Funds available for withdrawal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">${user.usdBalance.toFixed(2)}</div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Submit Withdrawal Request</CardTitle>
                    <CardDescription>
                        Your request will be manually reviewed by an admin. This may take up to 24 hours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-method">Withdrawal Method</Label>
                             <Select onValueChange={setMethod} value={method}>
                                <SelectTrigger id="withdraw-method">
                                    <SelectValue placeholder="Select a method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bkash">bKash</SelectItem>
                                    <SelectItem value="nagad">Nagad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (USD)</Label>
                            <Input
                                id="amount"
                                placeholder="e.g., 10"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-info">Account Information</Label>
                            <Input
                                id="account-info"
                                placeholder="e.g., Your bKash/Nagad number"
                                value={accountInfo}
                                onChange={(e) => setAccountInfo(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full h-10" disabled={!method || !amount || !accountInfo}>
                            <ArrowUpRight className="mr-2" />
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
