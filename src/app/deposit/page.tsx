
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function DepositPage() {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [transactionId, setTransactionId] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Deposit Request Submitted",
            description: "Your deposit request has been received. Please wait for admin approval.",
        });
        setAmount("");
        setPhoneNumber("");
        setTransactionId("");
    };

  return (
    <div className="p-4 md:p-6">
      <Card className="rounded-2xl max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            Add funds to your wallet using bKash or Nagad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bkash" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bkash">bKash</TabsTrigger>
              <TabsTrigger value="nagad">Nagad</TabsTrigger>
            </TabsList>
            <TabsContent value="bkash">
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                <p>Please complete your bKash payment to agent number:</p>
                <p className="font-bold text-lg my-1">01928558184</p>
                <p>Then, fill the form below.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="bkash-amount">Amount (HC)</Label>
                  <Input id="bkash-amount" placeholder="e.g. 500" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bkash-phone">Your bKash Phone Number</Label>
                  <Input id="bkash-phone" placeholder="e.g. 01XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bkash-trx">bKash Transaction ID (TrxID)</Label>
                  <Input id="bkash-trx" placeholder="e.g. 8M7A9B2C1D" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full">Submit Deposit Request</Button>
              </form>
            </TabsContent>
            <TabsContent value="nagad">
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                    <p>Please complete your Nagad payment to agent number:</p>
                    <p className="font-bold text-lg my-1">01928558184</p>
                    <p>Then, fill the form below.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="nagad-amount">Amount (HC)</Label>
                        <Input id="nagad-amount" placeholder="e.g. 500" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nagad-phone">Your Nagad Phone Number</Label>
                        <Input id="nagad-phone" placeholder="e.g. 01XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nagad-trx">Nagad Transaction ID (TrxID)</Label>
                        <Input id="nagad-trx" placeholder="e.g. 8M7A9B2C1D" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Submit Deposit Request</Button>
                </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
