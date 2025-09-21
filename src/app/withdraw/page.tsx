
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { user, pendingWithdrawals as initialPendingWithdrawals } from "@/lib/data";
import { ArrowUpRight, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { WithdrawalRequest } from "@/lib/types";

export default function WithdrawPage() {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<"bkash" | "nagad" | "">("");
    const [accountInfo, setAccountInfo] = useState("");

    // State for managing pending withdrawals
    const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>(initialPendingWithdrawals);
    const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

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
        toast({
            title: "Withdrawal Request Submitted",
            description: `Your request to withdraw $${amount} has been received and is pending approval.`,
        });
        // In a real app, this would be sent to a backend and we would get an ID back
        const newRequest: WithdrawalRequest = {
            id: `wd-${Date.now()}`,
            amount: withdrawAmount,
            method: method as "bkash" | "nagad",
            accountInfo,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
        };
        setPendingWithdrawals(prev => [...prev, newRequest]);

        setAmount("");
        setMethod("");
        setAccountInfo("");
    };

    const handleUpdateRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        
        const updatedAmount = parseFloat(amount);
        if (updatedAmount > user.usdBalance) {
             toast({
                title: "Insufficient USD Balance",
                description: "You do not have enough funds for this updated amount.",
                variant: "destructive",
            });
            return;
        }

        setPendingWithdrawals(prev => 
            prev.map(req => 
                req.id === selectedRequest.id 
                ? { ...req, amount: updatedAmount, method: method as "bkash" | "nagad", accountInfo } 
                : req
            )
        );

        toast({
            title: "Request Updated",
            description: "Your withdrawal request has been successfully updated.",
        });

        setUpdateDialogOpen(false);
        setSelectedRequest(null);
        setAmount("");
        setMethod("");
        setAccountInfo("");
    };

    const handleDeleteRequest = (id: string) => {
        setPendingWithdrawals(prev => prev.filter(req => req.id !== id));
        toast({
            title: "Request Deleted",
            description: "Your withdrawal request has been cancelled.",
        });
    };

    const openUpdateDialog = (request: WithdrawalRequest) => {
        setSelectedRequest(request);
        setAmount(request.amount.toString());
        setMethod(request.method);
        setAccountInfo(request.accountInfo);
        setUpdateDialogOpen(true);
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

            {pendingWithdrawals.length > 0 && (
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Pending Requests</CardTitle>
                        <CardDescription>Manage your pending withdrawal requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingWithdrawals.map(request => (
                             <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="font-bold">${request.amount.toFixed(2)} <span className="text-sm font-normal text-muted-foreground capitalize">({request.method})</span></p>
                                    <p className="text-xs text-muted-foreground">{request.accountInfo}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openUpdateDialog(request)}>
                                        <Edit className="size-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete your withdrawal request for ${request.amount.toFixed(2)}. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteRequest(request.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Submit New Withdrawal Request</CardTitle>
                    <CardDescription>
                        Your request will be manually reviewed by an admin. This may take up to 24 hours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-method">Withdrawal Method</Label>
                             <Select onValueChange={(value) => setMethod(value as "bkash" | "nagad")} value={method}>
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

            {/* Dialog for Updating Request */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Withdrawal Request</DialogTitle>
                        <DialogDescription>Modify the details of your pending request.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateRequest} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="update-withdraw-method">Withdrawal Method</Label>
                             <Select onValueChange={(value) => setMethod(value as "bkash" | "nagad")} value={method}>
                                <SelectTrigger id="update-withdraw-method">
                                    <SelectValue placeholder="Select a method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bkash">bKash</SelectItem>
                                    <SelectItem value="nagad">Nagad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="update-amount">Amount (USD)</Label>
                            <Input
                                id="update-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="update-account-info">Account Information</Label>
                            <Input
                                id="update-account-info"
                                value={accountInfo}
                                onChange={(e) => setAccountInfo(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={!method || !amount || !accountInfo}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
