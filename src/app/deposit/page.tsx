
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import type { DepositRequest } from "@/lib/types";
import { Edit, Repeat, Trash2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";

type DepositMethod = "bkash" | "nagad";

export default function DepositPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const { settings, loading: settingsLoading } = useSettings();
    
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [method, setMethod] = useState<DepositMethod>("bkash");

    const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([]);
    const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "deposits"), where("userId", "==", user.uid), where("status", "==", "pending"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const requests: DepositRequest[] = [];
            querySnapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() } as DepositRequest);
            });
            setPendingDeposits(requests);
        });

        return () => unsubscribe();
    }, [user]);
    
    const resetForm = () => {
        setAmount("");
        setPhoneNumber("");
        setTransactionId("");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !method) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, "deposits"), {
                userId: user.uid,
                amount: parseFloat(amount),
                method,
                phoneNumber,
                transactionId,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Deposit Request Submitted",
                description: "Your deposit request has been received. Please wait for admin approval.",
            });
            resetForm();
        } catch (error) {
            console.error("Error submitting deposit:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your request. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !method) return;
        
        setIsLoading(true);
        try {
            const requestDocRef = doc(db, "deposits", selectedRequest.id);
            await updateDoc(requestDocRef, {
                amount: parseFloat(amount),
                method,
                phoneNumber,
                transactionId,
            });
            toast({ title: "Request Updated", description: "Your deposit request has been successfully updated." });
            setUpdateDialogOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error("Error updating request:", error);
            toast({ variant: "destructive", title: "Update Failed", description: "Could not update the request." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRequest = async (id: string) => {
        try {
            await deleteDoc(doc(db, "deposits", id));
            toast({ title: "Request Deleted", description: "Your deposit request has been cancelled." });
        } catch (error) {
            console.error("Error deleting request:", error);
            toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the request." });
        }
    };

    const openUpdateDialog = (request: DepositRequest) => {
        setSelectedRequest(request);
        setAmount(request.amount.toString());
        setMethod(request.method as DepositMethod);
        setPhoneNumber(request.phoneNumber);
        setTransactionId(request.transactionId);
        setUpdateDialogOpen(true);
    };

    useEffect(() => {
        // Reset form fields when tab changes
        setAmount("");
        setPhoneNumber("");
        setTransactionId("");
    }, [method]);


    const currentMethodSettings = settings?.deposit_methods?.[method];
    const hcConversionRate = settings?.usd_to_hc || 0;
    const usdAmountNumber = parseFloat(amount) || 0;
    const bdtToReceive = usdAmountNumber * (currentMethodSettings?.rate || 0);

    const renderForm = (formMethod: DepositMethod) => {
        const methodSettings = settings?.deposit_methods?.[formMethod];
        return (
            <>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                    {settingsLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <>
                            <p>Please complete your {formMethod} payment to agent number:</p>
                            <p className="font-bold text-lg my-1">{methodSettings?.agent_number || "Not available"}</p>
                            <p>Then, fill out the form below.</p>
                        </>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor={`${formMethod}-amount`}>Amount (USD)</Label>
                        <Input id={`${formMethod}-amount`} placeholder="e.g. 10" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${formMethod}-phone`}>Your {formMethod} Phone Number</Label>
                        <Input id={`${formMethod}-phone`} placeholder="e.g. 01XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${formMethod}-trx`}>{formMethod} Transaction ID (TrxID)</Label>
                        <Input id={`${formMethod}-trx`} placeholder="e.g. 8M7A9B2C1D" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                    </div>
                     <div className="p-3 my-2 bg-muted/50 rounded-lg text-center text-sm">
                        <p>You will send</p>
                        <p className="font-bold text-lg text-primary">{bdtToReceive.toLocaleString()} {currentMethodSettings?.currency || ''}</p>
                    </div>
                    <Button type="submit" className="w-full h-10" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit Deposit Request"}</Button>
                </form>
            </>
        )
    };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Deposit USD</h1>
       </div>

        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Repeat className="size-5 text-primary" />
                    <span>Live Exchange Rates</span>
                </CardTitle>
                 <CardDescription>
                    The current rates for deposits and conversion to Hasmi Coin (HC).
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {settingsLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-40" />
                    </div>
                 ) : (
                    <div className="space-y-3 text-lg font-bold">
                        <div className="flex items-center gap-2">
                           <span>1 USD</span>
                           <ArrowRight className="size-4 text-muted-foreground"/>
                           <span>{currentMethodSettings?.rate || 0} {currentMethodSettings?.currency || ''}</span> 
                           <span className="text-sm font-normal text-muted-foreground capitalize">({method})</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span>1 USD</span>
                           <ArrowRight className="size-4 text-muted-foreground"/>
                           <span>{hcConversionRate.toLocaleString()} HC</span>
                        </div>
                    </div>
                 )}
            </CardContent>
        </Card>
      
       {pendingDeposits.length > 0 && (
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Manage your pending deposit requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {pendingDeposits.map(request => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-bold">${request.amount.toFixed(2)} <span className="text-sm font-normal text-muted-foreground capitalize">({request.method})</span></p>
                                <p className="text-xs text-muted-foreground">TrxID: {request.transactionId}</p>
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
                                                This will permanently delete your deposit request for ${request.amount.toFixed(2)}. This action cannot be undone.
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
          <CardTitle>Submit New Deposit</CardTitle>
          <CardDescription>
            Add funds to your wallet using bKash or Nagad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bkash" className="w-full" onValueChange={(value) => setMethod(value as DepositMethod)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bkash">bKash</TabsTrigger>
              <TabsTrigger value="nagad">Nagad</TabsTrigger>
            </TabsList>
            <TabsContent value="bkash">
              {renderForm("bkash")}
            </TabsContent>
            <TabsContent value="nagad">
              {renderForm("nagad")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Dialog for Updating Request */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Update Deposit Request</DialogTitle>
                  <DialogDescription>Modify the details of your pending request.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateRequest} className="space-y-4 pt-4">
                  <div className="space-y-2">
                      <Label htmlFor="update-method">Method</Label>
                       <Select onValueChange={(value) => setMethod(value as DepositMethod)} value={method}>
                          <SelectTrigger id="update-method">
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
                      <Input id="update-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="update-phone">Phone Number</Label>
                      <Input id="update-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="update-trx">Transaction ID (TrxID)</Label>
                      <Input id="update-trx" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}

    