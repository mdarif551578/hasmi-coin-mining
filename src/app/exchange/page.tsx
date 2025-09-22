
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Repeat, Store, Edit, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useUserData } from "@/hooks/use-user-data";
import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { ExchangeRequest } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ExchangePage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const { userData, loading: userLoading } = useUserData();
    const { settings, loading: settingsLoading } = useSettings();

    const [usdAmount, setUsdAmount] = useState("");
    const [pendingRequests, setPendingRequests] = useState<ExchangeRequest[]>([]);
    const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ExchangeRequest | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoading = userLoading || settingsLoading;
    const usdToHcRate = settings?.usd_to_hc || 0;
    const hcToReceive = usdAmount ? (parseFloat(usdAmount) * usdToHcRate).toLocaleString() : "0";

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "exchange_requests"), where("userId", "==", user.uid), where("status", "==", "pending"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const requests: ExchangeRequest[] = [];
            querySnapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() } as ExchangeRequest);
            });
            setPendingRequests(requests);
        });

        return () => unsubscribe();
    }, [user]);

     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userData) return;
        
        setIsSubmitting(true);
        const amount = parseFloat(usdAmount);

        if (amount > userData.usd_balance) {
             toast({
                title: "Insufficient Funds",
                description: "You do not have enough USD to complete this exchange.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            await addDoc(collection(db, "exchange_requests"), {
                userId: user.uid,
                usdAmount: amount,
                hcAmount: amount * usdToHcRate,
                rate: usdToHcRate,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            toast({ title: "Request Submitted", description: "Your exchange request has been submitted for admin approval." });
            setUsdAmount("");
        } catch (error) {
            console.error("Error submitting exchange request:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your request." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !userData) return;

        setIsSubmitting(true);
        const amount = parseFloat(usdAmount);
        if (amount > userData.usd_balance) {
             toast({
                title: "Insufficient Funds",
                description: "You do not have enough USD for this updated amount.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        
        try {
            const requestDocRef = doc(db, "exchange_requests", selectedRequest.id);
            await updateDoc(requestDocRef, {
                usdAmount: amount,
                hcAmount: amount * usdToHcRate,
            });
            toast({ title: "Request Updated", description: "Your exchange request has been successfully updated." });
            setUpdateDialogOpen(false);
        } catch (error) {
            console.error("Error updating request:", error);
            toast({ variant: "destructive", title: "Update Failed", description: "Could not update the request." });
        } finally {
            setIsSubmitting(false);
        }
    };

     const handleDeleteRequest = async (id: string) => {
        try {
            await deleteDoc(doc(db, "exchange_requests", id));
            toast({ title: "Request Deleted", description: "Your exchange request has been cancelled." });
        } catch (error) {
            console.error("Error deleting request:", error);
            toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the request." });
        }
    };

    const openUpdateDialog = (request: ExchangeRequest) => {
        setSelectedRequest(request);
        setUsdAmount(request.usdAmount.toString());
        setUpdateDialogOpen(true);
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

      {pendingRequests.length > 0 && (
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Manage your pending exchange requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {pendingRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-bold">${request.usdAmount.toFixed(2)} &rarr; {request.hcAmount.toLocaleString()} HC</p>
                                <p className="text-xs text-muted-foreground">Rate: 1 USD = {request.rate} HC</p>
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
                                                This will permanently delete your exchange request for ${request.usdAmount.toFixed(2)}. This action cannot be undone.
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
          <CardTitle>Exchange USD to HC</CardTitle>
          <CardDescription>
            Your request will be reviewed by an admin before the funds are exchanged.
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

            <Button type="submit" className="w-full h-10" disabled={isLoading || !userData || !usdAmount || isSubmitting}>
                <Repeat className="mr-2"/>
                {isSubmitting ? "Submitting..." : "Submit Exchange Request"}
            </Button>
            </form>
        </CardContent>
      </Card>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Update Exchange Request</DialogTitle>
                  <DialogDescription>Modify the amount of USD you want to exchange.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateRequest} className="space-y-4 pt-4">
                  <div className="space-y-2">
                      <Label htmlFor="update-amount">Amount (USD)</Label>
                      <Input id="update-amount" type="number" value={usdAmount} onChange={(e) => setUsdAmount(e.target.value)} required min="1"/>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    You will receive
                    <p className="font-bold text-xl text-primary">{hcToReceive} HC</p>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    